import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Prompt Library.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p className="mt-4 text-muted-foreground">Last updated: March 2025</p>
      <div className="prose prose-sm dark:prose-invert mt-8 max-w-none space-y-6">
        <p>
          Prompt Library (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This Privacy
          Policy explains what information we collect, how we use it, whom we share it with, and
          what choices and rights you have. By using our Service, you consent to the practices
          described in this policy.
        </p>

        <h2 className="text-lg font-semibold">1. Information We Collect</h2>
        <h3 className="mt-3 text-base font-medium">Information You Provide</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Account data:</strong> When you sign up via a third-party provider (e.g.,
            Google), we receive your email, display name, and profile photo. You may also set a
            username, bio, and website in your profile.
          </li>
          <li>
            <strong>User content:</strong> Prompts, descriptions, guides, comments, and other
            content you create or post on the Service.
          </li>
          <li>
            <strong>Communications:</strong> Messages you send to us, such as support requests.
          </li>
        </ul>
        <h3 className="mt-3 text-base font-medium">Information Collected Automatically</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Usage data:</strong> Pages visited, features used, and interaction patterns.
          </li>
          <li>
            <strong>Device and log data:</strong> IP address, browser type, operating system,
            and approximate location derived from your IP.
          </li>
          <li>
            <strong>Cookies and similar technologies:</strong> We use cookies and local storage
            for authentication, preferences, and analytics (subject to your cookie choices).
          </li>
        </ul>

        <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Provide, maintain, and improve the Service</li>
          <li>Display your profile, prompts, and activity to other users</li>
          <li>Send you notifications (e.g., forks, upvotes, mentions) based on your preferences</li>
          <li>Authenticate users and prevent fraud</li>
          <li>Analyze usage to improve our product and experience</li>
          <li>Comply with legal obligations and enforce our Terms of Service</li>
        </ul>

        <h2 className="text-lg font-semibold">3. Legal Bases for Processing (GDPR)</h2>
        <p>
          For users in the European Economic Area (EEA), we process your data based on: (a)
          consent where required; (b) performance of a contract (e.g., providing the Service);
          (c) our legitimate interests (e.g., security, analytics); and (d) compliance with
          legal obligations.
        </p>

        <h2 className="text-lg font-semibold">4. Sharing and Disclosure</h2>
        <p>We do not sell your personal information. We may share information with:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Other users:</strong> Your public profile, prompts, and activity are visible
            to anyone on the Service.
          </li>
          <li>
            <strong>Service providers:</strong> Hosting (e.g., Vercel), databases (e.g., MongoDB),
            authentication (e.g., Firebase), and analytics. These providers process data on our
            behalf under contractual obligations.
          </li>
          <li>
            <strong>Legal requirements:</strong> When required by law, court order, or to protect
            our rights and safety.
          </li>
        </ul>

        <h2 className="text-lg font-semibold">5. Data Retention</h2>
        <p>
          We retain your account and content for as long as your account is active. You may
          delete your account at any time; we will delete or anonymize your personal data within
          a reasonable period, except where we must retain it for legal, security, or legitimate
          business purposes. Aggregated or anonymized data may be retained indefinitely.
        </p>

        <h2 className="text-lg font-semibold">6. Security</h2>
        <p>
          We implement reasonable technical and organizational measures to protect your data,
          including encryption in transit (HTTPS) and access controls. No method of transmission
          over the Internet is 100% secure; you use the Service at your own risk.
        </p>

        <h2 className="text-lg font-semibold">7. International Transfers</h2>
        <p>
          Your data may be transferred to and processed in countries other than your own,
          including the United States. We ensure appropriate safeguards (e.g., Standard
          Contractual Clauses) where required by law for transfers outside the EEA.
        </p>

        <h2 className="text-lg font-semibold">8. Your Rights and Choices</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Access:</strong> Request a copy of the personal data we hold about you
          </li>
          <li>
            <strong>Correction:</strong> Request correction of inaccurate or incomplete data
          </li>
          <li>
            <strong>Deletion:</strong> Request deletion of your data (including via account
            deletion)
          </li>
          <li>
            <strong>Portability:</strong> Receive your data in a structured, machine-readable
            format
          </li>
          <li>
            <strong>Object or restrict:</strong> Object to processing or request restriction
            (where applicable)
          </li>
          <li>
            <strong>Withdraw consent:</strong> Withdraw consent where processing is based on
            consent
          </li>
          <li>
            <strong>Complain:</strong> Lodge a complaint with a supervisory authority (e.g.,
            in the EU)
          </li>
        </ul>
        <p>
          To exercise these rights, contact us at [contact email]. We will respond within the
          timeframe required by applicable law.
        </p>

        <h2 className="text-lg font-semibold">9. Children&apos;s Privacy</h2>
        <p>
          The Service is not intended for users under 13. We do not knowingly collect personal
          information from children under 13. If you believe we have collected such information,
          please contact us and we will delete it promptly.
        </p>

        <h2 className="text-lg font-semibold">10. California Privacy Rights (CCPA/CPRA)</h2>
        <p>
          California residents have additional rights: to know what personal information we
          collect and how it is used; to delete their information; to opt out of the &quot;sale&quot;
          or &quot;sharing&quot; of personal information (we do not sell or share for cross-context
          behavioral advertising); and to non-discrimination. To exercise these rights, contact
          us as provided below.
        </p>

        <h2 className="text-lg font-semibold">11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the updated policy
          on this page and update the &quot;Last updated&quot; date. For material changes, we may
          notify you via email or a prominent notice on the Service. Your continued use after
          changes constitutes acceptance.
        </p>

        <h2 className="text-lg font-semibold">12. Contact Us</h2>
        <p>
          For questions, requests, or complaints about this Privacy Policy or our data practices,
          please contact us at [contact email] or through the contact information on our website.
        </p>
      </div>
      <p className="mt-8">
        <Link href="/" className="text-primary hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
