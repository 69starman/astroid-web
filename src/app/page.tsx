import { redirect } from 'next/navigation';

/** The workspace opens on the Overview command center. */
export default function RootPage() {
  redirect('/overview');
}
