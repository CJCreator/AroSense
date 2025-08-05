import React from 'react';
import type { VaccinationSchedule } from '../types/phase2Types';
import { calculateVaccineReminders, getVaccineNotifications, getUpcomingVaccines, getOverdueVaccines } from '../utils/vaccineReminders';

interface VaccineRemindersProps {
  vaccinations: VaccinationSchedule[];
  childName: string;
  onMarkComplete?: (vaccineId: string) => void;
  onScheduleAppointment?: (vaccineId: string) => void;
}

const VaccineReminders: React.FC<VaccineRemindersProps> = ({ 
  vaccinations, 
  childName, 
  onMarkComplete,
  onScheduleAppointment 
}) => {
  const reminders = calculateVaccineReminders(vaccinations, childName);
  const notifications = getVaccineNotifications(reminders);
  const upcomingVaccines = getUpcomingVaccines(reminders, 30);
  const overdueVaccines = getOverdueVaccines(reminders);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'bg-red-100 border-red-300 text-red-800';
      case 'due_soon': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'upcoming': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return '🚨';
      case 'due_soon': return '⚠️';
      case 'upcoming': return '📅';
      default: return '💉';
    }
  };

  if (reminders.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <span className="text-2xl">✅</span>
        <p className="text-green-800 font-medium mt-2">All vaccines up to date!</p>
        <p className="text-green-600 text-sm">No upcoming vaccines for {childName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert Summary */}
      {notifications.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">🚨</span>
            <h3 className="font-semibold text-red-800">Vaccine Alerts</h3>
          </div>
          <div className="space-y-1">
            {notifications.map(notification => (
              <p key={notification.id} className="text-sm text-red-700">
                {notification.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Overdue Vaccines */}
      {overdueVaccines.length > 0 && (
        <div>
          <h4 className="font-medium text-red-800 mb-2 flex items-center space-x-2">
            <span>🚨</span>
            <span>Overdue Vaccines ({overdueVaccines.length})</span>
          </h4>
          <div className="space-y-2">
            {overdueVaccines.map(reminder => (
              <div key={reminder.id} className={`p-3 rounded-lg border-2 ${getUrgencyColor(reminder.urgency)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{reminder.vaccine_name}</p>
                    <p className="text-sm">{reminder.message}</p>
                  </div>
                  <div className="flex space-x-2">
                    {onScheduleAppointment && (
                      <button
                        onClick={() => onScheduleAppointment(reminder.id)}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Schedule
                      </button>
                    )}
                    {onMarkComplete && (
                      <button
                        onClick={() => onMarkComplete(reminder.id)}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Vaccines */}
      {upcomingVaccines.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-2 flex items-center space-x-2">
            <span>📅</span>
            <span>Upcoming Vaccines (Next 30 Days)</span>
          </h4>
          <div className="space-y-2">
            {upcomingVaccines.map(reminder => (
              <div key={reminder.id} className={`p-3 rounded-lg border ${getUrgencyColor(reminder.urgency)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <span>{getUrgencyIcon(reminder.urgency)}</span>
                    <div>
                      <p className="font-medium">{reminder.vaccine_name}</p>
                      <p className="text-sm">{reminder.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">
                      {new Date(reminder.due_date).toLocaleDateString()}
                    </p>
                    {reminder.days_until_due <= 7 && (
                      <div className="flex space-x-1 mt-1">
                        {onScheduleAppointment && (
                          <button
                            onClick={() => onScheduleAppointment(reminder.id)}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          >
                            Schedule
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Vaccine Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-600">{overdueVaccines.length}</p>
            <p className="text-xs text-gray-600">Overdue</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {reminders.filter(r => r.urgency === 'due_soon').length}
            </p>
            <p className="text-xs text-gray-600">Due Soon</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {reminders.filter(r => r.urgency === 'upcoming').length}
            </p>
            <p className="text-xs text-gray-600">Upcoming</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccineReminders;