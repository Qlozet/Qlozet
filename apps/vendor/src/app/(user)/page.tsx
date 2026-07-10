import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect root path to the dashboard.
  redirect('/dashboard');
}