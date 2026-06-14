// MM-049 — Markdown lesson reading view.
// react-native-markdown-display is pure JS — works in Expo Go.

import { StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { useThemeTokens } from '@/theme/use-theme-tokens';

interface LessonContentProps {
  content: string;
}

export function LessonContent({ content }: LessonContentProps): React.JSX.Element {
  const tokens = useThemeTokens();
  const md = StyleSheet.create({
    body: { color: tokens.text.primary, fontSize: 15, lineHeight: 24 },
    heading1: {
      color: tokens.text.primary,
      fontSize: 20,
      fontWeight: '700',
      marginTop: 20,
      marginBottom: 8,
    },
    heading2: {
      color: tokens.text.primary,
      fontSize: 17,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 6,
    },
    heading3: {
      color: tokens.text.primary,
      fontSize: 15,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 4,
    },
    paragraph: { color: tokens.text.primary, marginBottom: 12 },
    strong: { fontWeight: '600' },
    em: { fontStyle: 'italic' },
    blockquote: {
      backgroundColor: tokens.bg.secondary,
      borderLeftWidth: 3,
      borderLeftColor: tokens.accent,
      paddingLeft: 12,
      paddingVertical: 4,
      marginBottom: 12,
    },
    code_inline: {
      backgroundColor: tokens.bg.tertiary,
      color: tokens.text.primary,
      fontFamily: 'Menlo',
      fontSize: 13,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 3,
    },
    fence: {
      backgroundColor: tokens.bg.tertiary,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    code_block: { color: tokens.text.primary, fontFamily: 'Menlo', fontSize: 13 },
    table: { borderWidth: 1, borderColor: tokens.border.subtle, marginBottom: 12 },
    th: {
      backgroundColor: tokens.bg.secondary,
      padding: 8,
      fontWeight: '600',
      color: tokens.text.primary,
    },
    td: { padding: 8, color: tokens.text.secondary },
    bullet_list: { marginBottom: 12 },
    ordered_list: { marginBottom: 12 },
    list_item: { marginBottom: 4 },
    hr: { backgroundColor: tokens.border.subtle, height: 1, marginVertical: 16 },
  });

  return <Markdown style={md}>{content}</Markdown>;
}
