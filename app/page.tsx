import AuthGate from './AuthGate';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const supabaseUrl = process.env.SUPABASE_URL ?? '';
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? '';
  return <AuthGate supabaseUrl={supabaseUrl} publishableKey={publishableKey} />;
}

