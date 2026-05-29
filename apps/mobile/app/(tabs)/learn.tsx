// MM-014 + MM-015 — Learn tab. Phase 1 ships the placeholder card from
// MM-015; the real Learn experience (Today's Concept, AI suggestions,
// course list) lands in MM-047 (Sprint 3).

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { LearnPlaceholder } from '@/features/learn/LearnPlaceholder';

export default function LearnTab(): React.JSX.Element {
  return (
    <ScreenContainer>
      <LearnPlaceholder />
    </ScreenContainer>
  );
}
