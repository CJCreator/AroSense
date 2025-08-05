import React from 'react';
import type { VaccinationSchedule } from '../types/phase2Types';

interface VaccinationTimelineProps {
  vaccinations: VaccinationSchedule[];
  childName: string;
  childBirthDate: string;
  onMarkComplete?: (vaccineId: string) => void;
}

const VaccinationTimeline: React.FC<VaccinationTimelineProps> = ({ 
  vaccinations, 
  childName, 
  childBirthDate,
  onMarkComplete 
}) => {
  const calculateAgeInMonths = (birthDate: string, targetDate: string) => {
    const birth = new Date(birthDate);
    const target = new Date(targetDate);
    const diffTime = target.getTime() - birth.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
  };

  const getAgeGroup = (months: number) => {
    if (months < 2) return 'Birth';
    if (months < 4) return '2 months';
    if (months < 6) return '4 months';
    if (months < 12) return '6 months';
    if (months < 15) return '12 months';
    if (months < 18) return '15 months';
    if (months < 24) return '18 months';
    if (months < 48) return '2-4 years';
    return '4+ years';
  };

  const standardSchedule = [
    { age: 'Birth', vaccines: ['Hepatitis B'], color: 'bg-red-400' },
    { age: '2 months', vaccines: ['DTaP', 'Hib', 'IPV', 'PCV13', 'Rotavirus'], color: 'bg-orange-400' },
    { age: '4 months', vaccines: ['DTaP', 'Hib', 'IPV', 'PCV13', 'Rotavirus'], color: 'bg-yellow-400' },
    { age: '6 months', vaccines: ['DTaP', 'Hib', 'PCV13', 'Rotavirus', 'Hepatitis B'], color: 'bg-green-400' },
    { age: '12 months', vaccines: ['MMR', 'PCV13', 'Varicella', 'Hepatitis A'], color: 'bg-blue-400' },
    { age: '15 months', vaccines: ['DTaP', 'Hib'], color: 'bg-indigo-400' },
    { age: '18 months', vaccines: ['Hepatitis A'], color: 'bg-purple-400' },
    { age: '2-4 years', vaccines: ['DTaP', 'IPV', 'MMR', 'Varicella'], color: 'bg-pink-400' }
  ];

  const groupVaccinesByAge = () => {
    const grouped: { [key: string]: VaccinationSchedule[] } = {};
    
    vaccinations.forEach(vaccine => {
      const ageInMonths = calculateAgeInMonths(childBirthDate, vaccine.due_date);
      const ageGroup = getAgeGroup(ageInMonths);
      
      if (!grouped[ageGroup]) {
        grouped[ageGroup] = [];
      }
      grouped[ageGroup].push(vaccine);
    });
    
    return grouped;
  };

  const groupedVaccines = groupVaccinesByAge();
  const currentAgeInMonths = calculateAgeInMonths(childBirthDate, new Date().toISOString());

  const isAgeGroupCurrent = (ageGroup: string) => {
    const currentAge = getAgeGroup(currentAgeInMonths);
    return currentAge === ageGroup;
  };

  const isAgeGroupPassed = (ageGroup: string) => {
    const ageOrder = ['Birth', '2 months', '4 months', '6 months', '12 months', '15 months', '18 months', '2-4 years', '4+ years'];
    const currentAge = getAgeGroup(currentAgeInMonths);
    return ageOrder.indexOf(ageGroup) < ageOrder.indexOf(currentAge);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-blue-800 mb-2">
          Vaccination Timeline for {childName}
        </h3>
        <p className="text-gray-600">
          Current age: {Math.floor(currentAgeInMonths / 12)} years {currentAgeInMonths % 12} months
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        
        <div className="space-y-6">
          {standardSchedule.map((ageGroup, index) => {
            const isPassed = isAgeGroupPassed(ageGroup.age);
            const isCurrent = isAgeGroupCurrent(ageGroup.age);
            const scheduledVaccines = groupedVaccines[ageGroup.age] || [];
            
            return (
              <div key={ageGroup.age} className="relative">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-white font-bold z-10 relative
                  ${isPassed ? ageGroup.color : isCurrent ? ageGroup.color + ' ring-4 ring-blue-200' : 'bg-gray-300'}
                  transition-all duration-300
                `}>
                  {isPassed ? '✓' : index + 1}
                </div>
                
                <div className={`
                  ml-16 -mt-12 pt-2 pb-4 pl-4 pr-4 rounded-lg
                  ${isCurrent ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}
                `}>
                  <h4 className={`font-semibold mb-2 ${isCurrent ? 'text-blue-800' : 'text-gray-700'}`}>
                    {ageGroup.age}
                  </h4>
                  
                  <div className="space-y-2">
                    {ageGroup.vaccines.map(vaccineName => {
                      const scheduledVaccine = scheduledVaccines.find(v => 
                        v.vaccine_name.toLowerCase().includes(vaccineName.toLowerCase()) ||
                        vaccineName.toLowerCase().includes(v.vaccine_name.toLowerCase())
                      );
                      
                      return (
                        <div key={vaccineName} className={`
                          flex items-center justify-between p-2 rounded
                          ${scheduledVaccine?.is_completed ? 'bg-green-100' : 'bg-white'}
                        `}>
                          <div className="flex items-center space-x-2">
                            <div className={`
                              w-4 h-4 rounded-full
                              ${scheduledVaccine?.is_completed ? 'bg-green-500' : 
                                scheduledVaccine ? 'bg-yellow-400' : 'bg-gray-300'}
                            `}></div>
                            <span className={`text-sm ${
                              scheduledVaccine?.is_completed ? 'text-green-800 line-through' : 'text-gray-700'
                            }`}>
                              {vaccineName}
                            </span>
                          </div>
                          
                          {scheduledVaccine && (
                            <div className="flex items-center space-x-2">
                              {scheduledVaccine.is_completed ? (
                                <span className="text-xs text-green-600">
                                  {scheduledVaccine.administered_date ? 
                                    new Date(scheduledVaccine.administered_date).toLocaleDateString() : 
                                    'Completed'
                                  }
                                </span>
                              ) : (
                                <>
                                  <span className="text-xs text-gray-500">
                                    Due: {new Date(scheduledVaccine.due_date).toLocaleDateString()}
                                  </span>
                                  {onMarkComplete && (
                                    <button
                                      onClick={() => onMarkComplete(scheduledVaccine.id)}
                                      className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                    >
                                      Done
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {scheduledVaccines.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        {scheduledVaccines.filter(v => v.is_completed).length} of {scheduledVaccines.length} vaccines completed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-green-600">
            {vaccinations.filter(v => v.is_completed).length}
          </p>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-yellow-600">
            {vaccinations.filter(v => !v.is_completed && new Date(v.due_date) <= new Date()).length}
          </p>
          <p className="text-xs text-gray-600">Due Now</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-blue-600">
            {vaccinations.filter(v => !v.is_completed && new Date(v.due_date) > new Date()).length}
          </p>
          <p className="text-xs text-gray-600">Upcoming</p>
        </div>
      </div>
    </div>
  );
};

export default VaccinationTimeline;