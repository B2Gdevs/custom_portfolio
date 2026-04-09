import { redirect } from 'next/navigation';

/** Legacy URL: planning loop is GAD; send visitors to compiled planning state. */
export default function RepoPlannerLegacyRedirectPage() {
  redirect('/docs/get-anything-done/planning/state');
}
