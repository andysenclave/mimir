// 3-step (or N-step) progress indicator used by onboarding and any other
// multi-step flow. Visual matches the v2 mock — flat bars, accent fill on
// completed steps, subtle background on remaining.

import clsx from 'clsx';
import { View } from 'react-native';

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number; // 1-indexed; 1 = first step in progress
}

export function ProgressBar({ totalSteps, currentStep }: ProgressBarProps): React.JSX.Element {
  return (
    <View className="flex-row gap-1">
      {Array.from({ length: totalSteps }, (_, idx) => idx + 1).map((step) => (
        <View
          key={step}
          className={clsx(
            'h-1 flex-1 rounded-full',
            step <= currentStep ? 'bg-accent' : 'bg-border-subtle',
          )}
        />
      ))}
    </View>
  );
}
