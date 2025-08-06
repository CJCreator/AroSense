import React from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import Button from './ui/Button';

interface VaccineReminder {
  id: string;
  vaccine_name: string;
  due_date: string;
  child_name: string;
  urgency: 'overdue' | 'due_soon' | 'upcoming';
}

interface VaccineRemindersProps {
  reminders: VaccineReminder[];
  onSchedule: (reminderId: string) => void;
  onDismiss: (reminderId: string) => void;
}

const VaccineReminders: React.FC<VaccineRemindersProps> = ({
  reminders,
  onSchedule,
  onDismiss
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'bg-red-50 border-red-200 text-red-800';
      case 'due_soon': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'upcoming': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
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

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'Overdue';
      case 'due_soon': return 'Due Soon';
      case 'upcoming': return 'Upcoming';
      default: return 'Scheduled';
    }
  };

  if (reminders.length === 0) {
    return (
      <Card variant="elevated">
        <CardHeader title="Vaccine Reminders" subtitle="All caught up!" />
        <CardContent>
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">✅</span>
            <p className="text-gray-500">No upcoming vaccine reminders</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader 
        title="Vaccine Reminders" 
        subtitle={`${reminders.length} reminders`}
      />
      <CardContent>
        <div className="space-y-3">
          {reminders.map(reminder => (
            <div 
              key={reminder.id} 
              className={`p-4 rounded-xl border ${getUrgencyColor(reminder.urgency)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">
                    {getUrgencyIcon(reminder.urgency)}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold">{reminder.vaccine_name}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/50">
                        {getUrgencyLabel(reminder.urgency)}
                      </span>
                    </div>
                    <p className="text-sm opacity-80">
                      {reminder.child_name} • Due: {new Date(reminder.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSchedule(reminder.id)}
                    className="text-xs"
                  >
                    Schedule
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismiss(reminder.id)}
                    className="text-xs"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VaccineReminders;