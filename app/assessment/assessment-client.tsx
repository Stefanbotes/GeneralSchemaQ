// app/assessment/assessment-client.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  order: number;
  domain: string;
  schema: string;
  persona: string;
  healthyPersona: string;
  statement: string;
  type: string;
}

interface Response {
  value: number;
  timestamp: string;
}

interface BioData {
  name: string;
  email: string;
  team: string;
  uniqueCode: string;
}

/** Strip leading numbering once (robust) */
const stripLeadingNumberOnce = (input: string): string => {
  if (!input) return '';
  let s = input
    .normalize('NFKC')
    .replace(/\uFEFF/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u2000-\u200D\u2060]/g, '');

  s = s.replace(
    new RegExp(
      '^\\s*(?:<(?:\\/)?[a-zA-Z][^>]*>\\s*)*' +
        '(?:[0-9\\uFF10-\\uFF19]{1,3})' +
        '(?:\\s*[\\)\\]]\\s*)?' +
        '(?:\\s*[\\.\\uFF0E\\u2024\\u2027\\u3002:\\-–—]\\s*)?',
      'u'
    ),
    ''
  );

  s = s.replace(/^\s*[0-9\uFF10-\uFF19]{1,3}\s*[\.\uFF0E:–—\-]?\s*/, '');
  return s.trim();
};

const cleanQuestionText = (raw: string) => stripLeadingNumberOnce(stripLeadingNumberOnce(raw || ''));

export function AssessmentClient() {
  const { data: session } = useSession();
  const router = useRouter();

  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [bioData, setBioData] = useState<BioData>({
    name: '',
    email: '',
    team: '',
    uniqueCode: crypto.randomUUID(),
  });
  const [bioCompleted, setBioCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});

  // ✅ Standard: use session.user.name / email with safe fallbacks
  useEffect(() => {
    if (session?.user) {
      setBioData((prev) => {
        const fullName =
          prev.name ??
          session.user.name ??
          [(session.user as any)?.firstName, (session.user as any)?.lastName].filter(Boolean).join(' ').trim();

        const email = prev.email ?? (session.user.email ?? '');
        return { ...prev, name: fullName || '', email };
      });
    }
  }, [session]);

  const questionsPerPage = 5;

  const likertOptions = [
    { value: 1, label: 'Strongly Disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Slightly Disagree' },
    { value: 4, label: 'Slightly Agree' },
    { value: 5, label: 'Agree' },
    { value: 6, label: 'Strongly Agree' },
  ];

  const shuffleArray = <T,>(array: T[]): T[] => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Load + sanitize questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setQuestionsLoading(true);
        const res = await fetch('/api/assessment/questions', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load questions');

        const data = await res.json();
        if (data.success && data.questions) {
          const shuffled = shuffleArray(data.questions as Question[]);
          const sanitized = shuffled.map((q) => ({
            ...q,
            statement: cleanQuestionText(String(q.statement ?? '')),
          }));
          setQuestions(sanitized);
          console.log('[Questions]', {
            originalExample: (data.questions[0] as Question)?.statement,
            sanitizedExample: sanitized[0]?.statement,
          });
        } else {
          throw new Error('Invalid questions data received');
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load assessment questions. Please refresh.');
      } finally {
        setQuestionsLoading(false);
      }
    };
    loadQuestions();
  }, []);

  // Response handling
  const handleResponse = (questionId: string, value: number) => {
    setResponses((prev) => {
      const next = { ...prev, [questionId]: { value, timestamp: new Date().toISOString() } };
      const total = questions.length || 0;
      const answered = Object.keys(next).length || 0;
      setProgress(total ? (answered / total) * 100 : 0);
      return next;
    });
  };

  // Bio handling
  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBioData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bioData.name && bioData.email && bioData.team) {
      setBioCompleted(true);
      toast.success('Personal information saved. Starting assessment...');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  // Scoring
  const calculateCategoryScores = (): Record<string, number> => {
    const totals: Record<string, { total: number; count: number }> = {};
    questions.forEach((q) => {
      const r = responses[q.id];
      if (q.schema && r) {
        if (!totals[q.schema]) totals[q.schema] = { total: 0, count: 0 };
        totals[q.schema].total += r.value;
        totals[q.schema].count += 1;
      }
    });
    const scores: Record<string, number> = {};
    Object.entries(totals).forEach(([k, v]) => (scores[k] = v.total / v.count));
    return scores;
  };

  // Submit
  const handleSubmit = async () => {
    try {
      const scores = calculateCategoryScores();
      setCategoryScores(scores);
      const topCategory = Object.entries(scores).reduce((a, b) => (scores[a[0]] > scores[b[0]] ? a : b));
      const submissionData = {
        bioData,
        responses,
        categoryScores: scores,
        topCategory: topCategory[0],
        topScore: topCategory[1],
        completedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submissionData),
      });
      if (!res.ok) throw new Error('Failed to save assessment');

      let assessmentId: string | undefined;
      try {
        const data = await res.json();
        assessmentId = data?.assessmentId;
      } catch {
        /* noop */
      }

      setIsSubmitted(true);
      setShowResults(true);
      toast.success('Assessment completed and saved successfully!');

      if (assessmentId) {
        router.push(`/results?justCompleted=1&id=${encodeURIComponent(assessmentId)}`);
      } else {
        setTimeout(() => handleDownloadReport(), 600);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to submit assessment.');
    }
  };

  // Report (fallback/manual)
  const handleDownloadReport = async (assessmentId?: string) => {
    try {
      toast.loading('Generating your Inner Persona summary...');
      const body = assessmentId ? { assessmentId } : { responses, participantData: bioData };

      const res = await fetch('/api/reports/generate-tier1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || 'Failed to generate report');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Leadership_Summary_${bioData.name?.replace(/\s+/g, '_') || 'Report'}_${new Date()
        .toISOString()
        .split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('Inner Persona summary downloaded!');
    } catch (e: any) {
      toast.dismiss();
      toast.error(e?.message || 'Failed to download report.');
    }
  };

  // Paging helpers
  const getCurrentPageQuestions = () => {
    const start = currentPage * questionsPerPage;
    return questions.slice(start, start + questionsPerPage);
  };

  const handleNext = () => {
    const unanswered = getCurrentPageQuestions().filter((q) => !responses[q.id]);
    if (unanswered.length) return toast.error(`Please answer all questions on this page (${unanswered.length})`);
    if (currentPage < Math.ceil(questions.length / questionsPerPage) - 1) setCurrentPage((p) => p + 1);
  };

  const handlePrevious = () => currentPage > 0 && setCurrentPage((p) => p - 1);

  const isLast = currentPage === Math.ceil(questions.length / questionsPerPage) - 1;
  const isFirst = currentPage === 0;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  // Loading
  if (questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fcd0b1]-50 to-[#fcd0b1]-100">
        <Card className="bg-white shadow-xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bg-background-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Assessment</h3>
            <p className="text-gray-500">Preparing your 108-question Inner Persona assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Bio
  if (!bioCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fcd0b1]-50 to-[#fcd0b1]-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AnimatedLogo />
              </div>
              <CardTitle className="text-2xl font-bold text-[#fcd0b1]-700">Personal Information</CardTitle>
              <CardDescription>Please provide your details to begin the Inner Personas Assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBioSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" value={bioData.name} onChange={handleBioChange} required />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={bioData.email} onChange={handleBioChange} required />
                </div>
                <div>
                  <Label htmlFor="team">Team/Organization *</Label>
                  <Input id="team" name="team" value={bioData.team} onChange={handleBioChange} required />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-[#fcd0b1]-600 to-bg-background-600 hover:from-[#fcd0b1]-700 hover:to-bg-background-700" size="lg">
                  Begin Assessment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Questions
  const currentQuestions = getCurrentPageQuestions();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcd0b1]-50 to-[#fcd0b1]-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-xl font-bold text-[#fcd0b1]-700">Inner Personas Assessment</CardTitle>
              <div className="text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress: {Math.round(progress)}% complete</span>
                <span>
                  {Object.keys(responses).length} of {questions.length} answered
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentQuestions.map((q, index) => {
              const displayNumber = currentPage * questionsPerPage + index + 1;
              return (
                <Card key={q.id} className="border border-gray-200">
                  <CardHeader>
                    <div className="text-xs text-gray-500 mb-1">Question {displayNumber} of {questions.length}</div>
                    <CardTitle className="text-lg font-medium text-gray-800">
                      {cleanQuestionText(q.statement)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={responses[q.id]?.value?.toString() || ''}
                      onValueChange={(v) => handleResponse(q.id, parseInt(v))}
                    >
                      <div className="grid grid-cols-6 gap-3">
                        {likertOptions.map((o) => (
                          <div key={o.value} className="flex flex-col items-center space-y-2">
                            <RadioGroupItem value={o.value.toString()} id={`${q.id}-${o.value}`} className="scale-125" />
                            <Label htmlFor={`${q.id}-${o.value}`} className="text-xs text-center leading-tight cursor-pointer">
                              {o.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              );
            })}

            <div className="flex justify-between items-center pt-6 border-t">
              <Button onClick={handlePrevious} disabled={currentPage === 0} variant="outline" className="flex items-center space-x-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="text-sm text-gray-600">
                {currentQuestions.filter((q) => responses[q.id]).length} of {currentQuestions.length} answered on this page
              </div>

              {currentPage === Math.ceil(questions.length / questionsPerPage) - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(responses).length !== questions.length}
                  className="bg-gradient-to-r from-green-600 to-bg-background-600 hover:from-green-700 hover:to-bg-background-700 flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Assessment</span>
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={currentQuestions.filter((q) => responses[q.id]).length !== currentQuestions.length}
                  className="bg-gradient-to-r from-[#fcd0b1]-600 to-bg-background-600 hover:from-[#fcd0b1]-700 hover:to-bg-background-700 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
