"use server";

import { Resend } from "resend";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import OpenAI from "openai";
import PRICEBOOK from "@/data/pricebook/pricebook.json";

// Initialize Resend and OpenAI
const resend = new Resend(process.env["RESEND_API_KEY"]);
const openai = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });

// Basic HTML escape to prevent broken emails
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// SECURITY CONSTANTS
const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 5; 
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
];

const R2_PUBLIC_URL = "https://media.skilledplumbingservices.com";



export async function submitQuote(formData) {
  // Rocket Log to verify Next.js routes to this file!
  console.log("🚀 SERVER ACTION IS RUNNING! Received form data keys:", Array.from(formData.keys()));

  try {
    // ==========================================
    // 1. TURNSTILE SECURITY CHECK (FAIL FAST)
    // ==========================================
    const token = formData.get('cf-turnstile-response');

    if (!token) {
      console.log("❌ Blocked submission: Missing Turnstile token");
      return { success: false, error: 'Please complete the security check.' };
    }

    const verifyEndpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const secretKey = process.env["TURNSTILE_SECRET_KEY"]; 

    const verificationResponse = await fetch(verifyEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token.toString())}`,
    });

    const verificationData = await verificationResponse.json();

    if (!verificationData.success) {
      console.log("❌ Turnstile verification failed:", verificationData['error-codes']);
      return { success: false, error: 'Security verification failed. Please try again.' };
    }

    // ==========================================
    // 2. PROCESS UPLOADS & DATA
    // ==========================================
    const { env } = await getCloudflareContext({ async: true });
    const files = formData.getAll("photo");

    if (files.length > MAX_FILES) {
      return { success: false, error: `Maximum of ${MAX_FILES} photos allowed.` };
    }

    const name = formData.get("name") || "";
    const phone = formData.get("phone") || "";
    const email = formData.get("email") || "";
    const address = formData.get("address") || "";
    const description = formData.get("description") || "";

    let photoUrls = [];

    if (Array.isArray(files)) {
      for (const file of files) {
        if (!(file instanceof File) || file.size === 0) continue;
        if (file.size > MAX_FILE_SIZE_BYTES) {
          return { success: false, error: `Each photo must be under ${MAX_FILE_SIZE_MB}MB.` };
        }
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          return { success: false, error: "Invalid file format. Only images are allowed." };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `quotes/${Date.now()}-${file.name.replaceAll(" ", "_")}`;

        await env.R2_BUCKET.put(fileName, buffer, {
          httpMetadata: { contentType: file.type },
        });

        photoUrls.push(`${R2_PUBLIC_URL}/${fileName}`);
      }
    }

    // ==========================================
    // 3. THE AI INTERCEPT (Safe Try/Catch)
    // ==========================================
    let aiTriage = null;
    
 if (files.length > 0) {
      try {
        console.log("🤖 Starting Live AI Triage analysis via Base64...");
        
        const imageContentBlocks = await Promise.all(files.map(async (file) => {
          if (!(file instanceof File) || file.size === 0) return null;
          
          // Convert the incoming file buffer directly into a base64 string
          const arrayBuffer = await file.arrayBuffer();
          const base64String = Buffer.from(arrayBuffer).toString("base64");
          
          return {
            type: "image_url",
            image_url: {
              url: `data:${file.type};base64,${base64String}` // Explicit data URI
            }
          };
        }));

        // Filter out any null entries from failed files
        const validImageBlocks = imageContentBlocks.filter(Boolean);

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          response_format: { type: "json_object" }, 
         messages: [
            {
              role: "system",
              content: `You are an expert quoting assistant for a professional plumbing service. 
              Analyze the customer description and attached photos to diagnose the tapware defect.
              
              Compare visual elements in the photos against the "search_keywords" provided in the authorized pricebook below.
              
              AUTHORIZED PRICEBOOK:
              ${JSON.stringify(PRICEBOOK, null, 2)}
              
              CRITICAL INSTRUCTIONS:
              1. Map the problem to the single most appropriate "service_id" in the pricebook.
              2. Extract its "total_estimated_price" and "customer_description" exactly as written. Do not alter the price or currency.
              3. For "diagnostic_questions", you MUST output the exact string array located inside the chosen item's "required_questions" field. Do not invent new questions.
              
              You must return your response as a valid json object strictly matching this schema:
              {
                "classification": "string",
                "urgency_score": number (1-5),
                "visual_observations": ["string"],
                "recommended_line_items": [
                  {
                    "service_id": "string",
                    "description": "string",
                    "estimated_price": number
                  }
                ],
                "diagnostic_questions": ["string"]
              }`
            },
            {
              role: "user",
              content: [
                { type: "text", text: `Customer notes: "${description}"` },
                ...validImageBlocks // Your base64 data array
              ],
            },
          ],
        });

        aiTriage = JSON.parse(completion.choices[0].message.content || "{}");
        console.log("✅ AI Triage successful:", aiTriage);
      } catch (aiError) {
        console.error("⚠️ AI Triage skipped/failed:", aiError);
      }
    }

    // ==========================================
    // 4. SEND EMAIL NOTIFICATION
    // ==========================================
    let aiHtmlBlock = "";
    if (aiTriage) {
const lineItemsHtml = aiTriage.recommended_line_items?.map((item) => 
        `<li>[${item.service_id}] ${item.description}: <strong>$${item.estimated_price}</strong></li>`
      ).join('') || '<li>No specific items identified</li>';

      const questionsHtml = aiTriage.diagnostic_questions?.map((q) => 
        `<li>${q}</li>`
      ).join('') || '<li>None</li>';

      aiHtmlBlock = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 25px; border-radius: 6px;">
          <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">🤖 AI Triage Assessment</h3>
          <p style="margin: 5px 0;"><strong>Classification:</strong> ${aiTriage.classification}</p>
          <p style="margin: 5px 0;"><strong>Urgency Score:</strong> <span style="background-color: ${aiTriage.urgency_score >= 4 ? '#fee2e2' : '#e0f2fe'}; padding: 2px 8px; border-radius: 12px; font-weight: bold; color: ${aiTriage.urgency_score >= 4 ? '#991b1b' : '#075985'};">${aiTriage.urgency_score} / 5</span></p>
          
          <h4 style="margin: 15px 0 5px 0; color: #334155;">Suggested Quote Items:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            ${lineItemsHtml}
          </ul>

          <h4 style="margin: 15px 0 5px 0; color: #334155;">Questions to ask client:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            ${questionsHtml}
          </ul>
        </div>
      `;
    }

    await resend.emails.send({
      from: "Skilled Quotes <quotes@skilledplumbingservices.com>",
      to: "filter-clothes.0j@icloud.com",
      subject: `New Website Quote Request: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; color: #333;">
          <h2>New Quote Request</h2>
          
          ${aiHtmlBlock}

          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 6px;">
            <p style="margin-top:0;"><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Address:</strong> ${escapeHtml(address)}</p>
            <p><strong>Description:</strong><br/>
            ${escapeHtml(description)}</p>
          </div>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />

          <h3>Photos (${photoUrls.length})</h3>
          ${
            photoUrls.length
              ? photoUrls
                  .map(
                    (url) => `
              <div style="margin-bottom:15px;">
                <img src="${url}" style="width:100%; max-width:400px; border-radius:8px; border: 1px solid #e2e8f0;" />
                <br/>
                <a href="${url}" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 14px;">View full size</a>
              </div>
            `
                  )
                  .join("")
              : "<p>No photos uploaded</p>"
          }
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("submitQuote error:", error);
    return { success: false, error: "Failed to submit quote. Please try again." };
  }
}