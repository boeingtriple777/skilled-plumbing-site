"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
const MAX_FILE_SIZE_MB = 5; // 5MB limit per file (well above your 0.8MB client compression)
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
];

export async function submitQuote(formData, env) {
  try {
    const files = formData.getAll("photo");

    // -----------------------------
    // SECURITY 1: Hard limit on file count
    // -----------------------------
    if (files.length > MAX_FILES) {
      console.warn(`Blocked upload: Exceeded max files (${files.length})`);
      return { success: false, error: `Maximum of ${MAX_FILES} photos allowed.` };
    }

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

        // -----------------------------
        // SECURITY 2: Hard limit on file size
        // -----------------------------
        if (file.size > MAX_FILE_SIZE_BYTES) {
          console.warn(`Blocked upload: File too large (${file.size} bytes)`);
          return { success: false, error: `Each photo must be strictly under ${MAX_FILE_SIZE_MB}MB.` };
        }

        // -----------------------------
        // SECURITY 3: Validate File Type
        // -----------------------------
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          console.warn(`Blocked upload: Invalid file type (${file.type})`);
          return { success: false, error: "Invalid file format. Only images are allowed." };
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const fileName = `quotes/${Date.now()}-${file.name.replaceAll(
          " ",
          "_"
        )}`;

      await env.R2_BUCKET.put(fileName, buffer, {
  httpMetadata: {
    contentType: file.type,
  },
});

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
      to: "ren@skilledplumbingservices.com",
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