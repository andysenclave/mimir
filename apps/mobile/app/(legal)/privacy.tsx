// PLACEHOLDER Privacy Policy for MM-012, structured around DPDP Act 2023.
// Replaced with the real policy in MM-065 (Sprint 5 launch prep).

import { ScrollView, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';

export default function PrivacyScreen(): React.JSX.Element {
  return (
    <ScreenContainer edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerClassName="px-6 pb-10 pt-4">
        <Text className="mb-1 text-2xl font-bold text-text-primary">Privacy Policy</Text>
        <Text className="mb-6 text-xs text-text-tertiary">
          Last updated: TBD · DPDP Act 2023 compliant · Placeholder pending MM-065.
        </Text>

        <Section heading="1. Who we are">
          Mimir is operated by Thimple. Your data is processed in India (ap-south-1, Mumbai region)
          under the Digital Personal Data Protection Act, 2023.
        </Section>

        <Section heading="2. What we collect">
          - Account: email, display name, age attestation, consent timestamps.{'\n'}- Activity:
          paper trades, portfolio composition, lessons completed, quiz scores, app usage events
          (taps, screen views).{'\n'}- Device: model, OS version, app version, push token (if
          granted).
        </Section>

        <Section heading="3. How we use it">
          - To provide the paper trading + learning experience.{'\n'}- To send notifications you
          have opted into (price alerts, streak reminders, transactional confirmations).{'\n'}- To
          improve the product through aggregated, de-identified analytics.
          {'\n'}- To debug crashes and performance issues.
        </Section>

        <Section heading="4. What we do not collect">
          - Real bank account, card, or financial-account information. Mimir is paper trading only.
          {'\n'}- Government IDs (PAN, Aadhaar) — Mimir does not require KYC.{'\n'}- Contacts,
          photos, microphone, camera, or location data.
        </Section>

        <Section heading="5. Sharing">
          We do not sell your personal data. We share strictly with processors required to run the
          service: Sentry (crash reports — PII scrubbed), PostHog (product analytics — hashed user
          IDs only), Anthropic (AI insight prompts — your portfolio symbols are sent, never your
          name or email), and our infrastructure providers (Neon, Render, Upstash, Cloudflare).
        </Section>

        <Section heading="6. Your rights under DPDP">
          - Access: request a copy of your data.{'\n'}- Correction: update inaccurate data via
          in-app settings or by emailing us.{'\n'}- Erasure: delete your account; we cascade-delete
          owned data within 30 days.{'\n'}- Withdrawal of consent: opt out of any non-essential data
          use at any time via Profile &gt; Privacy.
        </Section>

        <Section heading="7. Retention">
          Active account data is retained while your account exists. Trade history is anonymised
          after 2 years. Crash reports auto-expire after 90 days.
        </Section>

        <Section heading="8. Security">
          Tokens are stored in iOS Keychain / Android Keystore. Passwords are hashed with bcrypt at
          cost factor 12. Communication uses TLS 1.2+.
        </Section>

        <Section heading="9. Children">
          Mimir is for users 18 and over. We do not knowingly collect data from minors.
        </Section>

        <Section heading="10. Contact + grievance officer">
          Privacy questions: <Text className="text-accent">privacy@mimir.thimple.in</Text>.{'\n'}
          Grievance officer (DPDP §13): <Text className="text-accent">dpo@thimple.in</Text>.
        </Section>

        <Text className="mt-6 text-xs italic text-text-tertiary">
          Placeholder copy — final policy replaces this in MM-065 before App Store submission.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-base font-semibold text-text-primary">{heading}</Text>
      <Text className="text-sm leading-6 text-text-secondary">{children}</Text>
    </View>
  );
}
