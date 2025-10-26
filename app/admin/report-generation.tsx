
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Download, FileText, AlertTriangle, Users, Database } from 'lucide-react';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
  assessments: {
    id: string;
    completedAt: Date | null;
    leadershipPersona: string | null;
    status: string;
  }[];
}

interface ReportGenerationProps {
  users: UserData[];
}

export function ReportGenerationInterface({ users }: ReportGenerationProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [generating, setGenerating] = useState<{ tier: number | 'json'; userId: string } | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [lastError, setLastError] = useState<string>('');

  // Debug: Log users to console
  console.log('ReportGenerationInterface - Users received:', users);
  
  // Set debug info and auto-select first user for convenience
  useEffect(() => {
    setDebugInfo(`Received ${users.length} users: ${users.map(u => `${u.firstName} ${u.lastName} (${u.assessments?.length || 0} assessments)`).join(', ')}`);
    
    // Auto-select the first user if available for immediate access to print options
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0].id);
      console.log('Auto-selected user:', users[0].firstName, users[0].lastName);
    }
  }, [users, selectedUser]);

  const handleGenerateReport = async (tier: 2 | 3, userId: string) => {
    try {
      setGenerating({ tier, userId });
      
      const user = users.find(u => u.id === userId);
      if (!user) {
        toast.error('User not found');
        return;
      }

      // Get the user's completed assessment
      const latestAssessment = user.assessments?.[0];
      if (!latestAssessment) {
        toast.error('No completed assessment found for this user');
        return;
      }

      toast.loading(`Generating Tier ${tier} report for ${user.firstName} ${user.lastName}...`);

      console.log(`Attempting to generate Tier ${tier} report for user ${userId}, assessment ${latestAssessment.id}`);

      // Use the appropriate endpoint: Tier 3 uses the download endpoint for HTML files
      const endpoint = tier === 3 ? `/api/reports/generate-tier3-download` : `/api/reports/generate-tier${tier}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          assessmentId: latestAssessment.id
        })
      });

      console.log(`API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Tier ${tier} report generation error:`, errorText);
        let errorMessage = `Failed to generate Tier ${tier} report`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = `${errorMessage} (Status: ${response.status}): ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      // Download the report
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const reportType = tier === 2 ? 'Leadership_Detailed' : 'Clinical_Assessment';
      a.download = `${reportType}_Report_${user.firstName}_${user.lastName}_${new Date().toISOString().split('T')[0]}.html`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success(`Tier ${tier} report generated and downloaded successfully!`);

    } catch (error) {
      console.error(`Error generating Tier ${tier} report:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLastError(`Tier ${tier} failed: ${errorMessage}`);
      toast.dismiss();
      toast.error(`Failed to generate Tier ${tier} report: ${errorMessage}`);
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateJsonExport = async (userId: string) => {
    try {
      setGenerating({ tier: 'json', userId });
      
      const user = users.find(u => u.id === userId);
      if (!user) {
        toast.error('User not found');
        return;
      }

      // Get the user's completed assessment
      const latestAssessment = user.assessments?.[0];
      if (!latestAssessment) {
        toast.error('No completed assessment found for this user');
        return;
      }

      toast.loading(`Generating JSON export for ${user.firstName} ${user.lastName}...`);

      console.log(`Attempting to generate JSON export for user ${userId}, assessment ${latestAssessment.id}`);

      const response = await fetch('/api/export/json-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          assessmentId: latestAssessment.id
        })
      });

      console.log(`JSON export API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('JSON export generation error:', errorText);
        let errorMessage = 'Failed to generate JSON export';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = `${errorMessage} (Status: ${response.status}): ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      // Download the JSON export
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Use Studio-compatible filename format
      const completedAt = latestAssessment.completedAt || new Date();
      const timestamp = completedAt.toISOString().replace(/:/g, '-').replace(/\..+Z$/, 'Z');
      const clientId = `client-${user.id.substring(0, 8)}`;
      const assessmentId = `assessment-${latestAssessment.id.substring(0, 8)}`;
      const fileName = `${clientId}_${assessmentId}_${timestamp}_v1.0.0.json`;
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success('JSON assessment export generated and downloaded successfully!');

    } catch (error) {
      console.error('Error generating JSON export:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLastError(`JSON export failed: ${errorMessage}`);
      toast.dismiss();
      toast.error(`Failed to generate JSON export: ${errorMessage}`);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
        <p className="font-medium text-gray-800">Debug Info:</p>
        <p className="text-gray-600 mt-1">{debugInfo}</p>
        <p className="text-gray-600">Selected User: {selectedUser || 'None'}</p>
        {lastError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 font-medium">Last Error:</p>
            <p className="text-red-700 text-xs">{lastError}</p>
          </div>
        )}
      </div>

      {/* Info about available users */}
      {users.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">📊 No completed assessments available</p>
          <p className="text-yellow-700 text-sm mt-1">
            Users must complete their assessments before Tier 2 and 3 reports can be generated. Check back after users finish their evaluations.
          </p>
        </div>
      )}

      {users.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-800 font-medium">✅ {users.length} user(s) with completed assessments</p>
          <p className="text-green-700 text-sm mt-1">
            Select a user below to generate their advanced Inner Persona(Tier 2) or clinical (Tier 3) reports.
          </p>
        </div>
      )}

      {/* User Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select User with Completed Assessment:
            <span className="text-gray-500 text-sm ml-2">({users.length} completed assessments)</span>
          </label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder={users.length > 0 ? "Choose a user with completed assessment..." : "No completed assessments"} />
            </SelectTrigger>
            <SelectContent>
              {users.length > 0 ? (
                users.map((user) => (
                  <SelectItem key={user.id} value={user.id || 'unknown'}>
                    {user.firstName || 'Unknown'} {user.lastName || 'User'} - {user.assessments[0]?.leadershipPersona || 'Assessment Complete'}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-users-available" disabled>
                  No completed assessments available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        {selectedUser && (
          <div className="p-4 bg-gray-50 rounded-lg">
            {(() => {
              const user = users.find(u => u.id === selectedUser);
              const assessment = user?.assessments?.[0];
              return (
                <div className="text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-gray-800">Selected User:</strong>
                    <Badge variant={user?.emailVerified ? 'default' : 'destructive'}>
                      {user?.emailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-gray-600">{user?.email}</p>
                  {assessment && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Latest Assessment:</strong> {assessment.leadershipPersona || 'No persona identified'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Completed: {assessment.completedAt ? new Date(assessment.completedAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Report Generation Buttons */}
      {!selectedUser && users.length > 0 && (
        <div className="bg-primary50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-primary800">👆 Select a user with a completed assessment above to generate their Tier 2 or Tier 3 reports</p>
        </div>
      )}
      
      {selectedUser && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tier 2: Inner PersonaReport */}
          <div className="p-4 border-2 border-blue-200 rounded-lg bg-primary50">
            <div className="flex items-center mb-3">
              <FileText className="h-5 w-5 text-primary600 mr-2" />
              <h4 className="font-semibold text-primary800">Tier 2: Inner PersonaReport</h4>
            </div>
            <p className="text-sm text-primary700 mb-4">
              Comprehensive Inner Personadevelopment report using personas framework. 
              Ideal for coaching and professional development contexts.
            </p>
            <div className="text-xs text-primary600 mb-3">
              <strong>Contains:</strong> Primary persona analysis, supporting patterns, development action plans, Inner Personapattern integration
            </div>
            <Button 
              onClick={() => handleGenerateReport(2, selectedUser)}
              disabled={!selectedUser || (generating?.tier === 2 && generating?.userId === selectedUser)}
              className="w-full bg-primary600 hover:bg-primary700"
            >
              {generating?.tier === 2 && generating?.userId === selectedUser ? (
                <>Generating Tier 2...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Inner PersonaReport
                </>
              )}
            </Button>
          </div>

          {/* Tier 3: Clinical Report */}
          <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h4 className="font-semibold text-red-800">Tier 3: Clinical Report</h4>
            </div>
            <p className="text-sm text-red-700 mb-4">
              Clinical assessment using schema therapy framework. 
              <strong>Requires clinical supervision for proper interpretation.</strong>
            </p>
            <div className="text-xs text-red-600 mb-3">
              <strong>Contains:</strong> Schema activations, clinical formulation, risk assessment, therapeutic recommendations
            </div>
            <Button 
              onClick={() => handleGenerateReport(3, selectedUser)}
              disabled={!selectedUser || (generating?.tier === 3 && generating?.userId === selectedUser)}
              variant="destructive"
              className="w-full"
            >
              {generating?.tier === 3 && generating?.userId === selectedUser ? (
                <>Generating Clinical Report...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Clinical Report
                </>
              )}
            </Button>
            <div className="mt-2 text-xs text-red-600 font-semibold">
              ⚠️ Clinical supervision required
            </div>
          </div>

          {/* JSON Export */}
          <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center mb-3">
              <Database className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">JSON Data Export</h4>
            </div>
            <p className="text-sm text-green-700 mb-4">
              Structured assessment data in JSON format following v1.0.0 specification. 
              <strong>Ideal for research, integration, and data analysis.</strong>
            </p>
            <div className="text-xs text-green-600 mb-3">
              <strong>Contains:</strong> Schema activations, raw responses, risk flags, domain scores, and provenance metadata
            </div>
            <Button 
              onClick={() => handleGenerateJsonExport(selectedUser)}
              disabled={!selectedUser || (generating?.tier === 'json' && generating?.userId === selectedUser)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {generating?.tier === 'json' && generating?.userId === selectedUser ? (
                <>Generating JSON Export...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON Data
                </>
              )}
            </Button>
            <div className="mt-2 text-xs text-green-600">
              📊 Research & integration ready
            </div>
          </div>
        </div>
      )}

      {/* Test Authentication */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-semibold text-orange-800 mb-2">Debug & Test Tools:</h4>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={async () => {
              try {
                const response = await fetch('/api/reports/generate-tier2', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: 'test', assessmentId: 'test' })
                });
                const result = await response.text();
                toast.success(`Auth test: ${response.status} - ${result.substring(0, 100)}...`);
              } catch (error) {
                toast.error(`Auth test error: ${error}`);
              }
            }}
            variant="outline"
            size="sm"
          >
            Test Authentication
          </Button>
          
          {selectedUser && (
            <Button 
              onClick={async () => {
                try {
                  const user = users.find(u => u.id === selectedUser);
                  const assessment = user?.assessments?.[0];
                  
                  if (!user || !assessment) {
                    toast.error('No user or assessment selected');
                    return;
                  }

                  const response = await fetch('/api/test-report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      userId: selectedUser, 
                      assessmentId: assessment.id 
                    })
                  });
                  
                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Test_Report_${user.firstName}_${user.lastName}.html`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    toast.success('Test report generated successfully!');
                  } else {
                    const error = await response.text();
                    toast.error(`Test failed: ${response.status} - ${error}`);
                  }
                } catch (error) {
                  toast.error(`Test error: ${error}`);
                }
              }}
              variant="secondary"
              size="sm"
            >
              Generate Test Report
            </Button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Report Generation Guidelines:
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li><strong>Tier 1:</strong> Automatically downloaded when users complete assessments</li>
          <li><strong>Tier 2:</strong> For Inner Personacoaching and professional development contexts</li>
          <li><strong>Tier 3:</strong> Only for clinical supervision and therapeutic intervention planning</li>
          <li><strong>JSON Export:</strong> Structured data for research, integration, and analysis (v1.0.0 specification)</li>
          <li><strong>Security:</strong> Advanced reports and data exports are admin-only for quality assurance and appropriate use</li>
        </ul>
      </div>
    </div>
  );
}
