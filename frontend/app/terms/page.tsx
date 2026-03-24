import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocumentPage } from "@/components/legal-document-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing your use of Maple’s websites, applications, and services.",
};

export default function TermsOfServicePage() {
  return (
    <LegalDocumentPage title="Terms of Service" lastUpdated="March 23, 2026">
      <p>
        These Terms of Service (“Terms”) govern your access to and use of the
        websites, applications, and services offered by Maple (“Maple,” “we,”
        “us,” or “our”) (collectively, the “Services”). By accessing or using
        the Services, you agree to these Terms and our{" "}
        <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not
        use the Services.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be able to form a binding contract in your jurisdiction and meet
        any minimum age requirements in your region to use the Services. If you
        use the Services on behalf of an organization, you represent that you
        have authority to bind that organization.
      </p>

      <h2>Description of the Services</h2>
      <p>
        Maple provides tools and interfaces that may help you discover,
        interact with, or reason about decentralized applications and related
        workflows. Features may change, and we do not guarantee uninterrupted or
        error-free operation. The Services may integrate with third-party
        networks, protocols, or applications that we do not control.
      </p>

      <h2>Accounts and security</h2>
      <p>
        You may need to create an account or connect a wallet. You are responsible
        for safeguarding your credentials and for activity under your account.
        Notify us promptly of any unauthorized use. We may suspend or terminate
        accounts that violate these Terms or pose a security risk.
      </p>

      <h2>Blockchain and third-party services</h2>
      <p>
        Transactions you initiate through compatible wallets or networks are
        executed on public or permissioned blockchains and other systems we do
        not operate. You are solely responsible for gas fees, slippage, smart
        contract risk, and compliance with applicable laws. We do not custody
        your digital assets unless we expressly agree otherwise in writing.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          Violate any law or infringe others’ rights, including intellectual
          property and privacy rights;
        </li>
        <li>
          Attempt to gain unauthorized access to the Services, other users’
          accounts, or our systems;
        </li>
        <li>
          Distribute malware, overload infrastructure, or interfere with the
          Services’ integrity or performance;
        </li>
        <li>
          Use the Services to facilitate fraud, market manipulation, or illegal
          activity;
        </li>
        <li>
          Reverse engineer, scrape, or resell the Services except as permitted
          by law.
        </li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        The Services, including software, branding, and content we provide, are
        owned by Maple or our licensors and are protected by intellectual
        property laws. Subject to these Terms, we grant you a limited,
        non-exclusive, non-transferable license to access and use the Services
        for your personal or internal business purposes. No other rights are
        granted by implication.
      </p>

      <h2>User content</h2>
      <p>
        If you submit feedback or content to us, you grant us a worldwide,
        royalty-free license to use, modify, and display it to operate and
        improve the Services, without obligation to you except where prohibited
        by law. You represent that you have the rights needed to grant this
        license.
      </p>

      <h2>Disclaimers</h2>
      <p>
        THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM
        EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS,
        IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE
        SERVICES WILL BE ACCURATE, RELIABLE, OR FREE OF HARMFUL COMPONENTS. ANY
        INFORMATION PROVIDED THROUGH THE SERVICES IS FOR INFORMATIONAL PURPOSES
        ONLY AND IS NOT FINANCIAL, LEGAL, OR INVESTMENT ADVICE.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, MAPLE AND ITS AFFILIATES,
        OFFICERS, EMPLOYEES, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
        PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE
        SERVICES. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THESE TERMS
        OR THE SERVICES WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID
        US FOR THE SERVICES IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) ONE
        HUNDRED U.S. DOLLARS (US $100), EXCEPT WHERE PROHIBITED BY LAW.
      </p>

      <h2>Indemnity</h2>
      <p>
        You will defend, indemnify, and hold harmless Maple and its affiliates
        from claims, damages, losses, and expenses (including reasonable
        attorneys’ fees) arising from your use of the Services, your violation
        of these Terms, or your violation of third-party rights.
      </p>

      <h2>Termination</h2>
      <p>
        You may stop using the Services at any time. We may suspend or terminate
        access if you breach these Terms or if we discontinue the Services or
        must do so for legal or security reasons. Provisions that by their nature
        should survive termination will survive.
      </p>

      <h2>Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of the State of Delaware, excluding
        conflict-of-law rules, unless a different governing law applies by
        mandatory statute. Courts in Delaware will have exclusive jurisdiction
        over disputes, except where you have mandatory rights to bring claims in
        your local courts. You waive any right to participate in a class action
        to the extent permitted by law.
      </p>

      <h2>Changes</h2>
      <p>
        We may modify these Terms from time to time. We will post updated Terms
        on this page and update the “Last updated” date. If changes are
        material, we will provide additional notice as appropriate. Your
        continued use after the effective date constitutes acceptance of the
        revised Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms: use the contact information published on
        our website or in product communications.
      </p>
    </LegalDocumentPage>
  );
}
