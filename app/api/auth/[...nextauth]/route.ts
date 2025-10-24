
// NextAuth API route handler
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
