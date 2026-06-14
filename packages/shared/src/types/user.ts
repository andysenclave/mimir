// Cross-app User shape. The full Prisma User model is owned by @mimir/api (MM-008).
// This is the slim shape both apps agree on after API serialization.

export type AuthUser = {
  id: string; // CUID, prefixed user_*
  email: string;
  displayName: string | null;
  onboardingDone: boolean;
};
