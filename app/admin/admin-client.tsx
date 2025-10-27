
// Client component for admin export functionality
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Database } from 'lucide-react';
import { toast } from 'sonner';

interface AdminStats {
  totaluser: number;
  totalAssessments: number;
  verifieduser: number;
  unverifieduser: number;
}

interface AdminClientProps {
  stats: AdminStats;
}

export function AdminClient({ stats }: AdminClientProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setExporting(format);
      toast.loading(`Preparing ${format.toUpperCase()} export...`);

      const response = await fetch(`/api/admin/export-data?format=${format}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `leadership_assessment_data_${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          filename = fileNameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success(`${format.toUpperCase()} export completed successfully!`);

    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss();
      toast.error(`Failed to export ${format.toUpperCase()} data. Please try again.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Tools Section */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2 text-primary600" />
            Data Export Tools
          </CardTitle>
          <CardDescription>
            Export assessment data and user information for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold">JSON Export</h4>
              </div>
              <p className="text-sm text-gray-600">
                Structured data format ideal for programmatic analysis and integration with other tools.
              </p>
              <Button
                onClick={() => handleExport('json')}
                disabled={exporting === 'json'}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {exporting === 'json' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </div>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export as JSON
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-primary600" />
                <h4 className="font-semibold">CSV Export</h4>
              </div>
              <p className="text-sm text-gray-600">
                Spreadsheet-friendly format perfect for Excel analysis, charts, and data visualization.
              </p>
              <Button
                onClick={() => handleExport('csv')}
                disabled={exporting === 'csv'}
                className="w-full bg-primary600 hover:bg-primary700 text-white"
              >
                {exporting === 'csv' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </div>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export as CSV
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-primary50 rounded-lg">
            <h4 className="font-semibold text-primary800 mb-2">Export Contents Include:</h4>
            <ul className="text-sm text-primary700 space-y-1">
              <li>• All user registration data and verification status</li>
              <li>• Complete assessment responses and scores</li>
              <li>• Inner Persona mappings and results</li>
              <li>• Timestamps and completion statistics</li>
              <li>• Anonymized unique identifiers for privacy</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-white">Current Database Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.totalUser}</div>
              <div className="text-indigo-100">Total Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalAssessments}</div>
              <div className="text-indigo-100">Assessments</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
              <div className="text-indigo-100">Verified</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.unverifiedUsers}</div>
              <div className="text-indigo-100">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
