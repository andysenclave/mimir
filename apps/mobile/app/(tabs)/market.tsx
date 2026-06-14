// MM-014 placeholder — the real Market screen lands in MM-024 with the live
// ticker, sector heatmap, and top movers.

import { LineChart } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/layout/PlaceholderScreen';

export default function MarketTab(): React.JSX.Element {
  return (
    <PlaceholderScreen
      title="Market"
      subtitle="NIFTY, SENSEX, sector heatmap, and live stock prices will live here."
      icon={LineChart}
      storyRef="MM-024"
    />
  );
}
