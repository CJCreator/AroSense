import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as babyCareService from '../services/babyCareService';
import * as familyMemberService from '../services/familyMemberService';
import { FamilyMember } from '../types';
import { PlusIcon } from '../components/icons/PlusIcon';
import { BabyIcon } from '../components/icons/BabyIcon';

type BabyCareTab = 'daily' | 'growth' | 'milestones' | 'vaccines' | 'nutrition';

const BabyCarePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<BabyCareTab>('daily');
  const [children, setChildren] = useState<FamilyMember[]>([]);
  const [selectedChild, setSelectedChild] = useState<FamilyMember | null>(null);
  const [feedingLogs, setFeedingLogs] = useState<any[]>([]);
  const [diaperLogs, setDiaperLogs] = useState<any[]>([]);
  const [sleepLogs, setSleepLogs] = useState<any[]>([]);
  const [growthRecords, setGrowthRecords] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (!currentUser) return;
    
    const loadChildren = async () => {
      try {
        const familyMembers = await familyMemberService.getFamilyMembers(currentUser.id, currentUser.user_metadata.name || 'User');
        const childMembers = familyMembers.filter(member => {
          const age = calculateAge(member.dateOfBirth);
          return age <= 5; // Children 5 years and under
        });
        setChildren(childMembers);
        if (childMembers.length > 0) {
          setSelectedChild(childMembers[0]);
        }
      } catch (error) {
        console.error('Failed to load children:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChildren();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedChild || !currentUser) return;
    
    const loadBabyCareData = async () => {
      try {
        const [feeding, diaper, sleep, growth, milestonesData, vaccines] = await Promise.all([
          babyCareService.getFeedingLogs(currentUser.id, selectedChild.id),
          babyCareService.getDiaperLogs(currentUser.id, selectedChild.id),
          babyCareService.getBabySleepLogs(currentUser.id, selectedChild.id),
          babyCareService.getGrowthRecords(currentUser.id, selectedChild.id),
          babyCareService.getMilestones(currentUser.id, selectedChild.id),
          babyCareService.getVaccinations(currentUser.id, selectedChild.id)
        ]);
        
        setFeedingLogs(feeding);
        setDiaperLogs(diaper);
        setSleepLogs(sleep);
        setGrowthRecords(growth);
        setMilestones(milestonesData);
        setVaccinations(vaccines);
      } catch (error) {
        console.error('Failed to load baby care data:', error);
      }
    };

    loadBabyCareData();
  }, [selectedChild, currentUser]);

  const TabButton: React.FC<{ tab: BabyCareTab; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-lg transition ${
        activeTab === tab
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const DailyLogsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Feeding</h4>
          <p className="text-2xl font-bold text-green-600">{feedingLogs.length}</p>
          <p className="text-sm text-green-600">logs today</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Diapers</h4>
          <p className="text-2xl font-bold text-yellow-600">{diaperLogs.length}</p>
          <p className="text-sm text-yellow-600">changes today</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">Sleep</h4>
          <p className="text-2xl font-bold text-purple-600">{sleepLogs.length}</p>
          <p className="text-sm text-purple-600">sessions today</p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <PlusIcon className="w-4 h-4" />
          <span>Log Feeding</span>
        </button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <PlusIcon className="w-4 h-4" />
          <span>Log Diaper</span>
        </button>
        <button className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <PlusIcon className="w-4 h-4" />
          <span>Log Sleep</span>
        </button>
      </div>
    </div>
  );

  const GrowthTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Growth Charts</h3>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <PlusIcon className="w-4 h-4" />
          <span>Record Growth</span>
        </button>
      </div>
      {growthRecords.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No growth records yet</p>
      ) : (
        <div className="space-y-2">
          {growthRecords.map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{record.date}</p>
                  <p className="text-sm text-gray-500">
                    Weight: {record.weight_kg}kg, Height: {record.height_cm}cm
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
      case 'daily': return <DailyLogsTab />;
      case 'growth': return <GrowthTab />;
      case 'milestones': return <div>Milestones tracking coming soon...</div>;
      case 'vaccines': return <div>Vaccination schedule coming soon...</div>;
      case 'nutrition': return <div>Nutrition guide coming soon...</div>;
      default: return <DailyLogsTab />;
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to access baby care.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading baby care data...</p>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-12">
        <BabyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Children Found</h3>
        <p className="text-gray-500 mb-4">Add children (5 years or younger) to your family to use baby care features.</p>
        <button className="bg-primary text-white px-6 py-3 rounded-lg">
          Add Child to Family
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <BabyIcon className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-bold text-textPrimary">Baby Care Module</h2>
        </div>
      </div>

      {children.length > 1 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-blue-800 mb-2">Select Child:</label>
          <select 
            value={selectedChild?.id || ''} 
            onChange={(e) => setSelectedChild(children.find(c => c.id === e.target.value) || null)}
            className="w-full p-2 border border-blue-200 rounded-md bg-white"
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.name} ({calculateAge(child.dateOfBirth)} years old)
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b">
        <TabButton tab="daily" label="Daily Logs" />
        <TabButton tab="growth" label="Growth Charts" />
        <TabButton tab="milestones" label="Milestones" />
        <TabButton tab="vaccines" label="Vaccinations" />
        <TabButton tab="nutrition" label="Nutrition" />
      </div>

      <div className="bg-surface rounded-xl shadow-lg p-6">
        {selectedChild && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Tracking for <span className="font-semibold">{selectedChild.name}</span> 
              ({calculateAge(selectedChild.dateOfBirth)} years old)
            </p>
          </div>
        )}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default BabyCarePage;