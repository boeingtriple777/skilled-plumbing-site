import React from 'react';

export default function PrivacyPolicy() {
  return (
   <main className="max-w-3xl mx-auto px-6 pt-32 pb-12 text-gray-800">
      <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>

      <div className="space-y-6 leading-relaxed">
        <p className="font-semibold text-lg">
          Skilled Plumbing Services (ABN 42 200 618 577)
        </p>

        <p>
          Skilled Plumbing Services (“we”, “our”, or “us”) is committed to protecting your privacy and handling personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles. This Privacy Policy outlines how we collect, use, and protect the personal information you provide when using our website, particularly when requesting a quote.
        </p>
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            When you request a quote we collect the following personal information to assess your job and provide an accurate estimate:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Full Name</li>
            <li>Phone Number</li>
            <li>Email Address</li>
            <li>Suburb</li>
            <li>Photos of the plumbing job or site</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">
            The information you provide is used strictly for business purposes related to your inquiry. Specifically, we use your data to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contact you regarding your plumbing quote or inquiry.</li>
            <li>Assess the scope of work required using the provided photos and suburb location.</li>
            <li>Send you formal quotes and communicate effectively about scheduling and service delivery.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Third-Party Service Providers</h2>
          <p className="mb-4">
            We do not sell, rent, or trade your personal information to any external marketing companies. To operate our website and manage your quote requests efficiently, we use trusted third-party services that comply with modern security standards:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Cloudflare R2:</strong> We use this service to securely store the data and job photos you submit through our quote form.
            </li>
            <li>
              <strong>Resend:</strong> We use this service to safely route and deliver the emails generated when you submit a quote request.
            </li>
          </ul>
          <p className="mt-4">
            These providers only process your information as necessary to facilitate the technical operations of our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p>
            We take reasonable technical and organizational precautions to prevent the loss, misuse, or alteration of your personal information. Your data is stored securely via our nominated service providers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Overseas Disclosure</h2>
          <p>
            Some of the third-party services we use, such as Cloudflare and Resend, may store or process data on servers located outside Australia. By providing your personal information, you acknowledge that your data may be transferred and stored overseas in accordance with applicable privacy laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Access and Correction</h2>
          <p>
            You may request access to the personal information we hold about you and request corrections if it is inaccurate. To do so, please contact us using the details below. For security reasons, we may require you to verify your identity before we provide access or make corrections.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, wish to access or correct your data, or have concerns about how your data is handled, please contact us at:
          </p>
          <ul className="list-none space-y-2 font-medium">
            <li>Email: <a href="mailto: ren@skilledplumbingservices.com" className="text-blue-600 hover:underline">ren@skilledplumbingservices.com</a></li>
          </ul>
        </section>
      </div>
    </main>
  );
}