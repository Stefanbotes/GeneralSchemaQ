// app/admin/report-generation.tsx
'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Download, Loader2 } from 'lucide-react';

type CompletedAssessment = {
  id: string;
  completedAt: string | Date | null;
  leadershipPersona?: string | null;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | string;
};

type ReportUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: 'CLIENT' | 'COACH' | 'ADMIN' | string;
  emailVerified?: boolean | Date | null;
  createdAt?: string | Date;
  assessments: CompletedAssessment[];
};

export interface ReportGenerationProps {
  users: ReportUser[];
}

export function ReportGenerationInterface({ users }: ReportGenerationProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [generating, setGenerating] = useState<null | { tier: 1 | 2 | 3 | 'json'; userId: string }>(null);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId]
  );

  const latestAssessment = useMemo<CompletedAssessment | null>(() => {
    if (!selectedUser?.assessments?.length) return null;
    const arr = [...selectedUser.assessments].sort((a, b) => {
      const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return tb - ta;
    });
    return arr[0] ?? null;
  }, [selectedUser]);

  const canGenerate = Boolean(selectedUser && latestAssessment?.status === 'COMPLETED');

  async function doGenerate(tier: 1 | 2 | 3 | 'json') {
    if (!selectedUser || !latestAssessment?.id) {
      toast.error('Select a user with a completed assessment.');
      return;
    }
    setGenerating({ tier, userId: selectedUser.id });

    try {
      // Studio JSON (108) export (LASBI v1.3.0)
      if (tier === 'json') {
        const res = await fetch('/api/exports/lasbi-v1-3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            userId: selectedUser.id,
            assessmentId: latestAssessment.id,
          }),
        });

        if (!res.ok) {
          let msg = res.statusText;
          try {
            const j = await res.json();
            msg = j?.error || j?.details?.[0] || msg;
          } catch {}
          throw new Error(msg || 'Studio export failed');
        }

        const blob = await res.blob();
        const cd = res.headers.get('content-disposition');
        const m = cd?.match(/filename="([^"]+)"/);
        const fallback = `LASBI_Export_${(selectedUser.firstName ?? '').replace(/\s+/g, '_')}_${(selectedUser.lastName ?? '').replace(/\s+/g, '_')}_${new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, 19)}_v1.3.0.json`;
        const filename = m?.[1] ?? fallback;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        toast.success('Studio JSON (108) downloaded');
        return;
      }

      // Tier 1 / 2 / 3 report generation (unchanged)
      const endpoint =
        tier === 1
          ? '/api/reports/generate-tier1'
          : tier === 2
          ? '/api/reports/generate-tier2'
          : '/api/reports/generate-tier3';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: selectedUser.id, assessmentId: latestAssessment.id }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Tier ${tier} report generation failed`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName =
        `${selectedUser.firstName ?? ''}_${selectedUser.lastName ?? ''}`.replace(/\s+/g, '_') ||
        selectedUser.email;
      a.download =
        tier === 1
          ? `Public_Summary_${safeName}.html`
          : tier === 2
          ? `Leadership_Report_${safeName}.pdf`
          : `Clinical_Report_${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(`Tier ${tier} report downloaded`);
    } catch (err: any) {
      toast.error(err?.message || 'Report generation failed');
    } finally {
      setGenerating(null);
    }
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Select user (completed)</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a user" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} — {u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Badge variant="outline" className="mt-6">
              {selectedUser?.role ?? 'CLIENT'}
            </Badge>
            {selectedUser?.emailVerified ? (
              <Badge variant="secondary" className="mt-6">
                Verified
              </Badge>
            ) : (
              <Badge variant="destructive" className="mt-6">
                Unverified
              </Badge>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {latestAssessment ? (
            <div className="flex flex-wrap items-center gap-2">
              <span>Latest completed assessment:</span>
              <Badge variant="outline">{latestAssessment.id}</Badge>
              {latestAssessment.leadershipPersona && (
                <Badge variant="secondary">{latestAssessment.leadershipPersona}</Badge>
              )}
              {latestAssessment.completedAt && (
                <span className="text-gray-500">
                  on {new Date(latestAssessment.completedAt).toLocaleString()}
                </span>
              )}
            </div>
          ) : (
            <span>Select a user to see their latest assessment.</span>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => doGenerate(1)}
            disabled={!canGenerate || !!generating}
            variant="secondary"
            className="flex items-center gap-2"
            title="Printable Tier 1 HTML (counselling narrative)"
          >
            {generating?.tier === 1 ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Generate Tier 1 (Public)
          </Button>

          <Button
            onClick={() => doGenerate(2)}
            disabled={!canGenerate || !!generating}
            className="flex items-center gap-2"
            title="Leadership report PDF"
          >
            {generating?.tier === 2 ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Generate Tier 2 (Leadership)
          </Button>

          <Button
            onClick={() => doGenerate(3)}
            disabled={!canGenerate || !!generating}
            variant="outline"
            className="flex items-center gap-2"
            title="Clinical report PDF"
          >
            {generating?.tier === 3 ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Generate Tier 3 (Clinical)
          </Button>

          <Button
            onClick={() => doGenerate('json')}
            disabled={!canGenerate || !!generating}
            variant="ghost"
            className="flex items-center gap-2"
            title="Exports LASBI v1.3.0 (108 items) using the Studio JSON lib"
          >
            {generating?.tier === 'json' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download Studio JSON (108)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
