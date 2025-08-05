import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as pregnancyService from '../services/pregnancyService';
import { PlusIcon } from '../components/icons/PlusIcon';
import { PregnantWomanIcon } from '../components/icons/PregnantWomanIcon';

type PregnancyTab = 'overview' | 'symptoms' | 'kicks' | 'appointments';

const PregnancyPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<PregnancyTab>('overview');
  const [profile, setProfile] = useState<any>(null);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [kicks, setKicks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    const loadData = async () => {
      try {
        const [profileData, symptomsData, kicksData, appointmentsData] = await Promise.all([
          pregnancyService.getPregnancyProfile(currentUser.id),
          pregnancyService.getPregnancySymptoms(currentUser.id),
          pregnancyService.getKickCountSessions(currentUser.id),
          pregnancyService.getPrenatalAppointments(currentUser.id)
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
          <button className="bg-purple-500 text-white px-6 py-3 rounded-lg">
            Create Pregnancy Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Pregnancy Progress</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Weeks Pregnant:</span> {calculateWeeksPregnant(profile.lmp)} weeks</p>
              <p><span className="font-medium">Due Date:</span> {profile.edd}</p>
              <p><span className="font-medium">Last Menstrual Period:</span> {profile.lmp}</p>
            </div>
          </div>
          
          <div className="bg-pink-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-pink-800 mb-4">Quick Stats</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Symptoms Logged:</span> {symptoms.length}</p>
              <p><span className="font-medium">Kick Sessions:</span> {kicks.length}</p>
              <p><span className="font-medium">Appointments:</span> {appointments.length}</p>
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
        <button className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
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

  const KicksTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Kick Counter</h3>
        <button className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
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
                  <p className="font-medium">{session.date}</p>
                  <p className="text-sm text-gray-500">{session.start_time} - {session.end_time}</p>
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
        <button className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
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
                  <p className="font-medium">{appointment.doctor_or_clinic}</p>
                  <p className="text-sm text-gray-500">{appointment.date} at {appointment.time}</p>
                  {appointment.purpose && <p className="text-sm text-gray-600">{appointment.purpose}</p>}
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
    </div>
  );
};

export default PregnancyPage;