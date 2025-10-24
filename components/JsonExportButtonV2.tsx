
/**
 * Client-side component for LASBI v1.3.0 Surgical JSON Export
 * 
 * Generates order-independent Studio-compatible exports with:
 * - itemId (cmf... modern LASBI id)
 * - canonicalId (d.s.q format)
 * - value (1..5)
 * - index (UI order 1..54)
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Database, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface JsonExportButtonV2Props {
  userId: string;
  assessmentId: string;
  userName: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'secondary' | 'outline';
}

export function JsonExportButtonV2({ 
  userId, 
  assessmentId, 
  userName, 
  className = '', 
  size = 'sm',
  variant = 'default'
}: JsonExportButtonV2Props) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      toast.loading(`Generating LASBI v1.3.0 export for ${userName}...`);

      const response = await fetch('/api/export/json-assessment-v2', {
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
        let errorMessage = 'Failed to generate surgical export';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
          if (errorJson.details && Array.isArray(errorJson.details)) {
            console.error('Export validation errors:', errorJson.details);
          }
        } catch (e) {
          errorMessage = `${errorMessage} (Status: ${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      // Download the export
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Extract filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 
        `LASBI_Export_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}_v1.3.0.json`;
      
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success('LASBI v1.3.0 surgical export downloaded successfully!');

    } catch (error) {
      console.error('Error exporting surgical JSON:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.dismiss();
      toast.error(`Failed to export: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting}
      size={size}
      variant={variant}
      className={className}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export LASBI v1.3.0
        </>
      )}
    </Button>
  );
}
