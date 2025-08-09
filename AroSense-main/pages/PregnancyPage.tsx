import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as pregnancyService from '../services/pregnancyServicePhase2';
import PlusIcon from '../components/icons/PlusIcon';
import PregnantWomanIcon from '../components/icons/PregnantWomanIcon';
import AppModal from '../components/AppModal';
import DateTimeInputGroup from '../components/DateTimeInputGroup';
import PregnancyTimeline from '../components/PregnancyTimeline';
import PregnancyDashboard from '../components/PregnancyDashboard';
import type { PregnancyProfile, PregnancySymptoms, KickCount, PrenatalAppointment } from '../types/phase2Types';

type PregnancyTab = 'overview' | 'symptoms' | 'kicks' | 'appointments';

const PregnancyPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<PregnancyTab>('overview');
  const [profile, setProfile] = useState<PregnancyProfile | null>(null);
  const [symptoms, setSymptoms] = useState<PregnancySymptoms[]>([]);
  const [kicks, setKicks] = useState<KickCount[]>([]);
  const [appointments, setAppointments] = useState<PrenatalAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showKickModal, setShowKickModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    
    const loadData = async () => {
      try {
        const [profileData, symptomsData, kicksData, appointmentsData] = await Promise.all([
          pregnancyService.getActivePregnancyProfile(),
          pregnancyService.getPregnancySymptoms(),
          pregnancyService.getKickCounts(),
          pregnancyService.getPrenatalAppointments()
        ]);
        
        setProfile(profileData);
        setSymptoms(symptomsData);
        setKicks(kicksData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Failed to load pregnancy data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const TabButton: React.FC<{ tab: PregnancyTab; label: string; icon: string }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
        activeTab === tab
          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
          : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600 shadow-sm'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );

  const OverviewTab = () => (
    <div className="space-y-8">
      {!profile ? (
        <div className="text-center py-16 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
          <PregnantWomanIcon className="w-20 h-20 text-pink-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Start Your Pregnancy Journey</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Create your pregnancy profile to track your journey, symptoms, and important milestones.</p>
          <button 
            onClick={() => setShowProfileModal(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Create Pregnancy Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            <PregnancyDashboard 
              profile={profile} 
              onWeekUpdate={(week) => {
                pregnancyService.updatePregnancyProfile(profile.id, { current_week: week })
                  .then(() => pregnancyService.getActivePregnancyProfile())
                  .then(setProfile)
                  .catch(console.error);
              }}
            />
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                Your Progress
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📝</span>
                    <span className="text-sm font-medium text-gray-700">Symptoms</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">{symptoms.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👶</span>
                    <span className="text-sm font-medium text-gray-700">Kick Sessions</span>
                  </div>
                  <span className="text-xl font-bold text-pink-600">{kicks.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📅</span>
                    <span className="text-sm font-medium text-gray-700">Appointments</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{appointments.length}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Quick Actions
              </h4>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setShowSymptomModal(true)}
                  className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
                  <span className="font-medium text-purple-700">Log Symptoms</span>
                </button>
                
                <button 
                  onClick={() => setShowKickModal(true)}
                  className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 rounded-xl transition-all duration-200 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">👶</span>
                  <span className="font-medium text-pink-700">Count Kicks</span>
                </button>
                
                <button 
                  onClick={() => setShowAppointmentModal(true)}
                  className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">📅</span>
                  <span className="font-medium text-blue-700">Add Appointment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const SymptomsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Symptom Tracker</h3>
          <p className="text-gray-600 mt-1">Monitor your pregnancy symptoms over time</p>
        </div>
        <button 
          onClick={() => setShowSymptomModal(true)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Log Symptoms</span>
        </button>
      </div>
      
      {symptoms.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
          <span className="text-6xl mb-4 block">📝</span>
          <h4 className="text-xl font-semibold text-gray-800 mb-2">No symptoms logged yet</h4>
          <p className="text-gray-600 mb-6">Start tracking your symptoms to monitor your pregnancy journey</p>
          <button 
            onClick={() => setShowSymptomModal(true)}
            className="bg-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-600 transition-colors"
          >
            Log Your First Symptom
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {symptoms.map((symptom) => (
            <div key={symptom.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <p className="font-semibold text-gray-800">{formatDate(symptom.log_date)}</p>
                </div>
                {symptom.week_number && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    Week {symptom.week_number}
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {symptom.symptoms?.map((s, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {s}
                    </span>
                  ))}
                </div>
                
                {symptom.severity && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Severity:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      symptom.severity === 'mild' ? 'bg-green-100 text-green-700' :
                      symptom.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {symptom.severity}
                    </span>
                  </div>
                )}
                
                {symptom.notes && (
                  <p className="text-gray-600 text-sm mt-2 italic">"{symptom.notes}"</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const KicksTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Kick Counter</h3>
          <p className="text-gray-600 mt-1">Track your baby's movements and activity patterns</p>
        </div>
        <button 
          onClick={() => setShowKickModal(true)}
          className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Start Session</span>
        </button>
      </div>
      
      {kicks.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
          <span className="text-6xl mb-4 block">👶</span>
          <h4 className="text-xl font-semibold text-gray-800 mb-2">No kick sessions yet</h4>
          <p className="text-gray-600 mb-6">Start counting your baby's kicks to monitor their activity</p>
          <button 
            onClick={() => setShowKickModal(true)}
            className="bg-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-pink-600 transition-colors"
          >
            Start Your First Session
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {kicks.map((session) => (
            <div key={session.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👶</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{formatDate(session.session_date)}</p>
                    <p className="text-sm text-gray-500">
                      {session.start_time} - {session.end_time || 'In progress'}
                    </p>
                    {session.duration_minutes && (
                      <p className="text-xs text-gray-400 mt-1">{session.duration_minutes} minutes</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-pink-50 px-4 py-2 rounded-xl">
                    <p className="text-2xl font-bold text-pink-600">{session.kick_count}</p>
                    <p className="text-sm text-pink-500 font-medium">kicks</p>
                  </div>
                </div>
              </div>
              
              {session.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-600 text-sm italic">"{session.notes}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const AppointmentsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Prenatal Appointments</h3>
          <p className="text-gray-600 mt-1">Keep track of your medical appointments and checkups</p>
        </div>
        <button 
          onClick={() => setShowAppointmentModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Appointment</span>
        </button>
      </div>
      
      {appointments.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <span className="text-6xl mb-4 block">📅</span>
          <h4 className="text-xl font-semibold text-gray-800 mb-2">No appointments scheduled</h4>
          <p className="text-gray-600 mb-6">Add your prenatal appointments to stay organized</p>
          <button 
            onClick={() => setShowAppointmentModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Schedule Your First Appointment
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {new Date(appointment.appointment_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(appointment.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                
                {appointment.appointment_type && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {appointment.appointment_type}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointment.doctor_name && (
                  <div>
                    <p className="text-sm text-gray-500">Doctor</p>
                    <p className="font-medium text-gray-800">{appointment.doctor_name}</p>
                  </div>
                )}
                
                {appointment.clinic_name && (
                  <div>
                    <p className="text-sm text-gray-500">Clinic</p>
                    <p className="font-medium text-gray-800">{appointment.clinic_name}</p>
                  </div>
                )}
              </div>
              
              {appointment.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-600 text-sm italic">"{appointment.notes}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <PregnantWomanIcon className="w-16 h-16 text-pink-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Please log in to access pregnancy tracking.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your pregnancy data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <PregnantWomanIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Pregnancy Journey</h1>
              <p className="text-gray-600 mt-1">Track your beautiful journey to motherhood</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton tab="overview" label="Overview" icon="🏠" />
          <TabButton tab="symptoms" label="Symptoms" icon="📝" />
          <TabButton tab="kicks" label="Kick Counter" icon="👶" />
          <TabButton tab="appointments" label="Appointments" icon="📅" />
        </div>

        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'symptoms' && <SymptomsTab />}
          {activeTab === 'kicks' && <KicksTab />}
          {activeTab === 'appointments' && <AppointmentsTab />}
        </div>

        {/* Modals */}
        <AppModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Create Pregnancy Profile">
          <ProfileForm onClose={() => setShowProfileModal(false)} onSave={() => {
            setShowProfileModal(false);
            pregnancyService.getActivePregnancyProfile().then(setProfile);
          }} />
        </AppModal>

        <AppModal isOpen={showSymptomModal} onClose={() => setShowSymptomModal(false)} title="Log Pregnancy Symptoms">
          <SymptomForm onClose={() => setShowSymptomModal(false)} onSave={() => {
            setShowSymptomModal(false);
            pregnancyService.getPregnancySymptoms().then(setSymptoms);
          }} />
        </AppModal>

        <AppModal isOpen={showKickModal} onClose={() => setShowKickModal(false)} title="Kick Counter Session">
          <KickCounterForm onClose={() => setShowKickModal(false)} onSave={() => {
            setShowKickModal(false);
            pregnancyService.getKickCounts().then(setKicks);
          }} />
        </AppModal>

        <AppModal isOpen={showAppointmentModal} onClose={() => setShowAppointmentModal(false)} title="Schedule Prenatal Appointment">
          <AppointmentForm onClose={() => setShowAppointmentModal(false)} onSave={() => {
            setShowAppointmentModal(false);
            pregnancyService.getPrenatalAppointments().then(setAppointments);
          }} />
        </AppModal>
      </div>
    </div>
  );
};

// Form Components
const ProfileForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [lmp, setLmp] = useState('');
  const [edd, setEdd] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pregnancyService.createPregnancyProfile({
        last_menstrual_period: lmp,
        estimated_due_date: edd,
        pregnancy_notes: notes || undefined
      });
      onSave();
    } catch (error) {
      console.error('Failed to create pregnancy profile:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Last Menstrual Period</label>
          <input
            type="date"
            value={lmp}
            onChange={(e) => setLmp(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Due Date</label>
          <input
            type="date"
            value={edd}
            onChange={(e) => setEdd(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          rows={3}
          placeholder="Any additional notes about your pregnancy..."
        />
      </div>
      
      <div className="flex space-x-3 pt-4">
        <button 
          type="submit" 
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Create Profile
        </button>
        <button 
          type="button" 
          onClick={onClose} 
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const SymptomForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [notes, setNotes] = useState('');

  const commonSymptoms = [
    'Nausea', 'Fatigue', 'Breast Tenderness', 'Heartburn', 'Back Pain',
    'Headache', 'Mood Swings', 'Food Cravings', 'Constipation', 'Swelling'
  ];

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
      await pregnancyService.createPregnancySymptoms({
        log_date: date,
        symptoms,
        severity,
        notes: notes || undefined
      });
      onSave();
    } catch (error) {
      console.error('Failed to log symptoms:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Symptoms</label>
        <div className="grid grid-cols-2 gap-2">
          {commonSymptoms.map(symptom => (
            <button
              key={symptom}
              type="button"
              onClick={() => toggleSymptom(symptom)}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                symptoms.includes(symptom)
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Severity</label>
        <div className="flex space-x-2">
          {(['mild', 'moderate', 'severe'] as const).map(level => (
            <button
              key={level}
              type="button"
              onClick={() => setSeverity(level)}
              className={`flex-1 p-3 rounded-xl text-sm font-medium capitalize transition-all ${
                severity === level
                  ? level === 'mild' ? 'bg-green-500 text-white' :
                    level === 'moderate' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows={3}
          placeholder="Any additional details..."
        />
      </div>
      
      <div className="flex space-x-3 pt-4">
        <button 
          type="submit" 
          className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors"
        >
          Log Symptoms
        </button>
        <button 
          type="button" 
          onClick={onClose} 
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const KickCounterForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [kickCount, setKickCount] = useState(0);
  const [startTime] = useState(new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pregnancyService.createKickCount({
        session_date: new Date().toISOString().split('T')[0],
        start_time: startTime,
        kick_count: kickCount,
        notes: notes || undefined
      });
      onSave();
    } catch (error) {
      console.error('Failed to save kick count:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center bg-pink-50 p-6 rounded-2xl">
        <p className="text-sm text-gray-600 mb-2">Session started at {startTime}</p>
        <div className="text-6xl font-bold text-pink-600 mb-2">{kickCount}</div>
        <p className="text-gray-600">kicks counted</p>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={() => setKickCount(prev => Math.max(0, prev - 1))}
          className="w-16 h-16 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold transition-colors"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => setKickCount(prev => prev + 1)}
          className="w-16 h-16 bg-pink-500 hover:bg-pink-600 text-white rounded-full flex items-center justify-center text-2xl font-bold transition-colors"
        >
          +
        </button>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          rows={2}
          placeholder="Any observations about the session..."
        />
      </div>
      
      <div className="flex space-x-3 pt-4">
        <button 
          type="submit" 
          className="flex-1 bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors"
        >
          Save Session
        </button>
        <button 
          type="button" 
          onClick={onClose} 
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const AppointmentForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [notes, setNotes] = useState('');

  const appointmentTypes = [
    'Regular Checkup', 'Ultrasound', 'Blood Test', 'Glucose Test',
    'Specialist Consultation', 'Emergency Visit', 'Follow-up'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pregnancyService.createPrenatalAppointment({
        appointment_date: `${date}T${time}`,
        doctor_name: doctorName || undefined,
        clinic_name: clinicName || undefined,
        appointment_type: appointmentType || undefined,
        notes: notes || undefined
      });
      onSave();
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Type</label>
        <select
          value={appointmentType}
          onChange={(e) => setAppointmentType(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select type</option>
          {appointmentTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor Name</label>
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Dr. Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Clinic Name</label>
          <input
            type="text"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Medical Center"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Questions to ask, preparations needed, etc."
        />
      </div>
      
      <div className="flex space-x-3 pt-4">
        <button 
          type="submit" 
          className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
        >
          Schedule Appointment
        </button>
        <button 
          type="button" 
          onClick={onClose} 
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PregnancyPage;