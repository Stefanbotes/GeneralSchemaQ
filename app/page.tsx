'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function HomePage() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { data: session } = useSession() || {};
  const router = useRouter();

  const handleStartAssessment = () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the confidentiality terms to continue');
      return;
    }
    if (!session) {
      router.push('/auth/register?callbackUrl=/assessment');
      return;
    }
    router.push('/assessment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-[#fcd0b1]/10 text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card text-card-foreground p-8 rounded-xl shadow-lg mb-8 text-center">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <AnimatedLogo />
            </div>

            {/* Title with gradient text */}
            <CardTitle className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-[#fcd0b1] bg-clip-text text-transparent">
              Inner Persona Assessment
            </CardTitle>

            <CardDescription className="text-muted-foreground text-lg mb-6">
              Discover your Inner Persona through reflection statements. This assessment helps
              identify your natural Inner Persona patterns and growth opportunities.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Confidentiality box */}
            <div className="bg-gradient-to-r from-primary/5 to-[#fcd0b1]/10 p-6 rounded-lg shadow-inner mb-6 text-left">
              <h2 className="text-xl font-semibold mb-4 text-center">Confidentiality Agreement</h2>
              <p className="mb-4">By proceeding with this assessment, you agree that:</p>
              <ul className="list-disc pl-5 mb-6 space-y-2">
                <li>Your responses will be kept confidential and secure.</li>
                <li>The data will be used solely for your Personal Growth and Insight.</li>
                <li>Individual responses will not be shared without explicit consent.</li>
                <li>Results will help identify your Inner Persona patterns.</li>
              </ul>

              <div className="flex items-center justify-center space-x-3">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                  /* remove invalid accent class; rely on default styles */
                />
                <label htmlFor="terms" className="font-medium cursor-pointer">
                  I understand and agree to these terms
                </label>
              </div>
            </div>

            {/* Primary CTA */}
            <Button
              onClick={handleStartAssessment}
              disabled={!agreedToTerms}
              size="lg"
              className="bg-gradient-to-r from-primary to-[#fcd0b1] text-primary-foreground px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-200
                         hover:from-primary/90 hover:to-[#fcd0b1]/90 hover:shadow-xl
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {session ? 'Start Assessment' : 'Sign Up & Start Assessment'}
            </Button>

            {/* Secondary link to sign in */}
            {!session && (
              <p className="text-sm text-muted-foreground mt-4">
                Already have an account{' '}
                <Button
                  variant="link"
                  onClick={() => router.push('/auth/login?callbackUrl=/assessment')}
                  className="text-primary hover:text-primary/80 p-0 h-auto font-semibold"
                >
                  Sign in here
                </Button>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Additional information cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary font-bold">1</span>
                </div>
                Behavioral Reflection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Answer thoughtful questions about your thoughts, feelings, and beliefs in various situations.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                <div className="w-8 h-8 bg-[#fcd0b1]/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-[#fcd0b1] font-bold">2</span>
                </div>
                Persona Discovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Receive insights into your unique Inner Persona patterns and natural strengths.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
