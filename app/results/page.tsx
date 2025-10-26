// app/results/page.tsx
// NOTE: no "use client" here — this must be a Server Component so Next reads the segment options.

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import ResultsClient from './ResultsClient';

export default function ResultsPage() {
  // keep it simple; render the client component that handles UI + effects
  return <ResultsClient />;
}

