// PLACEHOLDER Terms of Service for MM-012.
// Replaced with the real legal copy in MM-065 (Sprint 5 launch prep).
// Structured to anticipate the final shape so the swap is content-only.

import { ScrollView, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';

export default function TermsScreen(): React.JSX.Element {
  return (
    <ScreenContainer edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerClassName="px-6 pb-10 pt-4">
        <Text className="mb-1 text-2xl font-bold text-text-primary">Terms of Service</Text>
        <Text className="mb-6 text-xs text-text-tertiary">
          Last updated: TBD · This is a placeholder pending MM-065.
        </Text>

        <Section heading="1. What Mimir is">
          Mimir is an educational simulation. It lets you practise paper trading and learn investing
          concepts using virtual money against real Indian stock market prices. Mimir is not a
          broker, not an investment advisor, and does not facilitate real trades or hold real funds.
        </Section>

        <Section heading="2. Eligibility">
          You must be 18 years of age or older to use Mimir. By creating an account, you confirm you
          meet this requirement.
        </Section>

        <Section heading="3. No investment advice">
          Nothing in Mimir, including AI-generated insights, course content, or notifications,
          constitutes investment, financial, tax, or legal advice. Always consult a SEBI-registered
          investment advisor before making real financial decisions.
        </Section>

        <Section heading="4. Your account">
          You are responsible for keeping your password confidential and for all activity under your
          account. Notify us immediately if you suspect unauthorised access.
        </Section>

        <Section heading="5. Acceptable use">
          You agree not to abuse the service, attempt to disrupt operations, scrape content at
          scale, or impersonate other users. We may suspend or terminate accounts that violate these
          terms.
        </Section>

        <Section heading="6. Service availability">
          Mimir is provided &quot;as is&quot;. Market data may be delayed. Prices, features, and
          availability may change without notice.
        </Section>

        <Section heading="7. Changes to these terms">
          We may update these terms from time to time. Material changes will be notified in-app.
          Continued use after notice constitutes acceptance.
        </Section>

        <Section heading="8. Contact">
          Questions about these terms? Email{' '}
          <Text className="text-accent">support@mimir.thimple.in</Text>.
        </Section>

        <Text className="mt-6 text-xs italic text-text-tertiary">
          Placeholder copy — final legal text replaces this in MM-065 before App Store submission.
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
