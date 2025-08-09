import type { VaccinationSchedule } from '../types/phase2Types';

export interface VaccineReminder {
  id: string;
  vaccine_name: string;
  child_name: string;
  due_date: string;
  days_until_due: number;
  urgency: 'overdue' | 'due_soon' | 'upcoming' | 'future';
  message: string;
}

export const calculateVaccineReminders = (
  vaccinations: VaccinationSchedule[],
  childName: string
): VaccineReminder[] => {
  const today = new Date();
  
  return vaccinations
    .filter(vaccine => !vaccine.is_completed)
    .map(vaccine => {
      const dueDate = new Date(vaccine.due_date);
      const diffTime = dueDate.getTime() - today.getTime();
      const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let urgency: VaccineReminder['urgency'];
      let message: string;
      
      if (daysUntilDue < 0) {
        urgency = 'overdue';
        message = `${vaccine.vaccine_name} is ${Math.abs(daysUntilDue)} days overdue`;
      } else if (daysUntilDue <= 7) {
        urgency = 'due_soon';
        message = `${vaccine.vaccine_name} is due in ${daysUntilDue} days`;
      } else if (daysUntilDue <= 30) {
        urgency = 'upcoming';
        message = `${vaccine.vaccine_name} is due in ${daysUntilDue} days`;
      } else {
        urgency = 'future';
        message = `${vaccine.vaccine_name} is due ${new Date(vaccine.due_date).toLocaleDateString()}`;
      }
      
      return {
        id: vaccine.id,
        vaccine_name: vaccine.vaccine_name,
        child_name: childName,
        due_date: vaccine.due_date,
        days_until_due: daysUntilDue,
        urgency,
        message
      };
    })
    .sort((a, b) => a.days_until_due - b.days_until_due);
};

export const getVaccineNotifications = (reminders: VaccineReminder[]) => {
  const notifications = reminders
    .filter(reminder => reminder.urgency === 'overdue' || reminder.urgency === 'due_soon')
    .map(reminder => ({
      id: reminder.id,
      title: `Vaccine ${reminder.urgency === 'overdue' ? 'Overdue' : 'Due Soon'}`,
      message: `${reminder.child_name}: ${reminder.message}`,
      type: reminder.urgency === 'overdue' ? 'error' : 'warning' as 'error' | 'warning',
      action: 'Schedule appointment',
      urgency: reminder.urgency
    }));
  
  return notifications;
};

export const generateVaccineSchedule = (childBirthDate: string): Omit<VaccinationSchedule, 'id' | 'user_id' | 'child_id' | 'created_at' | 'updated_at'>[] => {
  const birthDate = new Date(childBirthDate);
  
  const schedule = [
    // Birth
    { vaccine_name: 'Hepatitis B', months: 0 },
    
    // 2 months
    { vaccine_name: 'DTaP', months: 2 },
    { vaccine_name: 'Hib', months: 2 },
    { vaccine_name: 'IPV', months: 2 },
    { vaccine_name: 'PCV13', months: 2 },
    { vaccine_name: 'Rotavirus', months: 2 },
    
    // 4 months
    { vaccine_name: 'DTaP', months: 4 },
    { vaccine_name: 'Hib', months: 4 },
    { vaccine_name: 'IPV', months: 4 },
    { vaccine_name: 'PCV13', months: 4 },
    { vaccine_name: 'Rotavirus', months: 4 },
    
    // 6 months
    { vaccine_name: 'DTaP', months: 6 },
    { vaccine_name: 'Hib', months: 6 },
    { vaccine_name: 'PCV13', months: 6 },
    { vaccine_name: 'Rotavirus', months: 6 },
    { vaccine_name: 'Hepatitis B', months: 6 },
    
    // 12 months
    { vaccine_name: 'MMR', months: 12 },
    { vaccine_name: 'PCV13', months: 12 },
    { vaccine_name: 'Varicella', months: 12 },
    { vaccine_name: 'Hepatitis A', months: 12 },
    
    // 15 months
    { vaccine_name: 'DTaP', months: 15 },
    { vaccine_name: 'Hib', months: 15 },
    
    // 18 months
    { vaccine_name: 'Hepatitis A', months: 18 },
    
    // 4-6 years
    { vaccine_name: 'DTaP', months: 48 },
    { vaccine_name: 'IPV', months: 48 },
    { vaccine_name: 'MMR', months: 48 },
    { vaccine_name: 'Varicella', months: 48 }
  ];
  
  return schedule.map(item => {
    const dueDate = new Date(birthDate);
    dueDate.setMonth(birthDate.getMonth() + item.months);
    
    return {
      vaccine_name: item.vaccine_name,
      due_date: dueDate.toISOString().split('T')[0],
      administered_date: null,
      administered_by: null,
      batch_number: null,
      is_completed: false,
      notes: null
    };
  });
};

export const getUpcomingVaccines = (reminders: VaccineReminder[], days: number = 30) => {
  return reminders.filter(reminder => 
    reminder.days_until_due >= 0 && reminder.days_until_due <= days
  );
};

export const getOverdueVaccines = (reminders: VaccineReminder[]) => {
  return reminders.filter(reminder => reminder.urgency === 'overdue');
};