import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as wellnessService from '../services/wellnessService';
import { VitalLog, WeightLogEntry, ActivityLog, SleepLog, HydrationLog, MoodLog } from '../types';
import PlusIcon from '../components/icons/PlusIcon';
import HeartbeatIcon from '../components/icons/HeartbeatIcon';
import { sanitizeForLog } from '../utils/securityUtils';

type WellnessTab = 'vitals' | 'weight' | 'activity' | 'sleep' | 'hydration' | 'mood';

const WellnessPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<WellnessTab>('vitals');
  const [vitals, setVitals] = useState<VitalLog[]>([]);
  const [weights, setWeights] = useState<WeightLogEntry[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [sleep, setSleep] = useState<SleepLog[]>([]);
  const [hydration, setHydration] = useState<HydrationLog[]>([]);
  const [moods, setMoods] = useState<MoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    const loadData = async () => {
      try {
        const [vitalsData, weightsData, activitiesData, sleepData, hydrationData, moodsData] = await Promise.all([
          wellnessService.getVitals(currentUser.id),
          wellnessService.getWeightLogs(currentUser.id),
          wellnessService.getActivityLogs(currentUser.id),
          wellnessService.getSleepLogs(currentUser.id),
          wellnessService.getHydrationLogs(currentUser.id),
          wellnessService.getMoodLogs(currentUser.id)
        ]);
        
        setVitals(vitalsData);
        setWeights(weightsData);
        setActivities(activitiesData);
        setSleep(sleepData);
        setHydration(hydrationData);
        setMoods(moodsData);
      } catch (error) {
        console.error('Failed to load wellness data:', sanitizeForLog(error));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const TabButton: React.FC<{ tab: WellnessTab; label: string; icon: React.ReactNode }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
        activeTab === tab
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const VitalsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Vitals</h3>
        <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <PlusIcon className="w-4 h-4" />
          <span>Add Vital</span>
        </button>
      </div>
      {vitals.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No vitals logged yet</p>
      ) : (
        <div className="space-y-2">
          {vitals.map((vital) => (
            <div key={vital.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{vital.type}</p>
                  <p className="text-sm text-gray-500">{vital.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {vital.type === 'BloodPressure' && `${vital.value.systolic}/${vital.value.diastolic} mmHg`}
                    {vital.type === 'HeartRate' && `${vital.value.bpm} bpm`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const WeightTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Weight & BMI</h3>
        <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <PlusIcon className="w-4 h-4" />
          <span>Log Weight</span>
        </button>
      </div>
      {weights.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No weight logs yet</p>
      ) : (
        <div className="space-y-2">
          {weights.map((weight) => (
            <div key={weight.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Weight</p>
                  <p className="text-sm text-gray-500">{weight.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{weight.weight} {weight.unit}</p>
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
      case 'vitals': return <VitalsTab />;
      case 'weight': return <WeightTab />;
      case 'activity': return <div>Activity tracking coming soon...</div>;
      case 'sleep': return <div>Sleep tracking coming soon...</div>;
      case 'hydration': return <div>Hydration tracking coming soon...</div>;
      case 'mood': return <div>Mood tracking coming soon...</div>;
      default: return <VitalsTab />;
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to access wellness tracking.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading wellness data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-textPrimary">Wellness Tools</h2>
      </div>

      <div className="flex flex-wrap gap-2 border-b">
        <TabButton tab="vitals" label="Vitals" icon={<HeartbeatIcon className="w-4 h-4" />} />
        <TabButton tab="weight" label="Weight & BMI" icon={<span>⚖️</span>} />
        <TabButton tab="activity" label="Activity" icon={<span>🏃</span>} />
        <TabButton tab="sleep" label="Sleep" icon={<span>😴</span>} />
        <TabButton tab="hydration" label="Hydration" icon={<span>💧</span>} />
        <TabButton tab="mood" label="Mood" icon={<span>😊</span>} />
      </div>

      <div className="bg-surface rounded-xl shadow-lg p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default WellnessPage;