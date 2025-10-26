
// Assessment page for conducting Inner Personaevaluation
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { AssessmentClient } from './assessment-client';

export const dynamic = 'force-dynamic';

export default async function AssessmentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/assessment');
  }

  return <AssessmentClient />;
}
