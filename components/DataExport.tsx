import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { exportToCSV, exportToPDF, type ExportData } from '../utils/dataExporter';
import type { MenstrualCycle, PregnancyProfile, VaccinationSchedule, SymptomsDiary } from '../types/phase2Types';

interface DataExportProps {
  cycles?: MenstrualCycle[];
  pregnancyProfile?: PregnancyProfile | null;
  symptoms?: SymptomsDiary[];
  vaccinations?: VaccinationSchedule[];
}

const DataExport: React.FC<DataExportProps> = ({
  cycles = [],
  pregnancyProfile,
  symptoms = [],
  vaccinations = []
}) => {
  const { currentUser } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const prepareExportData = (): ExportData => ({
    cycles,
    pregnancyProfile: pregnancyProfile || undefined,
    symptoms,
    vaccinations,
    exportDate: new Date().toISOString().split('T')[0],
    userName: currentUser?.user_metadata?.name || 'User'
  });

  const handleExport = async (format: 'csv' | 'pdf', type: string) => {
    setIsExporting(true);
    try {
      const data = prepareExportData();
      
      if (format === 'csv') {
        exportToCSV(data, type as 'cycles' | 'symptoms' | 'vaccinations' | 'all');
      } else {
        await exportToPDF(data, type as 'summary' | 'detailed');
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      title: 'Menstrual Cycles',
      description: 'Export cycle tracking data',
      csvType: 'cycles',
      available: cycles.length > 0,
      icon: '🩸'
    },
    {
      title: 'Symptoms Diary',
      description: 'Export symptom logs',
      csvType: 'symptoms',
      available: symptoms.length > 0,
      icon: '📝'
    },
    {
      title: 'Vaccinations',
      description: 'Export vaccination records',
      csvType: 'vaccinations',
      available: vaccinations.length > 0,
      icon: '💉'
    },
    {
      title: 'Complete Health Data',
      description: 'Export all available data',
      csvType: 'all',
      available: cycles.length > 0 || symptoms.length > 0 || vaccinations.length > 0 || pregnancyProfile,
      icon: '📊'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Export Your Health Data</h3>
        <p className="text-sm text-gray-600">
          Download your health information for personal records or sharing with healthcare providers.
        </p>
      </div>

      <div className="space-y-4">
        {exportOptions.map((option) => (
          <div
            key={option.csvType}
            className={`border rounded-lg p-4 ${
              option.available ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <h4 className={`font-medium ${option.available ? 'text-gray-800' : 'text-gray-400'}`}>
                    {option.title}
                  </h4>
                  <p className={`text-sm ${option.available ? 'text-gray-600' : 'text-gray-400'}`}>
                    {option.description}
                  </p>
                </div>
              </div>
              
              {option.available ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleExport('csv', option.csvType)}
                    disabled={isExporting}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    CSV
                  </button>
                  {(option.csvType === 'all') && (
                    <>
                      <button
                        onClick={() => handleExport('pdf', 'summary')}
                        disabled={isExporting}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        PDF Summary
                      </button>
                      <button
                        onClick={() => handleExport('pdf', 'detailed')}
                        disabled={isExporting}
                        className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                      >
                        PDF Detailed
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-400">No data available</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {isExporting && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-blue-700">Preparing your export...</span>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <span className="text-yellow-600">⚠️</span>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Privacy Notice</p>
            <p>
              Exported files contain personal health information. Store securely and share only with 
              authorized healthcare providers. AroSense is not responsible for data security after export.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DataExport;