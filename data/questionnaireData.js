// Client component for the Leadership Personas Assessment - Clean Version (hardened)
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
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  BarChart3,
  Trophy,
  Download,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  order: number; // kept for compatibility; not displayed
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

/**
 * Strong cleaner for leading numbering:
 * - Normalizes Unicode (NFKC)
 * - Replaces non-breaking/zero-width spaces
 * - Strips patterns like:
 *   "13.", "13 )", "(13)", "[13] -", "13–", "１３．", "13:" and "13 " etc.
 */
const cleanQuestionText = (raw: string) => {
  if (!raw) return '';
  const normalized = raw
    .normalize('NFKC')
    .replace(/\u00A0/g, ' ')                 // nbsp -> space
    .replace(/[\u2000-\u200D\u2060]/g, '');  // zero-width & similar

  // Digits: ASCII 0-9 + fullwidth ０-９
  // Dots: . FF0E fullwidth dot, 2024 one dot leader, 2027 hyphenation point, 3002 ideographic full stop, plus common punctuation
  const stripped = normalized.replace(
    /^\s*[\(\[]?\s*[0-9\uFF10-\uFF19]{1,3}\s*[\)\]\.\uFF0E\u2024\u2027\u3002:–—-]?\s*/,
    ''
  );

  // Safety fallback: if it still starts with digits + space, strip that too
  return stripped.replace(/^\s*[0-9]{1,3}\s+/, '').trim();
};

export function AssessmentClient() {
  const { data: session } = useSession() || {};
  const router = useRouter();

  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [bioData, setBioData] = useState<BioData>({
    name: '',
    email: '',
    team: '',
    uniqueCode: crypto.randomUUID()
  });
  const [bioCompleted, setBioCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (session?.user) {
      setBioData(prev => ({
        ...prev,
        name: prev.name || `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim(),
        email: prev.email || session.user.email || ''
      }));
    }
  }, [session]);

  const questionsPerPage = 5;

  const likertOptions = [
    { value: 1, label: 'Strongly Disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Slightly Disagree' },
    { value: 4, label: 'Slightly Agree' },
    { value: 5, label: 'Agree' },
    { value: 6, label: 'Strongly Agree' }
  ];

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setQuestionsLoading(true);
        const response = await fetch('/api/assessment/questions');
        if (!response.ok) throw new Error('Failed to load questions');

        const data = await response.json();
        if (data.success && data.questions) {
          const shuffled = shuffleArray(data.questions as Question[]);
          setQuestions(shuffled);
        } else {
          throw new Error('Invalid questions data received');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load assessment questions. Please refresh.');
      } finally {
        setQuestionsLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => {
      const updated = { ...prev, [questionId]: { value, timestamp: new Date().toISOString() } };
      const total = questions.length;
      const answered = Object.keys(updated).length;
      setProgress(total ? (answered / total) * 100 : 0);
      return updated;
    });
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBioData(prev => ({ ...prev, [name]: value }));
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

  const calculateCategoryScores = (): Record<string, number> => {
    const totals: Record<string, { total: number; count: number }> = {};
    questions.forEach(q => {
      if (q.schema && responses[q.id]) {
        if (!totals[q.schema]) totals[q.schema] = { total: 0, count: 0 };
        totals[q.schema].total += responses[q.id].value;
        totals[q.schema].count++;
      }
    });
    const scores: Record<string, number> = {};
    Object.entries(totals).forEach(([k, v]) => (scores[k] = v.total / v.count));
    return scores;
  };

  const handleSubmit = async () => {
    try {
      const scores = calculateCategoryScores();
      setCategoryScores(scores);
      const topCategory = Object.entries(scores).reduce((a, b) =>
        scores[a[0]] > scores[b[0]] ? a : b
      );
      const submissionData = {
        bioData,
        responses,
        categoryScores: scores,
        topCategory: topCategory[0],
        topScore: topCategory[1],
        completedAt: new Date().toISOString()
      };

      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      if (!res.ok) throw new Error('Failed to save assessment');

      setIsSubmitted(true);
      setShowResults(true);
      toast.success('Assessment completed and saved successfully!');
      setTimeout(() => handleDownloadReport(), 1000);
    } catch (e) {
      console.error(e);
      toast.error('Failed to submit assessment.');
    }
  };

  const handleDownloadReport = async () => {
    try {
      toast.loading('Generating your leadership summary...');
      const res = await fetch('/api/reports/generate-tier1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          participantData: bioData,
          assessmentId: `assess_${Date.now()}`
        })
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Leadership_Summary_${bioData.name?.replace(/\s+/g, '_') || 'Report'}_${
        new Date().toISOString().split('T')[0]
      }.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('Leadership summary downloaded!');
    } catch {
      toast.dismiss();
      toast.error('Failed to download report.');
    }
  };

  const getCurrentPageQuestions = () => {
    const start = currentPage * questionsPerPage;
    return questions.slice(start, start + questionsPerPage);
  };

  const handleNext = () => {
    const unanswered = getCurrentPageQuestions().filter(q => !responses[q.id]);
    if (unanswered.length)
      return toast.error(`Please answer all questions on this page (${unanswered.length})`);
    if (currentPage < Math.ceil(questions.length / questionsPerPage) - 1)
      setCurrentPage(p => p + 1);
  };

  const handlePrevious = () => currentPage > 0 && setCurrentPage(p => p - 1);

  const isLast = currentPage === Math.ceil(questions.length / questionsPerPage) - 1;
  const isFirst = currentPage === 0;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const currentQuestions = getCurrentPageQuestions();
  const answeredOnPage = currentQuestions.filter(q => responses[q.id]).length;

  if (questionsLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="bg-white shadow-xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Assessment</h3>
            <p className="text-gray-500">Preparing your 108-question leadership assessment...</p>
          </CardContent>
        </Card>
      </div>
    );

  if (!bioCompleted)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AnimatedLogo />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-700">Personal Information</CardTitle>
              <CardDescription>
                Please provide your details to begin the Leadership Personas Assessment
              </CardDescription>
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
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" size="lg">
                  Begin Assessment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-xl font-bold text-blue-700">Leadership Personas Assessment</CardTitle>
              <div className="text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress: {Math.round(progress)}% complete</span>
                <span>{Object.keys(responses).length} of {questions.length} answered</span>
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
                    <div className="text-xs text-gray-500 mb-1">
                      Question {displayNumber} of {questions.length}
                    </div>
                    <CardTitle className="text-lg font-medium text-gray-800">
                      {cleanQuestionText(q.statement)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={responses[q.id]?.value?.toString() || ''}
                      onValueChange={v => handleResponse(q.id, parseInt(v))}
                    >
                      <div className="grid grid-cols-6 gap-3">
                        {likertOptions.map(o => (
                          <div key={o.value} className="flex flex-col items-center space-y-2">
                            <RadioGroupItem
                              value={o.value.toString()}
                              id={`${q.id}-${o.value}`}
                              className="scale-125"
                            />
                            <Label
                              htmlFor={`${q.id}-${o.value}`}
                              className="text-xs text-center leading-tight cursor-pointer"
                            >
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
              <Button onClick={handlePrevious} disabled={isFirst} variant="outline" className="flex items-center space-x-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
              <div className="text-sm text-gray-600">
                {answeredOnPage} of {currentQuestions.length} answered on this page
              </div>
              {isLast ? (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(responses).length !== questions.length}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Assessment</span>
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={answeredOnPage !== currentQuestions.length}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2"
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

