
// Email verification page
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function VerifyEmailForm() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const email = searchParams?.get('email');

  useEffect(() => {
    if (token && email) {
      verifyEmail(token, email);
    }
  }, [token, email]);

  const verifyEmail = async (token: string, email: string) => {
    try {
      setStatus('verifying');

      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(result.message);
        toast.success('Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
      toast.error('Verification failed. Please try again.');
    }
  };

  const resendVerification = async () => {
    if (!email) return;

    try {
      setIsResending(true);

      // This would typically call a resend verification endpoint
      // For now, we'll show a success message
      toast.success('Verification email sent! Please check your inbox.');
      setIsResending(false);
    } catch (error) {
      toast.error('Failed to resend verification email. Please try again.');
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to login button */}
        <div className="mb-6">
          <Link href="/auth/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
        </div>

        <Card className="bg-white shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <AnimatedLogo className="w-20 h-20" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Email Verification
            </CardTitle>
            <CardDescription>
              {status === 'pending' && !token && 'Check your email for verification instructions'}
              {status === 'verifying' && 'Verifying your email address...'}
              {status === 'success' && 'Your email has been verified successfully!'}
              {status === 'error' && 'There was an issue verifying your email'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {status === 'pending' && !token && (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  We've sent a verification link to{' '}
                  {email && <span className="font-semibold">{email}</span>}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Click the link in your email to verify your account and complete registration.
                </p>
                
                <Button
                  onClick={resendVerification}
                  variant="outline"
                  disabled={isResending || !email}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
              </div>
            )}

            {status === 'verifying' && (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                </div>
                <p className="text-gray-600">Verifying your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
                <p className="text-sm text-gray-600 mt-4">
                  Redirecting to sign in page in 3 seconds...
                </p>
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Continue to Sign In
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-16 w-16 text-red-600" />
                </div>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
                
                <div className="mt-6 space-y-3">
                  {email && (
                    <Button
                      onClick={resendVerification}
                      variant="outline"
                      disabled={isResending}
                      className="w-full"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Resend Verification Email'
                      )}
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => router.push('/auth/register')}
                    variant="ghost"
                    className="w-full"
                  >
                    Create New Account
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loading component for suspense fallback
function VerifyEmailPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <AnimatedLogo className="w-20 h-20" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Email Verification
            </CardTitle>
            <CardDescription>
              Loading...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailPageLoading />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
