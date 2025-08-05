import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as womensHealthService from '../services/womensHealthService';
import { PlusIcon } from '../components/icons/PlusIcon';
import { FemaleIcon } from '../components/icons/FemaleIcon';

type WomensTab = 'periods' | 'symptoms' | 'screenings';

const WomensCarePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<WomensTab>('periods');
  const [periods, setPeriods] = useState<any[]>([]);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [screenings, setScreenings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    const loadData = async () => {
      try {
        const [periodsData, symptomsData, screeningsData] = await Promise.all([
          womensHealthService.getPeriodEntries(currentUser.id),
          womensHealthService.getSymptomLogs(currentUser.id),
          womensHealthService.getScreeningReminders(currentUser.id)
        ]);
        
        setPeriods(periodsData);
        setSymptoms(symptomsData);
        setScreenings(screeningsData);
      } catch (error) {
        console.error('Failed to load women\'s health data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const TabButton: React.FC<{ tab: WomensTab; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-lg transition ${
        activeTab === tab
          ? 'bg-pink-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const PeriodsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Period Tracker</h3>
        <button className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <PlusIcon className="w-4 h-4" />
          <span>Log Period</span>
        </button>
      </div>
      {periods.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No periods logged yet</p>
      ) : (
        <div className="space-y-2">
          {periods.map((period) => (
            <div key={period.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Period</p>
                  <p className="text-sm text-gray-500">{period.start_date} - {period.end_date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-pink-600">
                    {Math.ceil((new Date(period.end_date).getTime() - new Date(period.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const SymptomsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Symptom Diary</h3>
        <button className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <PlusIcon className="w-4 h-4" />
          <span>Log Symptoms</span>
        </button>
      </div>
      {symptoms.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No symptoms logged yet</p>
      ) : (
        <div className="space-y-2">
          {symptoms.map((symptom) => (
            <div key={symptom.id} className="bg-white p-4 rounded-lg shadow">
              <div>
                <p className="font-medium">{symptom.date}</p>
                <p className="text-sm text-gray-600">{symptom.symptoms.join(', ')}</p>
                {symptom.severity && <p className="text-xs text-gray-500">Severity: {symptom.severity}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ScreeningsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Screening Reminders</h3>
        <button className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <PlusIcon className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>
      {screenings.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No screening reminders set</p>
      ) : (
        <div className="space-y-2">
          {screenings.map((screening) => (
            <div key={screening.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{screening.screening_type}</p>
                  <p className="text-sm text-gray-500">
                    {screening.last_screening_date ? `Last: ${screening.last_screening_date}` : 'Never done'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-orange-600">
                    {screening.next_due_date ? `Due: ${screening.next_due_date}` : 'Schedule needed'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'periods': return <PeriodsTab />;
      case 'symptoms': return <SymptomsTab />;
      case 'screenings': return <ScreeningsTab />;
      default: return <PeriodsTab />;
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to access women's health tracking.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading women's health data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <FemaleIcon className="w-8 h-8 text-pink-500" />
          <h2 className="text-3xl font-bold text-textPrimary">Women's Wellness Hub</h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b">
        <TabButton tab="periods" label="Period Tracker" />
        <TabButton tab="symptoms" label="Symptom Diary" />
        <TabButton tab="screenings" label="Screening Reminders" />
      </div>

      <div className="bg-surface rounded-xl shadow-lg p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default WomensCarePage;