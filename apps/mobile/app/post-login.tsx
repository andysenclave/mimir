// Deprecated — MM-014 introduced the real (tabs) shell. This file remains as a
// safe redirect target until you `git rm app/post-login.tsx` in this branch.
// Anyone hitting `/post-login` directly is bounced to the splash, which now
// routes signed-in + onboarded users to /portfolio.

import { Redirect } from 'expo-router';

export default function PostLoginDeprecated(): React.JSX.Element {
  return <Redirect href="/" />;
}
