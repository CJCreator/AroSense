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

  const calculateWeeksPregnant = (lmp: string) => {
    const lmpDate = new Date(lmp);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const TabButton: React.FC<{ tab: PregnancyTab; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-lg transition ${
        activeTab === tab
          ? 'bg-purple-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {!profile ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No pregnancy profile found</p>
          <button 
            onClick={() => setShowProfileModal(true)}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg"
          >
            Create Pregnancy Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pregnancy Dashboard */}
          <div className="lg:col-span-2">
            <PregnancyDashboard 
              profile={profile} 
              onWeekUpdate={(week) => {
                // Auto-update current week in profile
                pregnancyService.updatePregnancyProfile(profile.id, { current_week: week })
                  .then(() => pregnancyService.getActivePregnancyProfile())
                  .then(setProfile)
                  .catch(console.error);
              }}
            />
          </div>
          
          {/* Activity Summary */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold text-purple-800 mb-3">Your Activity</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Symptoms Logged</span>
                  <span className="font-bold text-purple-600">{symptoms.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Kick Sessions</span>
                  <span className="font-bold text-pink-600">{kicks.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Appointments</span>
                  <span className="font-bold text-blue-600">{appointments.length}</span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold text-gray-800 mb-3">Quick Actions</h4>
              
              <div className="space-y-2">
                <button 
                  onClick={() => setShowSymptomModal(true)}
                  className="w-full text-left p-2 text-sm bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  📝 Log Symptoms
                </button>
                
                <button 
                  onClick={() => setShowKickModal(true)}
                  className="w-full text-left p-2 text-sm bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
                >
                  👶 Count Kicks
                </button>
                
                <button 
                  onClick={() => setShowAppointmentModal(true)}
                  className="w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  📅 Add Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const SymptomsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pregnancy Symptoms</h3>
        <button 
          onClick={() => setShowSymptomModal(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
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
                <p className="font-medium">{formatDate(symptom.log_date)}</p>
                <p className="text-sm text-gray-600">{symptom.symptoms?.join(', ')}</p>
                {symptom.severity && <p className="text-xs text-gray-500">Severity: {symptom.severity}</p>}
                {symptom.week_number && <p className="text-xs text-purple-500">Week {symptom.week_number}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const KicksTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Kick Counter</h3>
        <button 
          onClick={() => setShowKickModal(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Start Session</span>
        </button>
      </div>
      {kicks.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No kick counting sessions yet</p>
      ) : (
        <div className="space-y-2">
          {kicks.map((session) => (
            <div key={session.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{formatDate(session.session_date)}</p>
                  <p className="text-sm text-gray-500">{session.start_time} - {session.end_time || 'In progress'}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">{session.kick_count} kicks</p>
                  <p className="text-xs text-gray-500">{session.duration_minutes} min</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const AppointmentsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Prenatal Appointments</h3>
        <button 
          onClick={() => setShowAppointmentModal(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Appointment</span>
        </button>
      </div>
      {appointments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No appointments scheduled</p>
      ) : (
        <div className="space-y-2">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{appointment.doctor_name || appointment.clinic_name}</p>
                  <p className="text-sm text-gray-500">{formatDate(appointment.appointment_date.split('T')[0])} at {appointment.appointment_date.split('T')[1]?.slice(0,5)}</p>
                  {appointment.appointment_type && <p className="text-sm text-gray-600">{appointment.appointment_type}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">Upcoming</p>
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
      case 'overview': return <OverviewTab />;
      case 'symptoms': return <SymptomsTab />;
      case 'kicks': return <KicksTab />;
      case 'appointments': return <AppointmentsTab />;
      default: return <OverviewTab />;
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to access pregnancy tracking.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading pregnancy data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <PregnantWomanIcon className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold text-textPrimary">Pregnancy Journey</h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b">
        <TabButton tab="overview" label="Overview" />
        <TabButton tab="symptoms" label="Symptoms" />
        <TabButton tab="kicks" label="Kick Counter" />
        <TabButton tab="appointments" label="Appointments" />
      </div>

      <div className="bg-surface rounded-xl shadow-lg p-6">
        {renderTabContent()}
      </div>

      {/* Modals */}
      <AppModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Create Pregnancy Profile">
        <ProfileForm onClose={() => setShowProfileModal(false)} onSave={() => { setShowProfileModal(false); pregnancyService.getActivePregnancyProfile().then(setProfile); }} />
      </AppModal>

      <AppModal isOpen={showSymptomModal} onClose={() => setShowSymptomModal(false)} title="Log Pregnancy Symptoms">
        <SymptomForm onClose={() => setShowSymptomModal(false)} onSave={() => { setShowSymptomModal(false); pregnancyService.getPregnancySymptoms().then(setSymptoms); }} />
      </AppModal>

      <AppModal isOpen={showKickModal} onClose={() => setShowKickModal(false)} title="Kick Counter Session">
        <KickForm onClose={() => setShowKickModal(false)} onSave={() => { setShowKickModal(false); pregnancyService.getKickCounts().then(setKicks); }} />
      </AppModal>

      <AppModal isOpen={showAppointmentModal} onClose={() => setShowAppointmentModal(false)} title="Add Prenatal Appointment">
        <AppointmentForm onClose={() => setShowAppointmentModal(false)} onSave={() => { setShowAppointmentModal(false); pregnancyService.getPrenatalAppointments().then(setAppointments); }} />
      </AppModal>
    </div>
  );
};

// Form Components
const ProfileForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [lmp, setLmp] = useState('');
  const [edd, setEdd] = useState('');
  const [notes, setNotes] = useState('');

  const calculateEDD = (lmpDate: string) => {
    if (!lmpDate) return '';
    const lmp = new Date(lmpDate);
    const edd = new Date(lmp.getTime() + (280 * 24 * 60 * 60 * 1000));
    return edd.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pregnancyService.createPregnancyProfile({
        last_menstrual_period: lmp,
        estimated_due_date: edd || calculateEDD(lmp),
        pregnancy_notes: notes || undefined
      });
      onSave();
    } catch (error) {
      console.error('Failed to create pregnancy profile:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DateTimeInputGroup
        label="Last Menstrual Period"
        value={lmp}
        onChange={(value) => { setLmp(value); setEdd(calculateEDD(value)); }}
        type="date"
        required
      />
      <DateTimeInputGroup
        label="Estimated Due Date"
        value={edd}
        onChange={setEdd}
        type="date"
        required
      />
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
        <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded-lg">Create Profile</button>
        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
      </div>
    </form>
  );
};

const SymptomForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [weekNumber, setWeekNumber] = useState('');
  const [notes, setNotes] = useState('');

  const pregnancySymptoms = ['Nausea', 'Fatigue', 'Heartburn', 'Back pain', 'Swelling', 'Headache', 'Constipation', 'Mood changes'];

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
      await pregnancyService.createPregnancySymptoms({
        log_date: logDate,
        symptoms,
        severity,
        week_number: weekNumber ? parseInt(weekNumber) : undefined,
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
          {pregnancySymptoms.map(symptom => (
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
        <label className="block text-sm font-medium mb-2">Severity</label>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as 'mild' | 'moderate' | 'severe')}
          className="w-full p-2 border rounded-lg"
        >
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Week Number (optional)</label>
        <input
          type="number"
          value={weekNumber}
          onChange={(e) => setWeekNumber(e.target.value)}
          className="w-full p-2 border rounded-lg"
          min="1"
          max="42"
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
        <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded-lg">Save</button>
        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
      </div>
    </form>
  );
};

const KickForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [kickCount, setKickCount] = useState(0);
  const [notes, setNotes] = useState('');

  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pregnancyService.createKickCount({
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime || undefined,
        kick_count: kickCount,
        duration_minutes: calculateDuration() || undefined,
        notes: notes || undefined
      });
      onSave();
    } catch (error) {
      console.error('Failed to save kick count:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DateTimeInputGroup
        label="Session Date"
        value={sessionDate}
        onChange={setSessionDate}
        type="date"
        required
      />
      <DateTimeInputGroup
        label="Start Time"
        value={startTime}
        onChange={setStartTime}
        type="time"
        required
      />
      <DateTimeInputGroup
        label="End Time (optional)"
        value={endTime}
        onChange={setEndTime}
        type="time"
      />
      <div>
        <label className="block text-sm font-medium mb-2">Kick Count</label>
        <input
          type="number"
          value={kickCount}
          onChange={(e) => setKickCount(Number(e.target.value))}
          className="w-full p-2 border rounded-lg"
          min="0"
          required
        />
      </div>
      {startTime && endTime && (
        <div className="text-sm text-gray-500">
          Duration: {calculateDuration()} minutes
        </div>
      )}
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
        <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded-lg">Save</button>
        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
      </div>
    </form>
  );
};

const AppointmentForm: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [notes, setNotes] = useState('');

  const appointmentTypes = ['Routine Checkup', 'Ultrasound', 'Blood Work', 'Glucose Test', 'Specialist Consultation'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pregnancyService.createPrenatalAppointment({
        appointment_date: `${appointmentDate}T${appointmentTime}`,
        doctor_name: doctorName || undefined,
        clinic_name: clinicName || undefined,
        appointment_type: appointmentType || undefined,
        notes: notes || undefined
      });
      onSave();
    } catch (error) {
      console.error('Failed to save appointment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DateTimeInputGroup
        label="Appointment Date"
        value={appointmentDate}
        onChange={setAppointmentDate}
        type="date"
        required
      />
      <DateTimeInputGroup
        label="Appointment Time"
        value={appointmentTime}
        onChange={setAppointmentTime}
        type="time"
        required
      />
      <div>
        <label className="block text-sm font-medium mb-2">Doctor Name</label>
        <input
          type="text"
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Clinic Name</label>
        <input
          type="text"
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Appointment Type</label>
        <select
          value={appointmentType}
          onChange={(e) => setAppointmentType(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">Select type</option>
          {appointmentTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
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
        <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded-lg">Save</button>
        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
      </div>
    </form>
  );
};

export default PregnancyPage;