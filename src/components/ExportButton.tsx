'use client';

import { useState } from 'react';
import { exportToCSV } from '@/utils/analyticsEngine';
import type { ExportData } from '@/types/analytics';

interface ExportButtonProps {
  sellerId: string;
  dataType: 'sales' | 'customers' | 'products' | 'inventory';
  label?: string;
  className?: string;
}

export default function ExportButton({ sellerId, dataType, label, className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    const exportData: ExportData = {
      type: dataType,
      format: 'csv',
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
    };

    const csvContent = exportToCSV(exportData, sellerId);
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataType}-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsExporting(false), 1000);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={
        className ||
        `px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2`
      }
    >
      {isExporting ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          📥 {label || `Export ${dataType}`}
        </>
      )}
    </button>
  );
}
