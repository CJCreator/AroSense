import type { PregnancyProfile } from '../types/phase2Types';

export interface PregnancyCalculations {
  currentWeek: number;
  currentDay: number;
  daysPregnant: number;
  daysRemaining: number;
  trimester: number;
  gestationalAge: string;
  dueDate: string;
  conceptionDate: string;
}

export const calculatePregnancyDetails = (profile: PregnancyProfile): PregnancyCalculations => {
  const lmpDate = new Date(profile.last_menstrual_period);
  const today = new Date();
  const dueDate = new Date(profile.estimated_due_date);
  
  // Calculate days pregnant (from LMP)
  const diffTime = today.getTime() - lmpDate.getTime();
  const daysPregnant = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate current week and day
  const currentWeek = Math.floor(daysPregnant / 7);
  const currentDay = daysPregnant % 7;
  
  // Calculate days remaining
  const daysRemaining = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Determine trimester
  let trimester = 1;
  if (currentWeek >= 28) trimester = 3;
  else if (currentWeek >= 14) trimester = 2;
  
  // Calculate conception date (LMP + 14 days)
  const conceptionDate = new Date(lmpDate);
  conceptionDate.setDate(lmpDate.getDate() + 14);
  
  return {
    currentWeek: Math.min(currentWeek, 42),
    currentDay,
    daysPregnant,
    daysRemaining,
    trimester,
    gestationalAge: `${currentWeek}w ${currentDay}d`,
    dueDate: dueDate.toISOString().split('T')[0],
    conceptionDate: conceptionDate.toISOString().split('T')[0]
  };
};

export const getWeeklyDevelopment = (week: number): {
  babySize: string;
  development: string;
  maternalChanges: string;
  tips: string;
} => {
  const developments: { [key: number]: any } = {
    4: {
      babySize: "Poppy seed (2mm)",
      development: "Heart begins to beat, neural tube forms",
      maternalChanges: "Missed period, early pregnancy symptoms may begin",
      tips: "Start taking prenatal vitamins with folic acid"
    },
    8: {
      babySize: "Raspberry (16mm)",
      development: "Major organs forming, limb buds appear",
      maternalChanges: "Morning sickness, breast tenderness",
      tips: "Eat small, frequent meals to manage nausea"
    },
    12: {
      babySize: "Lime (61mm)",
      development: "All major organs formed, reflexes developing",
      maternalChanges: "Energy may return, nausea often improves",
      tips: "Schedule first trimester screening if desired"
    },
    16: {
      babySize: "Avocado (116mm)",
      development: "Gender can be determined, hearing develops",
      maternalChanges: "Baby bump becoming visible",
      tips: "Consider announcing pregnancy to family and friends"
    },
    20: {
      babySize: "Banana (166mm)",
      development: "Halfway point! Hair and nails growing",
      maternalChanges: "May feel first movements (quickening)",
      tips: "Schedule anatomy scan ultrasound"
    },
    24: {
      babySize: "Ear of corn (300mm)",
      development: "Lungs developing, brain growing rapidly",
      maternalChanges: "Glucose screening test due",
      tips: "Start thinking about baby gear and nursery"
    },
    28: {
      babySize: "Eggplant (375mm)",
      development: "Eyes can open, brain very active",
      maternalChanges: "Third trimester begins, may feel more tired",
      tips: "Begin childbirth education classes"
    },
    32: {
      babySize: "Coconut (425mm)",
      development: "Bones hardening, practicing breathing",
      maternalChanges: "Braxton Hicks contractions may begin",
      tips: "Start preparing hospital bag"
    },
    36: {
      babySize: "Papaya (475mm)",
      development: "Considered full-term, gaining weight",
      maternalChanges: "Weekly doctor visits begin",
      tips: "Finalize birth plan and pediatrician choice"
    },
    40: {
      babySize: "Watermelon (510mm)",
      development: "Fully developed and ready for birth!",
      maternalChanges: "Due date - labor could start any time",
      tips: "Rest and prepare for labor and delivery"
    }
  };

  // Find closest week with data
  const availableWeeks = Object.keys(developments).map(Number).sort((a, b) => a - b);
  const closestWeek = availableWeeks.reduce((prev, curr) => 
    Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
  );

  return developments[closestWeek] || {
    babySize: "Growing strong",
    development: "Continuing to develop",
    maternalChanges: "Your body is adapting",
    tips: "Keep up with regular prenatal care"
  };
};

export const getPregnancyMilestones = (currentWeek: number) => {
  const milestones = [
    { week: 4, title: "Heart starts beating", passed: currentWeek >= 4 },
    { week: 8, title: "Major organs form", passed: currentWeek >= 8 },
    { week: 12, title: "End of first trimester", passed: currentWeek >= 12 },
    { week: 16, title: "Gender determination possible", passed: currentWeek >= 16 },
    { week: 20, title: "Anatomy scan", passed: currentWeek >= 20 },
    { week: 24, title: "Viability milestone", passed: currentWeek >= 24 },
    { week: 28, title: "Third trimester begins", passed: currentWeek >= 28 },
    { week: 32, title: "Rapid brain development", passed: currentWeek >= 32 },
    { week: 36, title: "Considered full-term", passed: currentWeek >= 36 },
    { week: 40, title: "Due date!", passed: currentWeek >= 40 }
  ];

  return milestones;
};

export const updatePregnancyWeek = async (profileId: string, calculations: PregnancyCalculations) => {
  // This would typically update the database
  // For now, return the updated profile data
  return {
    current_week: calculations.currentWeek,
    conception_date: calculations.conceptionDate
  };
};