"use server";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitQuote(formData) {
  return { disabled: true };
  // FIX: Use .getAll() to capture the array of files instead of just one
  const files = formData.getAll("photo"); 
  const name = formData.get("name");
  const phone = formData.get("phone");
  const email = formData.get("email");
  const address = formData.get("address");
  const description = formData.get("description");

  let photoUrls = [];

  try {
    // 1. Loop through the array of files
    for (const file of files) {
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `quotes/${Date.now()}-${file.name.replaceAll(" ", "_")}`;

        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
        }));

        photoUrls.push(`${process.env.R2_PUBLIC_URL}/${fileName}`);
      }
    }

    // 2. Send Email with all photos mapped into the HTML
    await resend.emails.send({
      from: "Skilled Quotes <quotes@skilledplumbingservices.com>", 
      to: "jacobmcgrath@me.com",
      subject: `New Website Quote Request: ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Suburb:</strong> ${address || 'Not provided'}</p>
          <p><strong>Job Details:</strong> ${description}</p>
          
          <hr />
          
          <h3>Photos (${photoUrls.length})</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${photoUrls.map(url => `
              <div style="margin-bottom: 20px;">
                <img src="${url}" width="100%" style="border-radius: 8px; border: 1px solid #ddd;" />
                <a href="${url}" style="font-size: 12px; color: #2563eb;">View Full Size</a>
              </div>
            `).join('')}
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting quote:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}