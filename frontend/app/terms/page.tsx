import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Prompt Library.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold">Terms of Service</h1>
      <p className="mt-4 text-muted-foreground">Last updated: March 2025</p>
      <div className="prose prose-sm dark:prose-invert mt-8 max-w-none space-y-6">
        <p>
          Welcome to Prompt Library (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms of Service
          (&quot;Terms&quot;) govern your access to and use of the Prompt Library website, APIs, and services
          (collectively, the &quot;Service&quot;). By creating an account or using the Service, you agree to
          be bound by these Terms.
        </p>

        <h2 className="text-lg font-semibold">1. Eligibility</h2>
        <p>
          You must be at least 13 years old (or the minimum age in your jurisdiction) to use the
          Service. If you are under 18, you represent that you have your parent or guardian&apos;s
          consent. You must have the legal capacity to enter into binding contracts and comply with
          all applicable laws in your jurisdiction.
        </p>

        <h2 className="text-lg font-semibold">2. Account Registration and Security</h2>
        <p>
          You may sign up via third-party providers (e.g., Google). You are responsible for
          maintaining the confidentiality of your account credentials and for all activity under
          your account. You must provide accurate information and notify us promptly of any
          unauthorized access or breach.
        </p>

        <h2 className="text-lg font-semibold">3. Acceptable Use</h2>
        <p>
          You agree to use the Service only for lawful purposes and in accordance with these
          Terms. You must not:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Post content that infringes intellectual property, privacy, or other rights of others</li>
          <li>Harass, abuse, defame, or discriminate against others</li>
          <li>Distribute malware, spam, or harmful code</li>
          <li>Circumvent security measures or attempt unauthorized access to our systems</li>
          <li>Use the Service for illegal activities or to violate applicable laws</li>
          <li>Impersonate others or misrepresent your affiliation</li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that violate these terms.
        </p>

        <h2 className="text-lg font-semibold">4. Content and Licenses</h2>
        <p>
          You retain ownership of content you submit (prompts, descriptions, guides, etc.). By
          posting content, you grant us a worldwide, non-exclusive, royalty-free license to
          display, distribute, and sublicense your content in connection with the Service,
          including for promotion and improvement. You represent that you have the right to grant
          this license and that your content does not violate any third-party rights.
        </p>
        <p>
          Content forked from others may be subject to additional license terms. You are
          responsible for complying with those terms.
        </p>

        <h2 className="text-lg font-semibold">5. Intellectual Property</h2>
        <p>
          Prompt Library and its branding, design, and underlying technology are owned by us or
          our licensors. You may not copy, modify, or create derivative works of our Service
          without written permission. User-generated content remains the property of its authors.
        </p>

        <h2 className="text-lg font-semibold">6. Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
          KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
          ERROR-FREE, OR SECURE. PROMPTS AND OTHER USER CONTENT ARE PROVIDED FOR INFORMATIONAL
          PURPOSES ONLY. WE DO NOT ENDORSE OR GUARANTEE THE ACCURACY, LEGALITY, OR QUALITY OF
          USER CONTENT. YOU USE PROMPTS AND THE SERVICE AT YOUR OWN RISK.
        </p>

        <h2 className="text-lg font-semibold">7. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOSS OF PROFITS, DATA, OR
          GOODWILL, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE
          AMOUNT YOU PAID US (IF ANY) IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED
          U.S. DOLLARS, WHICHEVER IS GREATER.
        </p>

        <h2 className="text-lg font-semibold">8. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless Prompt Library, its affiliates, and
          their officers, directors, employees, and agents from any claims, damages, losses, or
          expenses (including reasonable attorneys&apos; fees) arising from your use of the Service,
          your content, or your violation of these Terms.
        </p>

        <h2 className="text-lg font-semibold">9. Termination</h2>
        <p>
          We may suspend or terminate your access at any time for violation of these Terms or for
          any other reason. You may delete your account at any time. Upon termination, your right
          to use the Service ceases. Sections that by their nature should survive (e.g.,
          disclaimers, limitation of liability, indemnification) will survive termination.
        </p>

        <h2 className="text-lg font-semibold">10. Dispute Resolution and Governing Law</h2>
        <p>
          Any disputes arising from these Terms or the Service shall be governed by the laws of
          the United States and the State of [Your State], without regard to conflict of law
          principles. You agree to resolve disputes through binding arbitration or in the courts
          of the jurisdiction specified above, except where prohibited by law.
        </p>

        <h2 className="text-lg font-semibold">11. Changes to the Terms</h2>
        <p>
          We may modify these Terms from time to time. We will notify you of material changes by
          posting the updated Terms on this page and updating the &quot;Last updated&quot; date. Your
          continued use of the Service after changes constitutes acceptance. If you do not
          agree, you must stop using the Service.
        </p>

        <h2 className="text-lg font-semibold">12. Contact</h2>
        <p>
          For questions about these Terms, please contact us at [contact email] or through the
          contact information provided on our website.
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
