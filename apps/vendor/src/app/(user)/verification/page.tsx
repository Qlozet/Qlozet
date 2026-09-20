import { redirect } from 'next/navigation';

// Verification lives in Settings now; keep old links working.
export default function VerificationPage() {
  redirect('/settings?tab=verification');
}
