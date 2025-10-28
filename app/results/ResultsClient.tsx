// app/results/ResultsClient.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ResultsClient() {
  const search = useSearchParams();
  const router = useRouter();

  const justCompleted = search.get('justCompleted') === '1';
  const qsId = (search.get('id') || '').trim();

  const [assessmentId, setAssessmentId] = useState<string>(qsId);
  const [downloading, setDownloading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const didAuto = useRef(false);

  // If no id provided in the URL, try to resolve the latest completed assessment for this user
  useEffect(() => {
    const resolveLatestIfNeeded = async () => {
      if (assessmentId) return;
      try {
        setResolving(true);
        const res = await fetch('/api/assessments/latest', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include', // ✅ send cookies/session
        });

        const txt = await res.text().catch(() => '');
        const data = tryJson(txt);

        if (!res.ok) {
          const msg = (data?.error as string) || txt || 'Could not resolve latest assessment';
          throw new Error(msg);
        }

        if (data?.assessmentId) {
          setAssessmentId(String(data.assessmentId));
        } else {
          throw new Error('No completed assessments found for this account.');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Unable to find your latest completed assessment.');
      } finally {
        setResolving(false);
      }
    };

    void resolveLatestIfNeeded();
  }, [assessmentId]);

  // Auto-download once after completion OR whenever we have an id (if user opened a direct link)
  useEffect(() => {
    if (!didAuto.current && assessmentId && (justCompleted || qsId)) {
      didAuto.current = true;
      void downloadTier1(assessmentId);
    }
  }, [assessmentId, justCompleted, qsId]);

  const downloadTier1 = async (id: string) => {
    try {
      setDownloading(true);
      toast.loading('Generating your Inner Persona summary...');
      const res = await fetch('/api/reports/generate-tier1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ send cookies/session
        body: JSON.stringify({ assessmentId: id }), // ✅ DB lookup mode
      });

      const txt = await res.text().catch(() => '');
      if (!res.ok) {
        const msg = (tryJson(txt)?.error as string) || txt || 'Failed to generate report';
        throw new Error(msg);
      }

      const blob = new Blob([txt], { type: res.headers.get('Content-Type') || 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Leadership_Summary_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('Summary downloaded!');
    } catch (e: any) {
      toast.dismiss();
      toast.error(e?.message || 'Failed to download report.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcd0b1]-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Thank you!</CardTitle>
            <CardDescription>
              {justCompleted
                ? 'Your assessment is complete. Your Tier-1 summary should download automatically.'
                : 'You can download your Tier-1 summary again below.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Button
                onClick={() => assessmentId && downloadTier1(assessmentId)}
                disabled={!assessmentId || downloading || resolving}
                className="px-6"
              >
                {downloading ? 'Generating…' : resolving ? 'Finding your latest…' : 'Download summary again'}
              </Button>
            </div>

            {!assessmentId && !resolving && (
              <p className="text-sm text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                We couldn’t detect an assessment ID and couldn’t find a recent completed one.
                Please return to the dashboard and open this page with a link like{' '}
                <code>/results?id=&lt;assessmentId&gt;</code>.
              </p>
            )}

            <div className="text-xs text-gray-500 text-center">
              If your browser blocked the download, click “Download summary again”.
            </div>

            <div className="text-center">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Back to dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function tryJson(txt: string | undefined | null): any | null {
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch {
    return null;
  }
}
