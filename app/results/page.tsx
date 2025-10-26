// app/results/page.tsx
// NOTE: Server Component (no "use client") so Next reads these options:
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import ResultsClient from './ResultsClient';

export default function ResultsPage() {
  return <ResultsClient />;
}
