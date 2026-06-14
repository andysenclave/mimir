// MM-014 placeholder — the real Portfolio screen lands in MM-030 with the
// summary card, equity curve, holdings list, and pull-to-refresh.

import { LayoutGrid } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/layout/PlaceholderScreen';

export default function PortfolioTab(): React.JSX.Element {
  return (
    <PlaceholderScreen
      title="Portfolio"
      subtitle="Your holdings, P&L, and equity curve will live here."
      icon={LayoutGrid}
      storyRef="MM-030"
    />
  );
}
