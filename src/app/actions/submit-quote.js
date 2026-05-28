"use server";

import { Resend } from "resend";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import OpenAI from "openai";
import PRICEBOOK from "@/data/pricebook/pricebook.json";

const resend = new Resend(process.env["RESEND_API_KEY"]);
const openai = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
const R2_PUBLIC_URL = "https://media.skilledplumbingservices.com";

// ============================================================
// STEP 1 — Upload photos, run AI, return questions to client
// ============================================================
export async function analyseQuote(formData) {
  console.log("🚀 analyseQuote called");

  try {
    // 1. Turnstile
    const token = formData.get("cf-turnstile-response");
    if (!token) return { success: false, error: "Please complete the security check." };

    const verificationResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(process.env["TURNSTILE_SECRET_KEY"])}&response=${encodeURIComponent(token.toString())}`,
    });
    const verificationData = await verificationResponse.json();
    if (!verificationData.success) return { success: false, error: "Security verification failed. Please try again." };

    // 2. Extract fields
    const name        = formData.get("name")        || "";
    const phone       = formData.get("phone")       || "";
    const email       = formData.get("email")       || "";
    const address     = formData.get("address")     || "";
    const description = formData.get("description") || "";
    const files       = formData.getAll("photo");

    if (files.length > MAX_FILES) return { success: false, error: `Maximum of ${MAX_FILES} photos allowed.` };

    // 3. Upload photos to R2
    const { env } = await getCloudflareContext({ async: true });
    const photoUrls = [];

    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;
      if (file.size > MAX_FILE_SIZE_BYTES) return { success: false, error: `Each photo must be under ${MAX_FILE_SIZE_MB}MB.` };
      if (!ALLOWED_MIME_TYPES.includes(file.type)) return { success: false, error: "Invalid file format. Only images are allowed." };

      const buffer   = Buffer.from(await file.arrayBuffer());
      const fileName = `quotes/${Date.now()}-${file.name.replaceAll(" ", "_")}`;
      await env.R2_BUCKET.put(fileName, buffer, { httpMetadata: { contentType: file.type } });
      photoUrls.push(`${R2_PUBLIC_URL}/${fileName}`);
    }

    // 4. AI analysis
    let aiResult = null;

    try {
      const imageContentBlocks = await Promise.all(
        files.map(async (file) => {
          if (!(file instanceof File) || file.size === 0) return null;
          const base64String = Buffer.from(await file.arrayBuffer()).toString("base64");
          return { type: "image_url", image_url: { url: `data:${file.type};base64,${base64String}` } };
        })
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an expert quoting assistant for a professional plumbing service.
            Analyze the customer's description and photos to identify all plumbing work likely required.

            AUTHORIZED PRICEBOOK:
            ${JSON.stringify(PRICEBOOK, null, 2)}

            INSTRUCTIONS:
            1. Identify ALL services from the pricebook that apply to this job — a single job may need more than one line item.
            2. For each matched service, use its exact "service_name" as the description and its "total_estimated_price" as the price. Do not alter prices.
            3. "estimated_total" must be the sum of all matched line item prices.
            4. "summary" must be one plain-English sentence a busy tradie can read in 2 seconds — e.g. "Dripping wall-mounted shower tap likely needing a full shower set replacement."
            5. "visual_observations" should list 2–4 specific things you can see in the photos that informed your assessment.
            6. "diagnostic_questions": include the "required_questions" from matched pricebook items ONLY if the answer would materially change the recommended service or price. If the customer's description and photos already make the job clear, return an empty array. Never force questions for the sake of it.
            7. For "urgency_score" use this scale strictly:
               1 = Routine — no active leak, cosmetic or convenience issue, book within weeks
               2 = Soon — minor drip or wear, book within a week
               3 = Moderate — noticeable leak or dysfunction, book within a few days
               4 = Urgent — active leak with damage risk, prioritise this week
               5 = Emergency — water damage occurring now or risk of flooding, same-day response needed

            Return a valid JSON object matching this schema exactly:
            {
              "summary": "string",
              "urgency_score": number (1-5),
              "urgency_label": "string (e.g. Routine / Soon / Moderate / Urgent / Emergency)",
              "estimated_total": number,
              "visual_observations": ["string"],
              "recommended_line_items": [{ "description": "string", "estimated_price": number }],
              "diagnostic_questions": ["string"]
            }`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Customer notes: "${description}"` },
              ...imageContentBlocks.filter(Boolean),
            ],
          },
        ],
      });

      aiResult = JSON.parse(completion.choices[0].message.content || "{}");
      console.log("✅ AI analysis complete:", aiResult);
    } catch (aiError) {
      console.error("⚠️ AI analysis failed:", aiError);
    }

    return {
      success: true,
      questions: aiResult?.diagnostic_questions ?? [],
      photoUrls,
      aiResult,
      formFields: { name, phone, email, address, description },
    };

  } catch (error) {
    console.error("analyseQuote error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

// ============================================================
// STEP 2 — Build email and send
// ============================================================
export async function submitQuote({ formFields, photoUrls, aiResult, answers }) {
  try {
    const { name, phone, email, address, description } = formFields;

    // AI block
    let aiHtmlBlock = "";
    let emailSubjectSuffix = "";

    if (aiResult) {
      const urgencyScore  = aiResult.urgency_score ?? 1;
      const urgencyColors = {
        bg:   urgencyScore >= 4 ? "#fee2e2" : urgencyScore === 3 ? "#fef9c3" : "#dcfce7",
        text: urgencyScore >= 4 ? "#991b1b" : urgencyScore === 3 ? "#854d0e" : "#166534",
      };

      const lineItemsHtml = aiResult.recommended_line_items?.map((item) =>
        `<tr>
          <td style="padding: 8px 0; color: #475569; border-bottom: 1px solid #f1f5f9;">${escapeHtml(item.description)}</td>
          <td style="padding: 8px 0; color: #1e293b; font-weight: bold; text-align: right; border-bottom: 1px solid #f1f5f9;">$${item.estimated_price}</td>
        </tr>`
      ).join("") || `<tr><td colspan="2" style="color:#94a3b8;">No specific items identified</td></tr>`;

      const observationsHtml = aiResult.visual_observations?.map((o) =>
        `<li style="margin-bottom: 4px;">${escapeHtml(o)}</li>`
      ).join("") || "";

      const estimatedTotal = aiResult.estimated_total ?? 0;
      emailSubjectSuffix   = ` — est. $${estimatedTotal}`;

      aiHtmlBlock = `
        <!-- SUMMARY CARD -->
        <div style="background-color: #1e293b; color: #ffffff; padding: 20px 24px; border-radius: 8px; margin-bottom: 16px;">
          <p style="margin: 0 0 12px 0; font-size: 17px; line-height: 1.4;">${escapeHtml(aiResult.summary ?? "")}</p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
            <span style="font-size: 24px; font-weight: bold; color: #38bdf8;">$${estimatedTotal}</span>
            <span style="background-color: ${urgencyColors.bg}; color: ${urgencyColors.text}; padding: 3px 10px; border-radius: 12px; font-size: 13px; font-weight: 600;">${escapeHtml(aiResult.urgency_label ?? `Urgency ${urgencyScore}/5`)}</span>
          </div>
        </div>

        <!-- LINE ITEMS -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 20px; border-radius: 6px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 12px 0; color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Suggested quote items</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            ${lineItemsHtml}
            <tr>
              <td style="padding-top: 12px; color: #1e293b; font-weight: bold;">Estimated Total</td>
              <td style="padding-top: 12px; color: #1e293b; font-weight: bold; text-align: right;">$${estimatedTotal}</td>
            </tr>
          </table>
        </div>

        ${observationsHtml ? `
        <!-- WHAT THE AI SAW -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px 20px; border-radius: 6px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">What the AI observed in the photos</h4>
          <ul style="margin: 0; padding-left: 18px; color: #64748b; font-size: 14px;">
            ${observationsHtml}
          </ul>
        </div>` : ""}
      `;
    }

    // Customer answers block (only renders if at least one answer was given)
    const validAnswers   = answers?.filter((a) => a.answer?.trim()) ?? [];
    const answersHtmlBlock = validAnswers.length > 0 ? `
      <!-- CUSTOMER ANSWERS -->
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #22c55e; padding: 16px 20px; border-radius: 6px; margin-bottom: 16px;">
        <h4 style="margin: 0 0 12px 0; color: #15803d; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Customer's additional info</h4>
        ${validAnswers.map((a) => `
          <div style="margin-bottom: 12px;">
            <p style="margin: 0; color: #64748b; font-size: 13px;">${escapeHtml(a.question)}</p>
            <p style="margin: 4px 0 0; color: #1e293b; font-size: 15px; font-weight: 500;">${escapeHtml(a.answer)}</p>
          </div>
        `).join("")}
      </div>
    ` : "";

    await resend.emails.send({
      from: "Skilled Quotes <quotes@skilledplumbingservices.com>",
      to: "filter-clothes.0j@icloud.com",
      subject: `New Quote: ${name}${emailSubjectSuffix}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; color: #333;">

          ${aiHtmlBlock}
          ${answersHtmlBlock}

          <!-- CUSTOMER DETAILS -->
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 6px;">
            <h4 style="margin: 0 0 12px 0; color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Customer details</h4>
            <p style="margin: 4px 0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p style="margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${escapeHtml(phone)}" style="color: #3b82f6;">${escapeHtml(phone)}</a></p>
            <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color: #3b82f6;">${escapeHtml(email)}</a></p>
            <p style="margin: 4px 0;"><strong>Address:</strong> ${escapeHtml(address)}</p>
            <p style="margin: 4px 0;"><strong>Their description:</strong><br/>
            <span style="color: #475569;">${escapeHtml(description)}</span></p>
          </div>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />

          <h3>Photos (${photoUrls.length})</h3>
          ${photoUrls.length
            ? photoUrls.map((url) => `
              <div style="margin-bottom:15px;">
                <img src="${url}" style="width:100%; max-width:400px; border-radius:8px; border: 1px solid #e2e8f0;" />
                <br/>
                <a href="${url}" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 14px;">View full size</a>
              </div>
            `).join("")
            : "<p>No photos uploaded</p>"
          }
        </div>
      `,
    });

    return { success: true };

  } catch (error) {
    console.error("submitQuote error:", error);
    return { success: false, error: "Failed to send your request. Please try again." };
  }
}
