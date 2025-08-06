import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as womensHealthService from '../services/womensHealthServicePhase2';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import DashboardWidget from '../components/ui/DashboardWidget';
import { Input, Textarea } from '../components/ui/Input';
import { EmptyStateCard } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingSpinner';
import FemaleIcon from '../components/icons/FemaleIcon';
import PlusIcon from '../components/icons/PlusIcon';
import AppModal from '../components/AppModal';

type WomensCareTab = 'overview' | 'cycle' | 'symptoms' | 'screenings';

interface MenstrualCycle {
  id: string;
  start_date: string;
  end_date?: string;
  cycle_length?: number;
  flow_intensity: 'light' | 'moderate' | 'heavy';
  notes?: string;
}

interface SymptomEntry {
  id: string;
  log_date: string;
  symptoms: string[];
  mood?: string;
  energy_level: number;
  notes?: string;
}

const WomensCarePageModern: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<WomensCareTab>('overview');
  const [cycles, setCycles] = useState<MenstrualCycle[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [cycleForm, setCycleForm] = useState({
    start_date: '',
    flow_intensity: 'moderate' as const,
    notes: ''
  });
  const [symptomForm, setSymptomForm] = useState({
    log_date: new Date().toISOString().split('T')[0],
    symptoms: [] as string[],
    mood: '',
    energy_level: 3,
    notes: ''
  });

  const commonSymptoms = [
    'Cramps', 'Bloating', 'Headache', 'Mood Swings', 'Fatigue',
    'Tender Breasts', 'Acne', 'Nausea', 'Back Pain', 'Food Cravings'
  ];

  const moodOptions = ['Happy', 'Sad', 'Anxious', 'Irritable', 'Calm', 'Energetic'];

  useEffect(() => {
    if (currentUser) {
      loadWomensHealthData();
    }
  }, [currentUser]);

  const loadWomensHealthData = async () => {
    setIsLoading(true);
    try {
      const [cyclesData, symptomsData] = await Promise.all([
        womensHealthService.getMenstrualCycles(),
        womensHealthService.getSymptomsDiary()
      ]);
      setCycles(cyclesData);
      setSymptoms(symptomsData);
    } catch (error) {
      console.error('Failed to load women\'s health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await womensHealthService.createMenstrualCycle(cycleForm);
      await loadWomensHealthData();
      setShowCycleModal(false);
      setCycleForm({ start_date: '', flow_intensity: 'moderate', notes: '' });
    } catch (error) {
      console.error('Failed to log cycle:', error);
    }
  };

  const handleSubmitSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await womensHealthService.createSymptomsDiary(symptomForm);
      await loadWomensHealthData();
      setShowSymptomModal(false);
      setSymptomForm({
        log_date: new Date().toISOString().split('T')[0],
        symptoms: [],
        mood: '',
        energy_level: 3,
        notes: ''
      });
    } catch (error) {
      console.error('Failed to log symptoms:', error);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setSymptomForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const TabButton: React.FC<{ tab: WomensCareTab; label: string; icon: string }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
        activeTab === tab
          ? 'bg-gradient-to-r from-empowering-pink-500 to-empowering-pink-600 text-white shadow-lg transform scale-105'
          : 'bg-white text-gray-600 hover:bg-empowering-pink-50 hover:text-empowering-pink-600 shadow-sm'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );

  const OverviewTab = () => {
    const currentCycle = cycles[0];
    const avgCycleLength = cycles.length > 0 ? Math.round(cycles.reduce((sum, c) => sum + (c.cycle_length || 28), 0) / cycles.length) : 28;
    
    return (
      <div className="space-y-8">
        {/* Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardWidget
            title="Current Cycle"
            value={currentCycle ? `Day ${Math.ceil((new Date().getTime() - new Date(currentCycle.start_date).getTime()) / (1000 * 60 * 60 * 24))}` : 'Not tracking'}
            icon={<span className="text-2xl">🌸</span>}
            variant="gradient"
            gradient="from-pink-500 to-rose-600"
          />
          
          <DashboardWidget
            title="Avg Cycle Length"
            value={`${avgCycleLength} days`}
            icon={<span className="text-2xl">📅</span>}
            variant="gradient"
            gradient="from-purple-500 to-pink-600"
          />
          
          <DashboardWidget
            title="Cycles Tracked"
            value={cycles.length}
            icon={<span className="text-2xl">📊</span>}
            variant="gradient"
            gradient="from-rose-500 to-pink-600"
          />
          
          <DashboardWidget
            title="Symptoms Logged"
            value={symptoms.length}
            icon={<span className="text-2xl">📝</span>}
            variant="gradient"
            gradient="from-pink-500 to-purple-600"
          />
        </div>

        {/* Quick Actions */}
        <Card variant="elevated">
          <CardHeader title="Quick Log" subtitle="Track your health today" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 border-pink-200 hover:bg-pink-50"
                onClick={() => setShowCycleModal(true)}
              >
                <span className="text-2xl">🌸</span>
                <span className="text-sm">Log Period</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 border-purple-200 hover:bg-purple-50"
                onClick={() => setShowSymptomModal(true)}
              >
                <span className="text-2xl">📝</span>
                <span className="text-sm">Log Symptoms</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader title="Recent Cycles" subtitle={`${cycles.length} cycles tracked`} />
            <CardContent>
              {cycles.length === 0 ? (
                <EmptyStateCard
                  icon={<span className="text-4xl">🌸</span>}
                  title="No cycles tracked"
                  description="Start tracking your menstrual cycle"
                  action={{
                    label: "Log First Cycle",
                    onClick: () => setShowCycleModal(true)
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {cycles.slice(0, 3).map(cycle => (
                    <div key={cycle.id} className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-800">{new Date(cycle.start_date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600 capitalize">{cycle.flow_intensity} flow</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-pink-600">
                          {cycle.cycle_length ? `${cycle.cycle_length} days` : 'Ongoing'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Recent Symptoms" subtitle={`${symptoms.length} entries logged`} />
            <CardContent>
              {symptoms.length === 0 ? (
                <EmptyStateCard
                  icon={<span className="text-4xl">📝</span>}
                  title="No symptoms logged"
                  description="Track your symptoms and mood"
                  action={{
                    label: "Log First Entry",
                    onClick: () => setShowSymptomModal(true)
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {symptoms.slice(0, 3).map(symptom => (
                    <div key={symptom.id} className="p-3 bg-purple-50 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-800">{new Date(symptom.log_date).toLocaleDateString()}</p>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`text-xs ${i < symptom.energy_level ? 'text-yellow-500' : 'text-gray-300'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {symptom.symptoms.slice(0, 3).map((s, index) => (
                          <span key={index} className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-xs">
                            {s}
                          </span>
                        ))}
                        {symptom.symptoms.length > 3 && (
                          <span className="text-xs text-gray-500">+{symptom.symptoms.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-empowering-pink-50 to-purple-50">
        <Card className="text-center p-8">
          <FemaleIcon className="w-16 h-16 text-empowering-pink-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Please log in to access women's care.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-empowering-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState title="Loading women's health data..." subtitle="Please wait while we fetch your health information" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-empowering-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-empowering-pink-500 to-empowering-pink-600 rounded-2xl flex items-center justify-center">
              <FemaleIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Women's Care</h1>
              <p className="text-gray-600 mt-1">Track your menstrual health and wellness journey</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton tab="overview" label="Overview" icon="🏠" />
          <TabButton tab="cycle" label="Cycle Tracking" icon="🌸" />
          <TabButton tab="symptoms" label="Symptoms" icon="📝" />
          <TabButton tab="screenings" label="Screenings" icon="🏥" />
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'cycle' && (
            <div className="text-center py-16">
              <p className="text-gray-500">Detailed cycle tracking coming soon...</p>
            </div>
          )}
          {activeTab === 'symptoms' && (
            <div className="text-center py-16">
              <p className="text-gray-500">Detailed symptom analysis coming soon...</p>
            </div>
          )}
          {activeTab === 'screenings' && (
            <div className="text-center py-16">
              <p className="text-gray-500">Screening reminders coming soon...</p>
            </div>
          )}
        </div>

        {/* Cycle Modal */}
        <AppModal
          isOpen={showCycleModal}
          onClose={() => setShowCycleModal(false)}
          title="Log Menstrual Cycle"
        >
          <form onSubmit={handleSubmitCycle} className="space-y-6">
            <Input
              label="Start Date"
              type="date"
              value={cycleForm.start_date}
              onChange={(e) => setCycleForm({...cycleForm, start_date: e.target.value})}
              required
            />
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Flow Intensity</label>
              <div className="flex space-x-2">
                {(['light', 'moderate', 'heavy'] as const).map(intensity => (
                  <button
                    key={intensity}
                    type="button"
                    onClick={() => setCycleForm({...cycleForm, flow_intensity: intensity})}
                    className={`flex-1 p-3 rounded-xl text-sm font-medium capitalize transition-all ${
                      cycleForm.flow_intensity === intensity
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>
            
            <Textarea
              label="Notes (Optional)"
              value={cycleForm.notes}
              onChange={(e) => setCycleForm({...cycleForm, notes: e.target.value})}
              placeholder="Any additional notes..."
              rows={3}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button type="submit" variant="primary" className="flex-1">
                Log Cycle
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCycleModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </AppModal>

        {/* Symptom Modal */}
        <AppModal
          isOpen={showSymptomModal}
          onClose={() => setShowSymptomModal(false)}
          title="Log Symptoms & Mood"
        >
          <form onSubmit={handleSubmitSymptom} className="space-y-6">
            <Input
              label="Date"
              type="date"
              value={symptomForm.log_date}
              onChange={(e) => setSymptomForm({...symptomForm, log_date: e.target.value})}
              required
            />
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Symptoms</label>
              <div className="grid grid-cols-2 gap-2">
                {commonSymptoms.map(symptom => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      symptomForm.symptoms.includes(symptom)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Energy Level</label>
              <div className="flex items-center space-x-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSymptomForm({...symptomForm, energy_level: i + 1})}
                    className={`text-2xl ${i < symptomForm.energy_level ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ⭐
                  </button>
                ))}
                <span className="text-sm text-gray-600 ml-2">{symptomForm.energy_level}/5</span>
              </div>
            </div>
            
            <Input
              label="Mood (Optional)"
              value={symptomForm.mood}
              onChange={(e) => setSymptomForm({...symptomForm, mood: e.target.value})}
              placeholder="How are you feeling?"
            />
            
            <Textarea
              label="Notes (Optional)"
              value={symptomForm.notes}
              onChange={(e) => setSymptomForm({...symptomForm, notes: e.target.value})}
              placeholder="Any additional details..."
              rows={3}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button type="submit" variant="primary" className="flex-1">
                Log Entry
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowSymptomModal(false)}
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

export default WomensCarePageModern;