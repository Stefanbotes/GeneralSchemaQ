
// Homepage matching the original design with confidentiality agreement
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
      // Redirect to registration with return URL
      router.push('/auth/register?callbackUrl=/assessment');
      return;
    }

    // Redirect to assessment
    router.push('/assessment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white p-8 rounded-xl shadow-lg mb-8 text-center">
          <CardHeader>
            <div className="flex justify-center mb-6">
              <AnimatedLogo />
            </div>
            <CardTitle className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Inner Personas Assessment
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg mb-6">
              Discover your leadership persona through behavioral reflection statements. This assessment 
              helps identify your natural leadership patterns and growth opportunities.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-inner mb-6 text-left">
              <h2 className="text-xl font-semibold mb-4 text-center">Confidentiality Agreement</h2>
              <p className="mb-4">By proceeding with this assessment, you agree that:</p>
              <ul className="list-disc pl-5 mb-6 space-y-2">
                <li>Your responses will be kept confidential and secure.</li>
                <li>The data will be used solely for leadership development and analysis.</li>
                <li>Individual responses will not be shared without explicit consent.</li>
                <li>Results will help identify your leadership persona patterns.</li>
              </ul>
              <div className="flex items-center justify-center space-x-3">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="scale-125 accent-blue-500"
                />
                <label htmlFor="terms" className="font-medium cursor-pointer">
                  I understand and agree to these terms
                </label>
              </div>
            </div>

            <Button
              onClick={handleStartAssessment}
              disabled={!agreedToTerms}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {session ? 'Start Assessment' : 'Sign Up & Start Assessment'}
            </Button>

            {!session && (
              <p className="text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <Button 
                  variant="link" 
                  onClick={() => router.push('/auth/login?callbackUrl=/assessment')}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto font-semibold"
                >
                  Sign in here
                </Button>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Additional information cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-700 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                Behavioral Reflection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Answer thoughtful questions about your leadership approach and decision-making patterns.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-indigo-700 flex items-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-indigo-600 font-bold">2</span>
                </div>
                Persona Discovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Receive insights into your unique leadership persona and natural strengths.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
