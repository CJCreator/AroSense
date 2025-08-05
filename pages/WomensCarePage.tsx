import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as womensHealthService from '../services/womensHealthServicePhase2';
import { PlusIcon } from '../components/icons/PlusIcon';
import { FemaleIcon } from '../components/icons/FemaleIcon';
import { AppModal } from '../components/AppModal';
import { DateTimeInputGroup } from '../components/DateTimeInputGroup';
import CycleCalendar from '../components/CycleCalendar';
import FertilityInsights from '../components/FertilityInsights';
import type { MenstrualCycle, SymptomsDiary, ScreeningReminder, FertilityWindow } from '../types/phase2Types';

type WomensTab = 'periods' | 'symptoms' | 'screenings';

const WomensCarePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<WomensTab>('periods');
  const [periods, setPeriods] = useState<MenstrualCycle[]>([]);
  const [fertilityWindows, setFertilityWindows] = useState<FertilityWindow[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomsDiary[]>([]);
  const [screenings, setScreenings] = useState<ScreeningReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showScreeningModal, setShowScreeningModal] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    
    const loadData = async () => {
      try {
        const [periodsData, fertilityData, symptomsData, screeningsData] = await Promise.all([
          womensHealthService.getMenstrualCycles(),
          womensHealthService.getFertilityWindows(),
          womensHealthService.getSymptomsDiary(),
          womensHealthService.getScreeningReminders()
        ]);
        
        setPeriods(periodsData);
        setFertilityWindows(fertilityData);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Period Tracker</h3>
        <button 
          onClick={() => setShowPeriodModal(true)}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Log Period</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fertility Insights */}
        <div className="lg:col-span-1">
          <FertilityInsights cycles={periods} fertilityWindows={fertilityWindows} />
        </div>
        
        {/* Cycle Calendar */}
        <div className="lg:col-span-2">
          <CycleCalendar 
            cycles={periods} 
            fertilityWindows={fertilityWindows}
            onDateClick={(date) => {
              console.log('Date clicked:', date);
            }}
          />
        </div>
      </div>
      
      {/* Recent Periods List */}
      <div>
        <h4 className="font-medium mb-3">Recent Periods</h4>
        {periods.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No periods logged yet</p>
        ) : (
          <div className="space-y-2">
            {periods.slice(0, 5).map((period) => (
              <div key={period.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Period</p>
                    <p className="text-sm text-gray-500">{period.start_date} - {period.end_date || 'Ongoing'}</p>
                    {period.flow_intensity && (
                      <p className="text-xs text-pink-600 capitalize">{period.flow_intensity} flow</p>
                    )}
                  </div>
                  <div className="text-right">
                    {period.end_date && (
                      <p className="text-sm text-pink-600">
                        {Math.ceil((new Date(period.end_date).getTime() - new Date(period.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const SymptomsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Symptom Diary</h3>
        <button 
          onClick={() => setShowSymptomModal(true)}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
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
        <button 
          onClick={() => setShowScreeningModal(true)}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
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

      {/* Period Modal */}
      <AppModal
        isOpen={showPeriodModal}
        onClose={() => setShowPeriodModal(false)}
        title="Log Period"
      >
        <PeriodForm onClose={() => setShowPeriodModal(false)} onSave={() => {
          setShowPeriodModal(false);
          // Reload data
          Promise.all([
            womensHealthService.getMenstrualCycles(),
            womensHealthService.getFertilityWindows()
          ]).then(([periods, fertility]) => {
            setPeriods(periods);
            setFertilityWindows(fertility);
          });
        }} />
      </AppModal>

      {/* Symptom Modal */}
      <AppModal
        isOpen={showSymptomModal}
        onClose={() => setShowSymptomModal(false)}
        title="Log Symptoms"
      >
        <SymptomForm onClose={() => setShowSymptomModal(false)} onSave={() => {
          setShowSymptomModal(false);
          womensHealthService.getSymptomsDiary().then(setSymptoms);
        }} />
      </AppModal>

      {/* Screening Modal */}
      <AppModal
        isOpen={showScreeningModal}
        onClose={() => setShowScreeningModal(false)}
        title="Add Screening Reminder"
      >
        <ScreeningForm onClose={() => setShowScreeningModal(false)} onSave={() => {
          setShowScreeningModal(false);
          womensHealthService.getScreeningReminders().then(setScreenings);
        }} />
      </AppModal>
    </div>
  );
};

// Form Components
const PeriodForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [flowIntensity, setFlowIntensity] = useState<'light' | 'moderate' | 'heavy'>('moderate');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await womensHealthService.createMenstrualCycle({
        start_date: startDate,
        end_date: endDate || undefined,
        flow_intensity: flowIntensity,
        notes: notes || undefined
      });
      onSave();
    } catch (error) {
      console.error('Failed to save period:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DateTimeInputGroup
        label="Start Date"
        value={startDate}
        onChange={setStartDate}
        type="date"
        required
      />
      <DateTimeInputGroup
        label="End Date (optional)"
        value={endDate}
        onChange={setEndDate}
        type="date"
      />
      <div>
        <label className="block text-sm font-medium mb-2">Flow Intensity</label>
        <select
          value={flowIntensity}
          onChange={(e) => setFlowIntensity(e.target.value as 'light' | 'moderate' | 'heavy')}
          className="w-full p-2 border rounded-lg"
        >
          <option value="light">Light</option>
          <option value="moderate">Moderate</option>
          <option value="heavy">Heavy</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 border rounded-lg"
          rows={3}
        />
      </div>
      <div className="flex space-x-2">
        <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded-lg">Save</button>
        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
      </div>
    </form>
  );
};

const SymptomForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [notes, setNotes] = useState('');

  const symptomOptions = ['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Mood swings', 'Breast tenderness', 'Nausea'];

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await womensHealthService.createSymptomsDiary({
        log_date: logDate,
        symptoms,
        mood: mood || undefined,
        energy_level: energyLevel,
        notes: notes || undefined
      });
      onSave();
    } catch (error) {
      console.error('Failed to save symptoms:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DateTimeInputGroup
        label="Date"
        value={logDate}
        onChange={setLogDate}
        type="date"
        required
      />
      <div>
        <label className="block text-sm font-medium mb-2">Symptoms</label>
        <div className="grid grid-cols-2 gap-2">
          {symptomOptions.map(symptom => (
            <label key={symptom} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={symptoms.includes(symptom)}
                onChange={() => handleSymptomToggle(symptom)}
              />
              <span className="text-sm">{symptom}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Mood</label>
        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full p-2 border rounded-lg"
          placeholder="e.g., Happy, Anxious, Irritable"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Energy Level (1-5)</label>
        <input
          type="range"
          min="1"
          max="5"
          value={energyLevel}
          onChange={(e) => setEnergyLevel(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-center text-sm text-gray-500">{energyLevel}</div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 border rounded-lg"
          rows={3}
        />
      </div>
      <div className="flex space-x-2">
        <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded-lg">Save</button>
        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
      </div>
    </form>
  );
};

const ScreeningForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [screeningType, setScreeningType] = useState('');
  const [lastScreeningDate, setLastScreeningDate] = useState('');
  const [frequencyMonths, setFrequencyMonths] = useState(12);
  const [notes, setNotes] = useState('');

  const screeningTypes = ['Pap Smear', 'Mammogram', 'Well-Woman Visit', 'Bone Density', 'Colonoscopy'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nextDueDate = lastScreeningDate 
        ? new Date(new Date(lastScreeningDate).getTime() + frequencyMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date(Date.now() + frequencyMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await womensHealthService.createScreeningReminder({
        screening_type: screeningType,
        last_screening_date: lastScreeningDate || undefined,
        next_due_date: nextDueDate,
        frequency_months: frequencyMonths,
        notes: notes || undefined
      });
      onSave();
    } catch (error) {
      console.error('Failed to save screening reminder:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Screening Type</label>
        <select
          value={screeningType}
          onChange={(e) => setScreeningType(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        >
          <option value="">Select screening type</option>
          {screeningTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <DateTimeInputGroup
        label="Last Screening Date (optional)"
        value={lastScreeningDate}
        onChange={setLastScreeningDate}
        type="date"
      />
      <div>
        <label className="block text-sm font-medium mb-2">Frequency (months)</label>
        <input
          type="number"
          value={frequencyMonths}
          onChange={(e) => setFrequencyMonths(Number(e.target.value))}
          className="w-full p-2 border rounded-lg"
          min="1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 border rounded-lg"
          rows={3}
        />
      </div>
      <div className="flex space-x-2">
        <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded-lg">Save</button>
        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
      </div>
    </form>
  );
};

export default WomensCarePage;