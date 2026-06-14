// Re-export so call sites can import from a stable path that matches
// the eventual `import { useAuth } from '@andysenclave/heimdal-rn'` interface.

export { useAuth, AuthProvider } from './AuthProvider';
export type { AuthAPI, Attestations } from './types';
