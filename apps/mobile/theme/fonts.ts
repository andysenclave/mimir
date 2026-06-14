// Font loading (expo-font + @expo-google-fonts) — MM-072, prompt 05.
// Inter is the sans family; JetBrains Mono is the numeric/mono family (CLAUDE.md
// §14). All weights are preloaded so the weight utilities (`font-medium`,
// `font-semibold`, `font-bold`) resolve against a real cut.
//
// The family *names* below are the keys passed to `useFonts` and must match the
// `fontFamily` mapping in `tailwind.config.ts` (base = the 400 cut).

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';

/** Loads the app fonts. Returns true once every weight is ready. */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });
  return loaded;
}
