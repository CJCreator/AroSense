import React from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import Button from './ui/Button';

interface VaccinationSchedule {
  id: string;
  vaccine_name: string;
  due_date: string;
  administered_date?: string;
  is_completed: boolean;
  notes?: string;
}

interface VaccinationTimelineProps {
  vaccinations: VaccinationSchedule[];
  childName: string;
  childBirthDate: string;
  onMarkComplete: (id: string) => void;
}

const VaccinationTimeline: React.FC<VaccinationTimelineProps> = ({
  vaccinations,
  childName,
  childBirthDate,
  onMarkComplete
}) => {
  const calculateAgeAtVaccination = (dueDate: string) => {
    const birth = new Date(childBirthDate);
    const due = new Date(dueDate);
    const diffMonths = Math.floor((due.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 1) return 'At birth';
    if (diffMonths < 12) return `${diffMonths} months`;
    return `${Math.floor(diffMonths / 12)} years`;
  };

  const sortedVaccinations = [...vaccinations].sort((a, b) => 
    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  return (
    <Card variant="elevated">
      <CardHeader 
        title={`${childName}'s Vaccination Schedule`}
        subtitle={`${vaccinations.filter(v => v.is_completed).length} of ${vaccinations.length} completed`}
      />
      <CardContent>
        <div className="space-y-4">
          {sortedVaccinations.map((vaccine, index) => (
            <div key={vaccine.id} className="relative">
              {/* Timeline line */}
              {index < sortedVaccinations.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* Status indicator */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  vaccine.is_completed 
                    ? 'bg-green-100 border-2 border-green-500' 
                    : 'bg-yellow-100 border-2 border-yellow-500'
                }`}>
                  <span className="text-lg">
                    {vaccine.is_completed ? '✅' : '💉'}
                  </span>
                </div>
                
                {/* Vaccine details */}
                <div className="flex-1 bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{vaccine.vaccine_name}</h4>
                      <p className="text-sm text-gray-600">
                        Age: {calculateAgeAtVaccination(vaccine.due_date)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(vaccine.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {!vaccine.is_completed && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => onMarkComplete(vaccine.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                  
                  {vaccine.is_completed && vaccine.administered_date && (
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Completed on {new Date(vaccine.administered_date).toLocaleDateString()}
                    </p>
                  )}
                  
                  {vaccine.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      Note: {vaccine.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {vaccinations.length === 0 && (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">💉</span>
            <p className="text-gray-500">No vaccination schedule available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VaccinationTimeline;