import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocumentPage } from "@/components/legal-document-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Maple collects, uses, and protects your information when you use our services.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage title="Privacy Policy" lastUpdated="March 23, 2026">
      <p>
        Maple (“we,” “us,” or “our”) respects your privacy. This Privacy Policy
        explains how we collect, use, disclose, and safeguard information when
        you access or use our websites, applications, and related services
        (collectively, the “Services”). By using the Services, you agree to
        this Privacy Policy and our{" "}
        <Link href="/terms">Terms of Service</Link>.
      </p>

      <h2>Information we collect</h2>
      <p>We may collect:</p>
      <ul>
        <li>
          <strong>Account and contact data</strong> — such as name, email
          address, and credentials you provide when you register or communicate
          with us.
        </li>
        <li>
          <strong>Usage and device data</strong> — such as IP address, browser
          type, operating system, pages viewed, referring URLs, and timestamps.
        </li>
        <li>
          <strong>Blockchain-related data</strong> — public wallet addresses and
          on-chain activity you connect or submit through the Services. This
          information is often public on the underlying network.
        </li>
        <li>
          <strong>Support content</strong> — messages and files you send when
          you contact support.
        </li>
      </ul>

      <h2>How we use information</h2>
      <p>We use information to:</p>
      <ul>
        <li>Provide, operate, and improve the Services;</li>
        <li>Authenticate users and secure accounts;</li>
        <li>Communicate with you about updates, security, and support;</li>
        <li>Analyze usage to improve performance and user experience;</li>
        <li>Comply with law and enforce our terms and policies.</li>
      </ul>

      <h2>Legal bases (where applicable)</h2>
      <p>
        Where required, we rely on consent, performance of a contract,
        legitimate interests (such as securing our Services and understanding
        how they are used), or legal obligation, as appropriate for the
        processing described above.
      </p>

      <h2>Sharing of information</h2>
      <p>We may share information with:</p>
      <ul>
        <li>
          <strong>Service providers</strong> who assist us with hosting,
          analytics, email delivery, security, and similar functions, subject to
          appropriate safeguards;
        </li>
        <li>
          <strong>Professional advisers</strong> where necessary (for example,
          legal or accounting professionals);
        </li>
        <li>
          <strong>Authorities</strong> when required by law or to protect our
          rights, users, or the public.
        </li>
      </ul>
      <p>
        We do not sell your personal information as that term is commonly
        understood. We may use aggregated or de-identified data that cannot
        reasonably identify you.
      </p>

      <h2>Cookies and similar technologies</h2>
      <p>
        We use cookies and similar technologies to remember preferences,
        maintain sessions, and measure traffic. You can control cookies through
        your browser settings; disabling some cookies may limit functionality.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain information for as long as needed to provide the Services,
        comply with legal obligations, resolve disputes, and enforce our
        agreements. Retention periods vary depending on the type of data and how
        it is used.
      </p>

      <h2>Security</h2>
      <p>
        We implement technical and organizational measures designed to protect
        information. No method of transmission or storage is completely
        secure; we cannot guarantee absolute security.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct,
        delete, or export certain personal information, or to object to or
        restrict certain processing. You may exercise these rights by contacting
        us at the address below. You may also unsubscribe from marketing
        messages using the instructions in those messages.
      </p>

      <h2>International transfers</h2>
      <p>
        If we transfer personal information across borders, we take steps
        consistent with applicable law to protect that information.
      </p>

      <h2>Children</h2>
      <p>
        The Services are not directed at children under 16, and we do not
        knowingly collect personal information from them. If you believe we have
        collected such information, contact us and we will take appropriate
        steps.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the
        revised policy on this page and update the “Last updated” date. Your
        continued use of the Services after changes become effective constitutes
        acceptance of the updated policy, to the extent permitted by law.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about this Privacy Policy or our privacy practices, use
        the contact information published on our website or in product
        communications.
      </p>
    </LegalDocumentPage>
  );
}
