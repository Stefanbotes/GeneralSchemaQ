// app/auth/reset-password/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, Check, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <div className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
    <Check className={`h-3 w-3 mr-2 ${met ? 'opacity-100' : 'opacity-30'}`} />
    {text}
  </div>
);

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';
  const email = searchParams?.get('email') ?? '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password', '');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      router.push('/auth/forgot-password');
    }
  }, [token, router]);

  const passwordRequirements = [{ met: password?.length >= 8, text: 'At least 8 characters' }];

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        const msg = result?.message || result?.error || 'Failed to reset password';
        setError(msg);
        toast.error(msg);
        return;
      }

      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch {
      setError('An unexpected error occurred. Please try again.');
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-[#fcd0b1] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="bg-white shadow-xl">
            <CardHeader className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-green-700">
                Password Reset Successful
              </CardTitle>
              <CardDescription>Your password has been updated successfully</CardDescription>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">You can now sign in with your new password.</p>
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-gradient-to-r from-primary-600 to-[#fcd0b1] hover:from-primary-700 hover:to-[#fcd0b1]"
              >
                Continue to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-[#fcd0b1] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to login button */}
        <div className="mb-6">
          <Link href="/auth/login" className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
        </div>

        <Card className="bg-white shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <AnimatedLogo className="w-20 h-20" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-[#fcd0b1] bg-clip-text text-transparent">
              Set New Password
            </CardTitle>
            <CardDescription>Create a strong password for your account</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!!email && (
                <p className="text-xs text-gray-500">
                  For: <span className="font-medium">{decodeURIComponent(email)}</span>
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    {...register('password')}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {password && (
                  <div className="mt-2 space-y-1 p-3 bg-gray-50 rounded-md">
                    {passwordRequirements.map((req, i) => (
                      <PasswordRequirement key={i} met={req.met} text={req.text} />
                    ))}
                  </div>
                )}

                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    {...register('confirmPassword')}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-[#fcd0b1] hover:from-primary-700 hover:to-[#fcd0b1]"
                disabled={isLoading || !token}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResetPasswordPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-[#fcd0b1] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <AnimatedLogo className="w-20 h-20" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-[#fcd0b1] bg-clip-text text-transparent">
              Set New Password
            </CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordPageLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
