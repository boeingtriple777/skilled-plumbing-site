"use server";

export const runtime = "nodejs";

import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// basic HTML escape to prevent broken emails
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function submitQuote(formData) {
  try {
    const files = formData.getAll("photo");

    const name = formData.get("name") || "";
    const phone = formData.get("phone") || "";
    const email = formData.get("email") || "";
    const address = formData.get("address") || "";
    const description = formData.get("description") || "";

    let photoUrls = [];

    // -----------------------------
    // 1. Upload files to R2/S3
    // -----------------------------
    if (Array.isArray(files)) {
      for (const file of files) {
        if (!(file instanceof File) || file.size === 0) continue;

        const buffer = Buffer.from(await file.arrayBuffer());

        const fileName = `quotes/${Date.now()}-${file.name.replaceAll(
          " ",
          "_"
        )}`;

        await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
          })
        );

        photoUrls.push(
          `${process.env.R2_PUBLIC_URL}/${fileName}`
        );
      }
    }

    // -----------------------------
    // 2. Send email via Resend
    // -----------------------------
    await resend.emails.send({
      from: "Skilled Quotes <quotes@skilledplumbingservices.com>",
      to: "jacobmcgrath@me.com",
      subject: `New Website Quote Request: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px;">
          <h2>New Quote Request</h2>

          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Address:</strong> ${escapeHtml(address)}</p>

          <p><strong>Description:</strong><br/>
          ${escapeHtml(description)}</p>

          <hr />

          <h3>Photos (${photoUrls.length})</h3>

          ${
            photoUrls.length
              ? photoUrls
                  .map(
                    (url) => `
              <div style="margin-bottom:15px;">
                <img src="${url}" style="width:100%; max-width:400px; border-radius:8px;" />
                <br/>
                <a href="${url}" target="_blank">View full size</a>
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
    return {
      success: false,
      error: "Failed to submit quote. Please try again.",
    };
  }
}