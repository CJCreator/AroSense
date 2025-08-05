import type { MenstrualCycle, FertilityWindow } from '../types/phase2Types';

export interface FertilityPrediction {
  fertile_start: string;
  fertile_end: string;
  ovulation_date: string;
  cycle_id: string;
  is_predicted: boolean;
}

export const calculateFertilityWindow = (cycle: MenstrualCycle): FertilityPrediction | null => {
  if (!cycle.start_date) return null;

  const cycleLength = cycle.cycle_length || 28; // Default to 28 days
  const lutealPhase = 14; // Standard luteal phase length
  const ovulationDay = cycleLength - lutealPhase;
  
  const startDate = new Date(cycle.start_date);
  
  // Calculate ovulation date
  const ovulationDate = new Date(startDate);
  ovulationDate.setDate(startDate.getDate() + ovulationDay - 1);
  
  // Fertile window: 5 days before ovulation + ovulation day
  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(ovulationDate.getDate() - 5);
  
  const fertileEnd = new Date(ovulationDate);
  
  return {
    fertile_start: fertileStart.toISOString().split('T')[0],
    fertile_end: fertileEnd.toISOString().split('T')[0],
    ovulation_date: ovulationDate.toISOString().split('T')[0],
    cycle_id: cycle.id,
    is_predicted: true
  };
};

export const predictNextCycle = (cycles: MenstrualCycle[]): { nextPeriod: string; nextOvulation: string } | null => {
  if (cycles.length === 0) return null;

  // Sort cycles by start date (most recent first)
  const sortedCycles = cycles.sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  const lastCycle = sortedCycles[0];
  
  // Calculate average cycle length from last 3 cycles
  const recentCycles = sortedCycles.slice(0, 3);
  const avgCycleLength = recentCycles.reduce((sum, cycle) => {
    return sum + (cycle.cycle_length || 28);
  }, 0) / recentCycles.length;

  const lastPeriodStart = new Date(lastCycle.start_date);
  
  // Predict next period
  const nextPeriodDate = new Date(lastPeriodStart);
  nextPeriodDate.setDate(lastPeriodStart.getDate() + Math.round(avgCycleLength));
  
  // Predict next ovulation (14 days before next period)
  const nextOvulationDate = new Date(nextPeriodDate);
  nextOvulationDate.setDate(nextPeriodDate.getDate() - 14);

  return {
    nextPeriod: nextPeriodDate.toISOString().split('T')[0],
    nextOvulation: nextOvulationDate.toISOString().split('T')[0]
  };
};

export const getCurrentCycleDay = (cycles: MenstrualCycle[]): number | null => {
  if (cycles.length === 0) return null;

  const today = new Date();
  const sortedCycles = cycles.sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  const currentCycle = sortedCycles.find(cycle => {
    const startDate = new Date(cycle.start_date);
    const cycleLength = cycle.cycle_length || 28;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + cycleLength);
    
    return today >= startDate && today <= endDate;
  });

  if (!currentCycle) return null;

  const startDate = new Date(currentCycle.start_date);
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return diffDays;
};

export const getFertilityStatus = (cycles: MenstrualCycle[], fertilityWindows: FertilityWindow[]): {
  status: 'menstrual' | 'fertile' | 'ovulation' | 'luteal' | 'unknown';
  message: string;
  daysUntilNext: number | null;
} => {
  const today = new Date().toISOString().split('T')[0];
  const currentDay = getCurrentCycleDay(cycles);
  
  // Check if currently menstruating
  const currentPeriod = cycles.find(cycle => {
    const startDate = cycle.start_date;
    const endDate = cycle.end_date;
    if (!endDate) return startDate === today;
    return today >= startDate && today <= endDate;
  });

  if (currentPeriod) {
    return {
      status: 'menstrual',
      message: 'Currently menstruating',
      daysUntilNext: null
    };
  }

  // Check if in fertile window
  const currentFertileWindow = fertilityWindows.find(window => 
    today >= window.fertile_start && today <= window.fertile_end
  );

  if (currentFertileWindow) {
    if (currentFertileWindow.ovulation_date === today) {
      return {
        status: 'ovulation',
        message: 'Ovulation day - highest fertility',
        daysUntilNext: null
      };
    }
    
    const daysToOvulation = currentFertileWindow.ovulation_date ? 
      Math.ceil((new Date(currentFertileWindow.ovulation_date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    return {
      status: 'fertile',
      message: daysToOvulation ? `Fertile window - ${daysToOvulation} days to ovulation` : 'Fertile window',
      daysUntilNext: daysToOvulation
    };
  }

  // Predict next events
  const prediction = predictNextCycle(cycles);
  if (prediction) {
    const daysToNextPeriod = Math.ceil((new Date(prediction.nextPeriod).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
    const daysToNextOvulation = Math.ceil((new Date(prediction.nextOvulation).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToNextOvulation > 0 && daysToNextOvulation < daysToNextPeriod) {
      return {
        status: 'luteal',
        message: `${daysToNextOvulation} days until next ovulation`,
        daysUntilNext: daysToNextOvulation
      };
    }
    
    return {
      status: 'luteal',
      message: `${daysToNextPeriod} days until next period`,
      daysUntilNext: daysToNextPeriod
    };
  }

  return {
    status: 'unknown',
    message: 'Track more cycles for predictions',
    daysUntilNext: null
  };
};