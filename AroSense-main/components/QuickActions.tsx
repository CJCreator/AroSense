import React, { useState } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import AppModal from './AppModal';
import DateTimeInputGroup from './DateTimeInputGroup';
import * as womensHealthService from '../services/womensHealthServicePhase2';
import * as pregnancyService from '../services/pregnancyServicePhase2';

interface QuickActionsProps {
  onDataUpdate?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onDataUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showKickModal, setShowKickModal] = useState(false);

  const actions = [
    {
      id: 'period',
      label: 'Log Period',
      icon: '🩸',
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => { setShowPeriodModal(true); setIsOpen(false); }
    },
    {
      id: 'symptoms',
      label: 'Log Symptoms',
      icon: '📝',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => { setShowSymptomModal(true); setIsOpen(false); }
    },
    {
      id: 'kicks',
      label: 'Count Kicks',
      icon: '👶',
      color: 'bg-pink-500 hover:bg-pink-600',
      onClick: () => { setShowKickModal(true); setIsOpen(false); }
    }
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Action Items */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-3 mb-2">
            {actions.map((action, index) => (
              <div
                key={action.id}
                className="flex items-center space-x-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-lg whitespace-nowrap">
                  {action.label}
                </span>
                <button
                  onClick={action.onClick}
                  className={`w-12 h-12 rounded-full ${action.color} text-white shadow-lg flex items-center justify-center text-xl transition-transform hover:scale-110`}
                >
                  {action.icon}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 ${
            isOpen ? 'rotate-45' : 'rotate-0'
          }`}
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      <AppModal isOpen={showPeriodModal} onClose={() => setShowPeriodModal(false)} title="Quick Log Period">
        <QuickPeriodForm onClose={() => setShowPeriodModal(false)} onSave={() => {
          setShowPeriodModal(false);
          onDataUpdate?.();
        }} />
      </AppModal>

      <AppModal isOpen={showSymptomModal} onClose={() => setShowSymptomModal(false)} title="Quick Log Symptoms">
        <QuickSymptomForm onClose={() => setShowSymptomModal(false)} onSave={() => {
          setShowSymptomModal(false);
          onDataUpdate?.();
        }} />
      </AppModal>

      <AppModal isOpen={showKickModal} onClose={() => setShowKickModal(false)} title="Quick Count Kicks">
        <QuickKickForm onClose={() => setShowKickModal(false)} onSave={() => {
          setShowKickModal(false);
          onDataUpdate?.();
        }} />
      </AppModal>
    </>
  );
};

// Quick Forms
const QuickPeriodForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [flowIntensity, setFlowIntensity] = useState<'light' | 'moderate' | 'heavy'>('moderate');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await womensHealthService.createMenstrualCycle({
        start_date: startDate,
        flow_intensity: flowIntensity
      });
      onSave();
    } catch (error) {
      console.error('Failed to log period:', error);
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
      <div>
        <label className="block text-sm font-medium mb-2">Flow Intensity</label>
        <div className="flex space-x-2">
          {(['light', 'moderate', 'heavy'] as const).map(intensity => (
            <button
              key={intensity}
              type="button"
              onClick={() => setFlowIntensity(intensity)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                flowIntensity === intensity
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {intensity}
            </button>
          ))}
        </div>
      </div>
      <div className="flex space-x-2">
        <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded-lg flex-1">Log Period</button>
        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
      </div>
    </form>
  );
};

const QuickSymptomForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState('');

  const commonSymptoms = ['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Nausea'];

  const toggleSymptom = (symptom: string) => {
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
        log_date: new Date().toISOString().split('T')[0],
        symptoms,
        mood: mood || undefined,
        energy_level: 3
      });
      onSave();
    } catch (error) {
      console.error('Failed to log symptoms:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Symptoms</label>
        <div className="flex flex-wrap gap-2">
          {commonSymptoms.map(symptom => (
            <button
              key={symptom}
              type="button"
              onClick={() => toggleSymptom(symptom)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                symptoms.includes(symptom)
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
        <label className="block text-sm font-medium mb-2">Mood (optional)</label>
        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full p-2 border rounded-lg"
          placeholder="Happy, Anxious, Tired..."
        />
      </div>
      <div className="flex space-x-2">
        <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded-lg flex-1">Log Symptoms</button>
        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
      </div>
    </form>
  );
};

const QuickKickForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [kickCount, setKickCount] = useState(0);
  const [startTime] = useState(new Date().toTimeString().slice(0, 5));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pregnancyService.createKickCount({
        session_date: new Date().toISOString().split('T')[0],
        start_time: startTime,
        kick_count: kickCount
      });
      onSave();
    } catch (error) {
      console.error('Failed to log kicks:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">Started at {startTime}</p>
        <div className="bg-pink-50 rounded-lg p-6">
          <p className="text-4xl font-bold text-pink-600 mb-2">{kickCount}</p>
          <p className="text-sm text-gray-600">kicks counted</p>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={() => setKickCount(prev => Math.max(0, prev - 1))}
          className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => setKickCount(prev => prev + 1)}
          className="w-12 h-12 bg-pink-500 hover:bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold"
        >
          +
        </button>
      </div>
      
      <div className="flex space-x-2">
        <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded-lg flex-1">Save Session</button>
        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
      </div>
    </form>
  );
};

export default QuickActions;