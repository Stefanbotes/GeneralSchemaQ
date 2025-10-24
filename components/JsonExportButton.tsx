
// Client-side component for JSON assessment data export

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Database, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface JsonExportButtonProps {
  userId: string;
  assessmentId: string;
  userName: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function JsonExportButton({ 
  userId, 
  assessmentId, 
  userName, 
  className = '', 
  size = 'sm' 
}: JsonExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      toast.loading(`Generating JSON export for ${userName}...`);

      const response = await fetch('/api/export/json-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          assessmentId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to generate JSON export';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = `${errorMessage} (Status: ${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      // Download the JSON export
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Extract filename from response headers or generate default
      const contentDisposition = response.headers.get('content-disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 
        `Assessment_Export_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success('JSON assessment export downloaded successfully!');

    } catch (error) {
      console.error('Error exporting JSON:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.dismiss();
      toast.error(`Failed to export JSON: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting}
      size={size}
      className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export JSON
        </>
      )}
    </Button>
  );
}
