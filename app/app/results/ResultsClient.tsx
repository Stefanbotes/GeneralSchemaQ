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
  const assessmentId = (search.get('id') || '').trim();
  const [downloading, setDownloading] = useState(false);
  const didAuto = useRef(false);

  useEffect(() => {
    if (justCompleted && assessmentId && !didAuto.current) {
      didAuto.current = true;
      void downloadTier1(assessmentId);
    }
  }, [justCompleted, assessmentId]);

  const downloadTier1 = async (id: string) => {
    try {
      setDownloading(true);
      toast.loading('Generating your Inner Persona summary...');
      const res = await fetch('/api/reports/generate-tier1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: id }),
      });

      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.error || 'Failed to generate report');
      }

      const blob = await res.blob();
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 p-6">
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
                disabled={!assessmentId || downloading}
                className="px-6"
              >
                {downloading ? 'Generating…' : 'Download summary again'}
              </Button>
            </div>

            {!assessmentId && (
              <p className="text-sm text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                We couldn’t detect an assessment ID. Please return to the dashboard and open this page
                with a link like <code>/results?id=&lt;assessmentId&gt;</code>.
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

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

