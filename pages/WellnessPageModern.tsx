import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import DashboardWidget from '../components/ui/DashboardWidget';
import { Input } from '../components/ui/Input';
import { EmptyStateCard } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingSpinner';
import HeartbeatIcon from '../components/icons/HeartbeatIcon';
import PlusIcon from '../components/icons/PlusIcon';
import AppModal from '../components/AppModal';

type WellnessTab = 'overview' | 'vitals' | 'activity' | 'mood' | 'goals';

interface VitalReading {
  id: string;
  type: 'blood_pressure' | 'heart_rate' | 'weight' | 'temperature';
  value: string;
  date: string;
  notes?: string;
}

const WellnessPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<WellnessTab>('overview');
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [vitalForm, setVitalForm] = useState({
    type: 'blood_pressure' as const,
    systolic: '',
    diastolic: '',
    value: '',
    notes: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadWellnessData();
    }
  }, [currentUser]);

  const loadWellnessData = async () => {
    setIsLoading(true);
    try {
      // Mock data for demonstration
      setVitals([
        { id: '1', type: 'blood_pressure', value: '120/80', date: '2024-01-15', notes: 'Morning reading' },
        { id: '2', type: 'heart_rate', value: '72 bpm', date: '2024-01-15' },
        { id: '3', type: 'weight', value: '70 kg', date: '2024-01-14' },
      ]);
    } catch (error) {
      console.error('Failed to load wellness data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitVital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let value = vitalForm.value;
      if (vitalForm.type === 'blood_pressure') {
        value = `${vitalForm.systolic}/${vitalForm.diastolic}`;
      }
      
      const newVital: VitalReading = {
        id: Date.now().toString(),
        type: vitalForm.type,
        value,
        date: new Date().toISOString().split('T')[0],
        notes: vitalForm.notes || undefined
      };
      
      setVitals(prev => [newVital, ...prev]);
      setShowVitalModal(false);
      setVitalForm({
        type: 'blood_pressure',
        systolic: '',
        diastolic: '',
        value: '',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to save vital:', error);
    }
  };

  const TabButton: React.FC<{ tab: WellnessTab; label: string; icon: string }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
        activeTab === tab
          ? 'bg-gradient-to-r from-vibrant-yellow-green-500 to-vibrant-yellow-green-600 text-white shadow-lg transform scale-105'
          : 'bg-white text-gray-600 hover:bg-vibrant-yellow-green-50 hover:text-vibrant-yellow-green-600 shadow-sm'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );

  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget
          title="Blood Pressure"
          value="120/80"
          change={{ value: "Normal range", trend: 'neutral' }}
          icon={<span className="text-2xl">🩺</span>}
          variant="gradient"
          gradient="from-red-500 to-pink-600"
        />
        
        <DashboardWidget
          title="Heart Rate"
          value="72 bpm"
          change={{ value: "Resting rate", trend: 'neutral' }}
          icon={<span className="text-2xl">❤️</span>}
          variant="gradient"
          gradient="from-red-400 to-red-600"
        />
        
        <DashboardWidget
          title="Weight"
          value="70 kg"
          change={{ value: "-0.5kg this week", trend: 'down' }}
          icon={<span className="text-2xl">⚖️</span>}
          variant="gradient"
          gradient="from-blue-500 to-blue-600"
        />
        
        <DashboardWidget
          title="BMI"
          value="22.5"
          change={{ value: "Normal weight", trend: 'neutral' }}
          icon={<span className="text-2xl">📊</span>}
          variant="gradient"
          gradient="from-green-500 to-green-600"
        />
      </div>

      {/* Quick Actions */}
      <Card variant="elevated">
        <CardHeader title="Quick Log" subtitle="Record your health metrics" />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => {
                setVitalForm({...vitalForm, type: 'blood_pressure'});
                setShowVitalModal(true);
              }}
            >
              <span className="text-2xl">🩺</span>
              <span className="text-sm">Blood Pressure</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => {
                setVitalForm({...vitalForm, type: 'heart_rate'});
                setShowVitalModal(true);
              }}
            >
              <span className="text-2xl">❤️</span>
              <span className="text-sm">Heart Rate</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => {
                setVitalForm({...vitalForm, type: 'weight'});
                setShowVitalModal(true);
              }}
            >
              <span className="text-2xl">⚖️</span>
              <span className="text-sm">Weight</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => {
                setVitalForm({...vitalForm, type: 'temperature'});
                setShowVitalModal(true);
              }}
            >
              <span className="text-2xl">🌡️</span>
              <span className="text-sm">Temperature</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Readings */}
      <Card variant="elevated">
        <CardHeader 
          title="Recent Readings" 
          subtitle={`${vitals.length} entries logged`}
          action={
            <Button variant="ghost" size="sm">
              View All
            </Button>
          }
        />
        <CardContent>
          {vitals.length === 0 ? (
            <EmptyStateCard
              icon={<HeartbeatIcon className="w-12 h-12" />}
              title="No readings yet"
              description="Start logging your vitals to track your health progress"
              action={{
                label: "Log First Reading",
                onClick: () => setShowVitalModal(true)
              }}
            />
          ) : (
            <div className="space-y-3">
              {vitals.slice(0, 5).map(vital => (
                <div key={vital.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-vibrant-yellow-green-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">
                        {vital.type === 'blood_pressure' ? '🩺' :
                         vital.type === 'heart_rate' ? '❤️' :
                         vital.type === 'weight' ? '⚖️' : '🌡️'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 capitalize">
                        {vital.type.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600">{vital.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{vital.value}</p>
                    {vital.notes && (
                      <p className="text-xs text-gray-500">{vital.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vibrant-yellow-green-50 to-green-50">
        <Card className="text-center p-8">
          <HeartbeatIcon className="w-16 h-16 text-vibrant-yellow-green-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Please log in to access wellness tools.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-vibrant-yellow-green-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState title="Loading wellness data..." subtitle="Please wait while we fetch your health metrics" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vibrant-yellow-green-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-vibrant-yellow-green-500 to-vibrant-yellow-green-600 rounded-2xl flex items-center justify-center">
              <HeartbeatIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Wellness Tools</h1>
              <p className="text-gray-600 mt-1">Track your health metrics and wellness journey</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton tab="overview" label="Overview" icon="🏠" />
          <TabButton tab="vitals" label="Vitals" icon="🩺" />
          <TabButton tab="activity" label="Activity" icon="🏃" />
          <TabButton tab="mood" label="Mood" icon="😊" />
          <TabButton tab="goals" label="Goals" icon="🎯" />
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'vitals' && (
            <div className="text-center py-16">
              <p className="text-gray-500">Vitals tracking coming soon...</p>
            </div>
          )}
          {activeTab === 'activity' && (
            <div className="text-center py-16">
              <p className="text-gray-500">Activity tracking coming soon...</p>
            </div>
          )}
          {activeTab === 'mood' && (
            <div className="text-center py-16">
              <p className="text-gray-500">Mood tracking coming soon...</p>
            </div>
          )}
          {activeTab === 'goals' && (
            <div className="text-center py-16">
              <p className="text-gray-500">Goal setting coming soon...</p>
            </div>
          )}
        </div>

        {/* Vital Logging Modal */}
        <AppModal
          isOpen={showVitalModal}
          onClose={() => setShowVitalModal(false)}
          title={`Log ${vitalForm.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
        >
          <form onSubmit={handleSubmitVital} className="space-y-6">
            {vitalForm.type === 'blood_pressure' ? (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Systolic"
                  type="number"
                  value={vitalForm.systolic}
                  onChange={(e) => setVitalForm({...vitalForm, systolic: e.target.value})}
                  placeholder="120"
                  required
                />
                <Input
                  label="Diastolic"
                  type="number"
                  value={vitalForm.diastolic}
                  onChange={(e) => setVitalForm({...vitalForm, diastolic: e.target.value})}
                  placeholder="80"
                  required
                />
              </div>
            ) : (
              <Input
                label={`${vitalForm.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Value`}
                value={vitalForm.value}
                onChange={(e) => setVitalForm({...vitalForm, value: e.target.value})}
                placeholder={
                  vitalForm.type === 'heart_rate' ? '72' :
                  vitalForm.type === 'weight' ? '70' :
                  vitalForm.type === 'temperature' ? '36.5' : ''
                }
                required
              />
            )}
            
            <Input
              label="Notes (Optional)"
              value={vitalForm.notes}
              onChange={(e) => setVitalForm({...vitalForm, notes: e.target.value})}
              placeholder="Any additional notes..."
            />
            
            <div className="flex space-x-3 pt-4">
              <Button type="submit" variant="primary" className="flex-1">
                Log Reading
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowVitalModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </AppModal>
      </div>
    </div>
  );
};

export default WellnessPage;