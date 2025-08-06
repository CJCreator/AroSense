import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as babyCareService from '../services/babyCareServicePhase2';
import * as familyMemberService from '../services/familyMemberService';
import { FamilyMember } from '../types';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import DashboardWidget from '../components/ui/DashboardWidget';
import { Input, Textarea } from '../components/ui/Input';
import { EmptyStateCard } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingSpinner';
import BabyIcon from '../components/icons/BabyIcon';
import PlusIcon from '../components/icons/PlusIcon';
import AppModal from '../components/AppModal';
import VaccinationTimeline from '../components/VaccinationTimeline';
import VaccineReminders from '../components/VaccineReminders';
import type { VaccinationSchedule, PediatricAppointment } from '../types/phase2Types';

type BabyCareTab = 'overview' | 'daily' | 'growth' | 'vaccines' | 'milestones';

const BabyCarePageModern: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<BabyCareTab>('overview');
  const [children, setChildren] = useState<FamilyMember[]>([]);
  const [selectedChild, setSelectedChild] = useState<FamilyMember | null>(null);
  const [vaccinations, setVaccinations] = useState<VaccinationSchedule[]>([]);
  const [appointments, setAppointments] = useState<PediatricAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showFeedingModal, setShowFeedingModal] = useState(false);
  const [feedingForm, setFeedingForm] = useState({
    type: 'breast_milk',
    amount: '',
    duration: '',
    notes: ''
  });

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const diffTime = Math.abs(today.getTime() - birthDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const familyMembers = await familyMemberService.getFamilyMembers(currentUser.id);
      const childMembers = familyMembers.filter(member => {
        const birthDate = new Date(member.date_of_birth || member.dateOfBirth || '');
        const ageInYears = (new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return ageInYears <= 5;
      });
      
      setChildren(childMembers);
      if (childMembers.length > 0 && !selectedChild) {
        setSelectedChild(childMembers[0]);
      }
    } catch (error) {
      console.error('Failed to load baby care data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      loadChildData();
    }
  }, [selectedChild]);

  const loadChildData = async () => {
    if (!selectedChild) return;
    
    try {
      const [vaccines, appointmentsData] = await Promise.all([
        babyCareService.getVaccinationSchedules(selectedChild.id),
        babyCareService.getPediatricAppointments(selectedChild.id)
      ]);
      
      setVaccinations(vaccines);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Failed to load child data:', error);
    }
  };

  const handleSubmitFeeding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Mock feeding log submission
      console.log('Feeding logged:', feedingForm);
      setShowFeedingModal(false);
      setFeedingForm({ type: 'breast_milk', amount: '', duration: '', notes: '' });
    } catch (error) {
      console.error('Failed to log feeding:', error);
    }
  };

  const TabButton: React.FC<{ tab: BabyCareTab; label: string; icon: string }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
        activeTab === tab
          ? 'bg-gradient-to-r from-gentle-pastel-blue-500 to-gentle-pastel-blue-600 text-white shadow-lg transform scale-105'
          : 'bg-white text-gray-600 hover:bg-gentle-pastel-blue-50 hover:text-gentle-pastel-blue-600 shadow-sm'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );

  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Child Selector */}
      {children.length > 1 && (
        <Card variant="elevated">
          <CardContent>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-semibold text-gray-700">Select Child:</label>
              <select
                value={selectedChild?.id || ''}
                onChange={(e) => setSelectedChild(children.find(c => c.id === e.target.value) || null)}
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gentle-pastel-blue-500 focus:border-transparent"
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} ({calculateAge(child.date_of_birth || child.dateOfBirth || '')})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedChild && (
        <>
          {/* Child Info Header */}
          <Card variant="gradient" className="bg-gradient-to-r from-gentle-pastel-blue-100 to-blue-100">
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-gentle-pastel-blue-500 to-gentle-pastel-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {selectedChild.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedChild.name}</h2>
                  <p className="text-gray-600">Age: {calculateAge(selectedChild.date_of_birth || selectedChild.dateOfBirth || '')}</p>
                  <p className="text-sm text-gray-500">
                    Born: {new Date(selectedChild.date_of_birth || selectedChild.dateOfBirth || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardWidget
              title="Vaccinations"
              value={`${vaccinations.filter(v => v.is_completed).length}/${vaccinations.length}`}
              change={{ value: "Up to date", trend: 'up' }}
              icon={<span className="text-2xl">💉</span>}
              variant="gradient"
              gradient="from-green-500 to-emerald-600"
            />
            
            <DashboardWidget
              title="Appointments"
              value={appointments.length}
              change={{ value: "Scheduled", trend: 'neutral' }}
              icon={<span className="text-2xl">📅</span>}
              variant="gradient"
              gradient="from-blue-500 to-blue-600"
            />
            
            <DashboardWidget
              title="Growth Tracking"
              value="On Track"
              icon={<span className="text-2xl">📏</span>}
              variant="gradient"
              gradient="from-purple-500 to-purple-600"
            />
            
            <DashboardWidget
              title="Milestones"
              value="5/8"
              change={{ value: "Age appropriate", trend: 'up' }}
              icon={<span className="text-2xl">🎯</span>}
              variant="gradient"
              gradient="from-yellow-500 to-orange-600"
            />
          </div>

          {/* Quick Actions */}
          <Card variant="elevated">
            <CardHeader title="Daily Care" subtitle="Log your baby's activities" />
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50"
                  onClick={() => setShowFeedingModal(true)}
                >
                  <span className="text-2xl">🍼</span>
                  <span className="text-sm">Feeding</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 border-yellow-200 hover:bg-yellow-50"
                >
                  <span className="text-2xl">👶</span>
                  <span className="text-sm">Diaper</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 border-purple-200 hover:bg-purple-50"
                >
                  <span className="text-2xl">😴</span>
                  <span className="text-sm">Sleep</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 border-green-200 hover:bg-green-50"
                >
                  <span className="text-2xl">📏</span>
                  <span className="text-sm">Growth</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vaccination Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="elevated">
              <CardHeader 
                title="Upcoming Vaccines" 
                subtitle="Stay on schedule"
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<PlusIcon className="w-4 h-4" />}
                    onClick={() => setShowVaccineModal(true)}
                  >
                    Add Vaccine
                  </Button>
                }
              />
              <CardContent>
                {vaccinations.filter(v => !v.is_completed).length === 0 ? (
                  <EmptyStateCard
                    icon={<span className="text-4xl">💉</span>}
                    title="All caught up!"
                    description="No upcoming vaccinations scheduled"
                  />
                ) : (
                  <div className="space-y-3">
                    {vaccinations.filter(v => !v.is_completed).slice(0, 3).map(vaccine => (
                      <div key={vaccine.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div>
                          <p className="font-semibold text-gray-800">{vaccine.vaccine_name}</p>
                          <p className="text-sm text-gray-600">Due: {new Date(vaccine.due_date).toLocaleDateString()}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Mark Done
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader 
                title="Recent Appointments" 
                subtitle="Medical checkups"
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<PlusIcon className="w-4 h-4" />}
                    onClick={() => setShowAppointmentModal(true)}
                  >
                    Schedule
                  </Button>
                }
              />
              <CardContent>
                {appointments.length === 0 ? (
                  <EmptyStateCard
                    icon={<span className="text-4xl">📅</span>}
                    title="No appointments"
                    description="Schedule your child's next checkup"
                    action={{
                      label: "Schedule Appointment",
                      onClick: () => setShowAppointmentModal(true)
                    }}
                  />
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map(appointment => (
                      <div key={appointment.id} className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {appointment.doctor_name || appointment.clinic_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                            </p>
                            {appointment.appointment_type && (
                              <p className="text-xs text-blue-600">{appointment.appointment_type}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gentle-pastel-blue-50 to-blue-50">
        <Card className="text-center p-8">
          <BabyIcon className="w-16 h-16 text-gentle-pastel-blue-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Please log in to access baby care.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gentle-pastel-blue-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState title="Loading baby care data..." subtitle="Please wait while we fetch your child's information" />
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gentle-pastel-blue-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyStateCard
            icon={<BabyIcon className="w-20 h-20" />}
            title="No Children Found"
            description="Add children (5 years or younger) to your family to use baby care features."
            action={{
              label: "Add Child to Family",
              onClick: () => window.location.href = '/family-profiles'
            }}
            gradient="from-gentle-pastel-blue-50 to-blue-50"
            className="max-w-2xl mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gentle-pastel-blue-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-gentle-pastel-blue-500 to-gentle-pastel-blue-600 rounded-2xl flex items-center justify-center">
              <BabyIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Baby Care</h1>
              <p className="text-gray-600 mt-1">Track your little one's health and development</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton tab="overview" label="Overview" icon="🏠" />
          <TabButton tab="daily" label="Daily Logs" icon="📝" />
          <TabButton tab="growth" label="Growth" icon="📏" />
          <TabButton tab="vaccines" label="Vaccines" icon="💉" />
          <TabButton tab="milestones" label="Milestones" icon="🎯" />
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'daily' && (
            <div className="text-center py-16">
              <p className="text-gray-500">Daily care logging coming soon...</p>
            </div>
          )}
          {activeTab === 'growth' && (
            <div className="text-center py-16">
              <p className="text-gray-500">Growth tracking coming soon...</p>
            </div>
          )}
          {activeTab === 'vaccines' && selectedChild && (
            <VaccinationTimeline 
              vaccinations={vaccinations}
              childName={selectedChild.name}
              childBirthDate={selectedChild.date_of_birth || selectedChild.dateOfBirth || ''}
              onMarkComplete={(id) => console.log('Mark vaccine complete:', id)}
            />
          )}
          {activeTab === 'milestones' && (
            <div className="text-center py-16">
              <p className="text-gray-500">Milestone tracking coming soon...</p>
            </div>
          )}
        </div>

        {/* Feeding Modal */}
        <AppModal
          isOpen={showFeedingModal}
          onClose={() => setShowFeedingModal(false)}
          title="Log Feeding"
        >
          <form onSubmit={handleSubmitFeeding} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Feeding Type</label>
              <select
                value={feedingForm.type}
                onChange={(e) => setFeedingForm({...feedingForm, type: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gentle-pastel-blue-500 focus:border-transparent"
              >
                <option value="breast_milk">Breast Milk</option>
                <option value="formula">Formula</option>
                <option value="solid_food">Solid Food</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Amount (ml)"
                type="number"
                value={feedingForm.amount}
                onChange={(e) => setFeedingForm({...feedingForm, amount: e.target.value})}
                placeholder="120"
              />
              
              <Input
                label="Duration (min)"
                type="number"
                value={feedingForm.duration}
                onChange={(e) => setFeedingForm({...feedingForm, duration: e.target.value})}
                placeholder="15"
              />
            </div>
            
            <Textarea
              label="Notes (Optional)"
              value={feedingForm.notes}
              onChange={(e) => setFeedingForm({...feedingForm, notes: e.target.value})}
              placeholder="Any observations..."
              rows={3}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button type="submit" variant="primary" className="flex-1">
                Log Feeding
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowFeedingModal(false)}
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

export default BabyCarePageModern;