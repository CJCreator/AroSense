

import React, { useState, useEffect, useMemo } from 'react';
import FemaleIcon from '../components/icons/FemaleIcon.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import EditIcon from '../components/icons/EditIcon.tsx';
import TrashIcon from '../components/icons/TrashIcon.tsx';
import BookOpenIcon from '../components/icons/BookOpenIcon.tsx'; // For educational resources
import { 
    PeriodEntry, SymptomLogEntry, ScreeningReminderEntry, EducationalArticle,
    PostpartumRecoveryLogEntry, MentalWellnessCheckinEntry,
    COMMON_SYMPTOMS, SCREENING_TYPES, MOOD_OPTIONS, POSTPARTUM_COMMON_SYMPTOMS
} from '../types.ts';

type ActiveTab = 'tracker' | 'symptoms' | 'reminders' | 'education' | 'postnatal';

// Helper to format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper to add days to a date string
const addDaysToDateString = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

// Helper to add years to a date string
const addYearsToDate = (dateStr: string, years: number): string => {
  const date = new Date(dateStr);
  date.setFullYear(date.getFullYear() + years);
  return formatDate(date);
};

const CalendarDay: React.FC<{ day: number | null; isCurrentMonth: boolean; isToday: boolean; isPeriod: boolean; isPredictedPeriod: boolean; isFertile: boolean; isOvulation: boolean; onClick?: () => void }> = 
({ day, isCurrentMonth, isToday, isPeriod, isPredictedPeriod, isFertile, isOvulation, onClick }) => {
  let className = "h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center border border-slate-200 text-sm";
  if (!isCurrentMonth || day === null) {
    className += " bg-slate-50 text-slate-400";
  } else {
    className += " cursor-pointer hover:bg-slate-100 relative";
    if (isToday) className += " bg-primary-light !text-primary-dark font-bold ring-2 ring-primary";
    if (isPeriod) className += " !bg-accent !text-white";
    if (isPredictedPeriod && !isPeriod) className += " bg-pink-100 !text-pink-700 opacity-70";
    if (isFertile && !isPeriod) className += " bg-green-100";
    if (isOvulation && !isPeriod) className += " !bg-green-300 ring-1 ring-green-500";
  }
  return <div className={className} onClick={day && isCurrentMonth ? onClick : undefined}>
    {day}
    {isOvulation && day !== null && isCurrentMonth && <span className="absolute bottom-0.5 right-0.5 text-xs">Ov</span>}
    </div>;
};


const PeriodTrackerView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loggedPeriods, setLoggedPeriods] = useState<PeriodEntry[]>(() => {
    const saved = localStorage.getItem('womensCare_loggedPeriods');
    return saved ? JSON.parse(saved) : [
      { id: '1', startDate: '2024-07-05', endDate: '2024-07-09'},
      { id: '2', startDate: '2024-06-07', endDate: '2024-06-11'},
    ];
  });
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PeriodEntry | undefined>(undefined);
  const [periodFormData, setPeriodFormData] = useState<{startDate: string, endDate: string, notes?: string}>({ startDate: formatDate(new Date()), endDate: formatDate(new Date()) });

  useEffect(() => {
    localStorage.setItem('womensCare_loggedPeriods', JSON.stringify(loggedPeriods));
  }, [loggedPeriods]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday...

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  const numDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  
  const calendarDays: (number | null)[] = Array(firstDay).fill(null).concat(Array.from({ length: numDays }, (_, i) => i + 1));
  while (calendarDays.length % 7 !== 0) {
      calendarDays.push(null);
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleOpenPeriodModal = (period?: PeriodEntry) => {
    setEditingPeriod(period);
    setPeriodFormData(period ? { startDate: period.startDate, endDate: period.endDate, notes: period.notes || '' } : { startDate: formatDate(new Date()), endDate: formatDate(new Date()), notes: '' });
    setShowPeriodModal(true);
  };

  const handlePeriodFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPeriodFormData({...periodFormData, [e.target.name]: e.target.value });
  };

  const handlePeriodSubmit = () => {
    if (!periodFormData.startDate || !periodFormData.endDate) {
        alert("Please select start and end dates.");
        return;
    }
    if (new Date(periodFormData.startDate) > new Date(periodFormData.endDate)) {
        alert("Start date cannot be after end date.");
        return;
    }

    if (editingPeriod) {
      setLoggedPeriods(loggedPeriods.map(p => p.id === editingPeriod.id ? { ...editingPeriod, ...periodFormData } : p));
    } else {
      setLoggedPeriods([...loggedPeriods, { id: Date.now().toString(), ...periodFormData }]);
    }
    setShowPeriodModal(false);
    setEditingPeriod(undefined);
  };
  
  const handleDeletePeriod = (id: string) => {
    if (window.confirm("Are you sure you want to delete this period entry?")) {
      setLoggedPeriods(loggedPeriods.filter(p => p.id !== id));
    }
  };

  const cycleInfo = useMemo(() => {
    if (loggedPeriods.length < 2) return { avgCycleLength: null, nextPredictedPeriodStart: null, ovulationDate: null, fertileWindowStart: null, fertileWindowEnd: null };
    
    const sortedPeriods = [...loggedPeriods].sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    let totalCycleLength = 0;
    let cycleCount = 0;
    for (let i = 1; i < sortedPeriods.length; i++) {
        const diffTime = Math.abs(new Date(sortedPeriods[i].startDate).getTime() - new Date(sortedPeriods[i-1].startDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 15 && diffDays < 45) { // Basic sanity check for cycle length
            totalCycleLength += diffDays;
            cycleCount++;
        }
    }
    const avgCycleLength = cycleCount > 0 ? Math.round(totalCycleLength / cycleCount) : 28; // Default to 28 if not enough data
    const lastPeriodStartDate = new Date(sortedPeriods[sortedPeriods.length - 1].startDate);
    
    const nextPredictedPeriodStartDate = new Date(lastPeriodStartDate);
    nextPredictedPeriodStartDate.setDate(lastPeriodStartDate.getDate() + avgCycleLength);

    const ovulationDate = new Date(nextPredictedPeriodStartDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14); // Simplified: 14 days before next period

    const fertileWindowStartDate = new Date(ovulationDate);
    fertileWindowStartDate.setDate(ovulationDate.getDate() - 5);
    const fertileWindowEndDate = new Date(ovulationDate); // Ovulation day is fertile

    return { 
        avgCycleLength, 
        nextPredictedPeriodStart: formatDate(nextPredictedPeriodStartDate),
        ovulationDate: formatDate(ovulationDate),
        fertileWindowStart: formatDate(fertileWindowStartDate),
        fertileWindowEnd: formatDate(fertileWindowEndDate),
    };
  }, [loggedPeriods]);


  const isDayInDateRange = (date: Date, startDateStr: string, endDateStr: string): boolean => {
    const checkDate = new Date(date); // Use a copy
    checkDate.setHours(0,0,0,0);
    const rangeStart = new Date(startDateStr);
    rangeStart.setHours(0,0,0,0);
    const rangeEnd = new Date(endDateStr);
    rangeEnd.setHours(0,0,0,0);
    return checkDate >= rangeStart && checkDate <= rangeEnd;
  }

  const isDayPeriod = (day: number) => {
    const date = new Date(year, month, day);
    return loggedPeriods.some(p => isDayInDateRange(date, p.startDate, p.endDate));
  };
  
  const isDayPredictedPeriod = (day: number) => {
    if (!cycleInfo.nextPredictedPeriodStart) return false;
    const date = new Date(year, month, day);
    // Show prediction for approx 5 days
    return isDayInDateRange(date, cycleInfo.nextPredictedPeriodStart, addDaysToDateString(cycleInfo.nextPredictedPeriodStart, 4));
  };

  const isDayFertile = (day: number) => {
    if (!cycleInfo.fertileWindowStart || !cycleInfo.fertileWindowEnd) return false;
    const date = new Date(year, month, day);
    return isDayInDateRange(date, cycleInfo.fertileWindowStart, cycleInfo.fertileWindowEnd);
  }

  const isDayOvulation = (day: number) => {
    if (!cycleInfo.ovulationDate) return false;
    const date = new Date(year, month, day);
    date.setHours(0,0,0,0);
    const ovulationD = new Date(cycleInfo.ovulationDate);
    ovulationD.setHours(0,0,0,0);
    return date.getTime() === ovulationD.getTime();
  }

  const today = new Date();

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <h3 className="text-xl font-semibold text-textPrimary">Cycle Calendar</h3>
             <button onClick={() => handleOpenPeriodModal()} className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-pink-500 flex items-center space-x-2 text-sm">
                <PlusIcon className="w-5 h-5" />
                <span>Log Period</span>
            </button>
        </div>
      
        <div className="bg-surface p-4 sm:p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-md text-sm">&lt; Prev</button>
            <div className="text-center">
                <h4 className="text-lg font-semibold text-textPrimary">{currentDate.toLocaleString('default', { month: 'long' })} {year}</h4>
                <button onClick={handleToday} className="text-xs text-primary hover:underline">Go to Today</button>
            </div>
            <button onClick={handleNextMonth} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-md text-sm">Next &gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                <div key={dayName} className="h-8 sm:h-10 flex items-center justify-center bg-slate-100 text-textSecondary text-xs sm:text-sm font-medium">{dayName}</div>
            ))}
            {calendarDays.map((day, index) => (
                <CalendarDay 
                    key={index} 
                    day={day} 
                    isCurrentMonth={day !== null} 
                    isToday={day !== null && year === today.getFullYear() && month === today.getMonth() && day === today.getDate()}
                    isPeriod={day !== null && isDayPeriod(day)}
                    isPredictedPeriod={day !== null && isDayPredictedPeriod(day)}
                    isFertile={day !== null && isDayFertile(day)}
                    isOvulation={day !== null && isDayOvulation(day)}
                />
            ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm">
                <div className="flex items-center space-x-1"><span className="w-3 h-3 bg-accent rounded-sm"></span><span>Logged Period</span></div>
                <div className="flex items-center space-x-1"><span className="w-3 h-3 bg-pink-100 border border-pink-300 rounded-sm"></span><span>Predicted Period</span></div>
                <div className="flex items-center space-x-1"><span className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm"></span><span>Fertile Window</span></div>
                <div className="flex items-center space-x-1"><span className="w-3 h-3 bg-green-300 ring-1 ring-green-500 rounded-sm"></span><span>Predicted Ovulation</span></div>
            </div>
        </div>

        {(cycleInfo.nextPredictedPeriodStart || cycleInfo.avgCycleLength) && (
          <div className="p-4 bg-primary-light text-primary-dark rounded-lg shadow space-y-1">
            {cycleInfo.avgCycleLength && <p className="font-semibold">Avg. Cycle Length: {cycleInfo.avgCycleLength} days</p>}
            {cycleInfo.nextPredictedPeriodStart && <p>Next Predicted Period: {new Date(cycleInfo.nextPredictedPeriodStart).toLocaleDateString()}</p>}
            {cycleInfo.fertileWindowStart && cycleInfo.fertileWindowEnd && <p>Predicted Fertile Window: {new Date(cycleInfo.fertileWindowStart).toLocaleDateString()} - {new Date(cycleInfo.fertileWindowEnd).toLocaleDateString()}</p>}
            {cycleInfo.ovulationDate && <p>Predicted Ovulation: {new Date(cycleInfo.ovulationDate).toLocaleDateString()}</p>}
          </div>
        )}

        {loggedPeriods.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-md font-semibold text-textPrimary">Logged Periods:</h4>
            <ul className="max-h-60 overflow-y-auto space-y-2">
              {loggedPeriods.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(p => (
                <li key={p.id} className="p-3 bg-slate-50 rounded-md flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                    </p>
                    {p.notes && <p className="text-xs text-textSecondary mt-1">Note: {p.notes}</p>}
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => handleOpenPeriodModal(p)} className="p-1 text-blue-600 hover:text-blue-800"><EditIcon className="w-4 h-4"/></button>
                    <button onClick={() => handleDeletePeriod(p.id)} className="p-1 text-red-600 hover:text-red-800"><TrashIcon className="w-4 h-4"/></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showPeriodModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
            <div className="bg-surface p-6 rounded-lg shadow-xl w-full max-w-md">
                <h4 className="text-lg font-semibold mb-4">{editingPeriod ? 'Edit' : 'Log New'} Period</h4>
                <div className="space-y-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-textSecondary mb-1">Start Date</label>
                    <input type="date" name="startDate" id="startDate" value={periodFormData.startDate} onChange={handlePeriodFormChange} className="w-full p-2 border border-slate-300 rounded-md bg-white"/>
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-textSecondary mb-1">End Date</label>
                    <input type="date" name="endDate" id="endDate" value={periodFormData.endDate} onChange={handlePeriodFormChange} className="w-full p-2 border border-slate-300 rounded-md bg-white"/>
                </div>
                 <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-textSecondary mb-1">Notes (Optional)</label>
                    <textarea name="notes" id="notes" value={periodFormData.notes || ''} onChange={handlePeriodFormChange} rows={3} className="w-full p-2 border border-slate-300 rounded-md bg-white"/>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                    <button onClick={() => setShowPeriodModal(false)} className="px-3 py-1.5 text-sm bg-slate-200 hover:bg-slate-300 rounded-md">Cancel</button>
                    <button onClick={handlePeriodSubmit} className="px-3 py-1.5 text-sm bg-accent text-white hover:bg-pink-500 rounded-md">{editingPeriod ? 'Save' : 'Log Period'}</button>
                </div>
                </div>
            </div>
            </div>
        )}
    </div>
  );
};

const SymptomLogView: React.FC = () => {
  const [symptomLogs, setSymptomLogs] = useState<SymptomLogEntry[]>(() => {
    const saved = localStorage.getItem('womensCare_symptomLogs');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [editingSymptomLog, setEditingSymptomLog] = useState<SymptomLogEntry | undefined>(undefined);
  const [symptomFormData, setSymptomFormData] = useState<{date: string, symptoms: string[], moods: string[], customSymptom: string, notes: string, severity?: 'Mild' | 'Moderate' | 'Severe'}>({ date: formatDate(new Date()), symptoms: [], moods: [], customSymptom: '', notes: '' });

  useEffect(() => {
    localStorage.setItem('womensCare_symptomLogs', JSON.stringify(symptomLogs));
  }, [symptomLogs]);

  const handleOpenSymptomModal = (log?: SymptomLogEntry) => {
    setEditingSymptomLog(log);
    setSymptomFormData(log ? 
        { date: log.date, symptoms: log.symptoms, moods: log.moods || [], customSymptom: log.customSymptom || '', notes: log.notes || '', severity: log.severity } : 
        { date: formatDate(new Date()), symptoms: [], moods: [], customSymptom: '', notes: '' }
    );
    setShowSymptomModal(true);
  };
  
  const handleSymptomFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSymptomFormData({...symptomFormData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (itemName: string, type: 'symptoms' | 'moods') => {
    setSymptomFormData(prev => ({
        ...prev,
        [type]: prev[type]?.includes(itemName) ? prev[type]?.filter(s => s !== itemName) : [...(prev[type] || []), itemName]
    }));
  };

  const handleSymptomSubmit = () => {
    if (!symptomFormData.date) {
        alert("Please select a date.");
        return;
    }
    const finalLog = { ...symptomFormData, id: editingSymptomLog?.id || Date.now().toString() };
    if (editingSymptomLog) {
        setSymptomLogs(symptomLogs.map(log => log.id === editingSymptomLog.id ? finalLog : log));
    } else {
        setSymptomLogs([...symptomLogs, finalLog]);
    }
    setShowSymptomModal(false);
    setEditingSymptomLog(undefined);
  };

  const handleDeleteSymptomLog = (id: string) => {
    if (window.confirm("Are you sure you want to delete this symptom log?")) {
      setSymptomLogs(symptomLogs.filter(log => log.id !== id));
    }
  };


  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <h3 className="text-xl font-semibold text-textPrimary">Symptom & Mood Diary</h3>
            <button onClick={() => handleOpenSymptomModal()} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 text-sm">
                <PlusIcon className="w-5 h-5" />
                <span>Log Entry</span>
            </button>
        </div>
        
        {/* Placeholder for chart */}
        <div className="p-4 bg-slate-100 rounded-lg text-center text-textSecondary text-sm">
            Symptom patterns and charts will be displayed here in a future update.
        </div>

        {symptomLogs.length === 0 && <p className="text-textSecondary text-center py-4">No symptoms or moods logged yet. Click "Log Entry" to start.</p>}
        <ul className="space-y-3 max-h-96 overflow-y-auto">
            {symptomLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
            <li key={log.id} className="p-4 bg-surface rounded-lg shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-textPrimary">{new Date(log.date).toLocaleDateString()} {log.severity && <span className="text-xs bg-slate-200 text-textSecondary px-1.5 py-0.5 rounded-full ml-2">{log.severity}</span>}</p>
                        {log.symptoms?.length > 0 && <p className="text-sm text-textSecondary">Symptoms: {log.symptoms.join(', ')}{log.customSymptom && (log.symptoms.length > 0 ? ', ' : '') + log.customSymptom}</p>}
                        {log.moods?.length > 0 && <p className="text-sm text-textSecondary">Moods: {log.moods.join(', ')}</p>}
                        {log.notes && <p className="text-xs text-textSecondary mt-1">Notes: {log.notes}</p>}
                    </div>
                    <div className="flex space-x-1">
                        <button onClick={() => handleOpenSymptomModal(log)} className="p-1 text-blue-600 hover:text-blue-800"><EditIcon className="w-4 h-4"/></button>
                        <button onClick={() => handleDeleteSymptomLog(log.id)} className="p-1 text-red-600 hover:text-red-800"><TrashIcon className="w-4 h-4"/></button>
                    </div>
                </div>
            </li>
            ))}
        </ul>

        {showSymptomModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
            <div className="bg-surface p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h4 className="text-lg font-semibold mb-4">{editingSymptomLog ? 'Edit' : 'Log New'} Symptoms & Mood</h4>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="symptomDate" className="block text-sm font-medium text-textSecondary mb-1">Date</label>
                        <input type="date" name="date" id="symptomDate" value={symptomFormData.date} onChange={handleSymptomFormChange} className="w-full p-2 border border-slate-300 rounded-md bg-white"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">Common Symptoms</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-md">
                        {COMMON_SYMPTOMS.map(symptom => (
                            <label key={symptom} className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" checked={symptomFormData.symptoms.includes(symptom)} onChange={() => handleCheckboxChange(symptom, 'symptoms')} className="rounded text-primary focus:ring-primary"/>
                            <span>{symptom}</span>
                            </label>
                        ))}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="customSymptom" className="block text-sm font-medium text-textSecondary mb-1">Other Symptom (if any)</label>
                        <input type="text" name="customSymptom" id="customSymptom" value={symptomFormData.customSymptom} onChange={handleSymptomFormChange} className="w-full p-2 border border-slate-300 rounded-md bg-white"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">Moods</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-md">
                        {MOOD_OPTIONS.map(mood => (
                            <label key={mood} className="flex items-center space-x-2 text-sm">
                            <input type="checkbox" checked={symptomFormData.moods.includes(mood)} onChange={() => handleCheckboxChange(mood, 'moods')} className="rounded text-primary focus:ring-primary"/>
                            <span>{mood}</span>
                            </label>
                        ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="severity" className="block text-sm font-medium text-textSecondary mb-1">Severity (Optional)</label>
                        <select name="severity" id="severity" value={symptomFormData.severity || ''} onChange={handleSymptomFormChange} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                            <option value="">Select Severity</option>
                            <option value="Mild">Mild</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Severe">Severe</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="symptomNotes" className="block text-sm font-medium text-textSecondary mb-1">Notes (Optional)</label>
                        <textarea name="notes" id="symptomNotes" value={symptomFormData.notes} onChange={handleSymptomFormChange} rows={3} className="w-full p-2 border border-slate-300 rounded-md bg-white"/>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button onClick={() => setShowSymptomModal(false)} className="px-3 py-1.5 text-sm bg-slate-200 hover:bg-slate-300 rounded-md">Cancel</button>
                        <button onClick={handleSymptomSubmit} className="px-3 py-1.5 text-sm bg-primary text-white hover:bg-primary-dark rounded-md">{editingSymptomLog ? 'Save' : 'Log Entry'}</button>
                    </div>
                </div>
            </div>
            </div>
        )}
    </div>
  );
};

const ScreeningRemindersView: React.FC = () => {
    const [reminders, setReminders] = useState<ScreeningReminderEntry[]>(() => {
        const saved = localStorage.getItem('womensCare_screeningReminders');
        return saved ? JSON.parse(saved) : [];
    });
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState<ScreeningReminderEntry | undefined>(undefined);
    const [reminderFormData, setReminderFormData] = useState<Partial<ScreeningReminderEntry>>({ screeningType: SCREENING_TYPES[0]});
    
    useEffect(() => {
        localStorage.setItem('womensCare_screeningReminders', JSON.stringify(reminders));
      }, [reminders]);

    const calculateNextDueDate = (lastDateStr?: string, frequency?: number): string | undefined => {
        if (lastDateStr && frequency && frequency > 0) {
            return addYearsToDate(lastDateStr, frequency);
        }
        return undefined;
    };

    const handleOpenReminderModal = (reminder?: ScreeningReminderEntry) => {
        setEditingReminder(reminder);
        setReminderFormData(reminder ? 
            { ...reminder } : 
            { screeningType: SCREENING_TYPES[0], lastScreeningDate: formatDate(new Date()), frequencyYears: 1, isCompleted: false }
        );
        setShowReminderModal(true);
    };

    const handleReminderFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let processedValue: string | number | boolean = value;
        if (type === 'number') processedValue = parseInt(value, 10);
        if (type === 'checkbox') processedValue = (e.target as HTMLInputElement).checked;

        setReminderFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleReminderSubmit = () => {
        if (!reminderFormData.screeningType) {
            alert("Please select a screening type.");
            return;
        }
        
        let nextDueDate = reminderFormData.reminderDate; // User-set specific date takes precedence
        if (!nextDueDate) { // If not set, calculate
            nextDueDate = calculateNextDueDate(reminderFormData.lastScreeningDate, reminderFormData.frequencyYears);
        }

        const finalReminder: ScreeningReminderEntry = {
            ...reminderFormData,
            id: editingReminder?.id || Date.now().toString(),
            screeningType: reminderFormData.screeningType!,
            nextDueDate: nextDueDate,
        };

        if (editingReminder) {
            setReminders(reminders.map(r => r.id === editingReminder.id ? finalReminder : r));
        } else {
            setReminders([...reminders, finalReminder]);
        }
        setShowReminderModal(false);
        setEditingReminder(undefined);
    };

    const handleDeleteReminder = (id: string) => {
        if (window.confirm("Are you sure you want to delete this reminder?")) {
          setReminders(reminders.filter(r => r.id !== id));
        }
    };

    const toggleCompleteReminder = (id: string) => {
        setReminders(reminders.map(r => r.id === id ? {...r, isCompleted: !r.isCompleted, lastScreeningDate: !r.isCompleted ? formatDate(new Date()) : r.lastScreeningDate} : r));
    }


  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <h3 className="text-xl font-semibold text-textPrimary">Screening Reminders</h3>
            <button onClick={() => handleOpenReminderModal()} className="bg-secondary text-textPrimary px-4 py-2 rounded-lg hover:bg-secondary-dark flex items-center space-x-2 text-sm">
                <PlusIcon className="w-5 h-5" />
                <span>Add Reminder</span>
            </button>
        </div>
        
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
            Info: Regular health screenings are important. Consult your doctor for personalized advice. 
            {/* Placeholder for link to more info */}
            <a href="#" className="font-semibold underline ml-1">Learn more</a>
        </div>


        {reminders.length === 0 && <p className="text-textSecondary text-center py-4">No screening reminders set up. Click "Add Reminder" to get started.</p>}
        <ul className="space-y-3 max-h-96 overflow-y-auto">
            {reminders.sort((a,b) => (a.nextDueDate && b.nextDueDate ? new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime() : 0)).map(reminder => (
            <li key={reminder.id} className={`p-4 bg-surface rounded-lg shadow ${reminder.isCompleted ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className={`font-semibold text-textPrimary ${reminder.isCompleted ? 'line-through' : ''}`}>{reminder.screeningType}</p>
                        {reminder.nextDueDate && <p className="text-sm text-red-600 font-medium">Due: {new Date(reminder.nextDueDate).toLocaleDateString()}</p>}
                        {reminder.lastScreeningDate && <p className="text-xs text-textSecondary">Last: {new Date(reminder.lastScreeningDate).toLocaleDateString()}</p>}
                        {reminder.notes && <p className="text-xs text-textSecondary mt-1">Notes: {reminder.notes}</p>}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                         <div className="flex space-x-1">
                            <button onClick={() => handleOpenReminderModal(reminder)} className="p-1 text-blue-600 hover:text-blue-800"><EditIcon className="w-4 h-4"/></button>
                            <button onClick={() => handleDeleteReminder(reminder.id)} className="p-1 text-red-600 hover:text-red-800"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                        <button 
                            onClick={() => toggleCompleteReminder(reminder.id)} 
                            className={`mt-1 text-xs px-2 py-1 rounded ${reminder.isCompleted ? 'bg-slate-300 text-slate-700' : 'bg-green-500 text-white'}`}
                        >
                            {reminder.isCompleted ? 'Mark Incomplete' : 'Mark Done'}
                        </button>
                    </div>
                </div>
            </li>
            ))}
        </ul>

        {showReminderModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
            <div className="bg-surface p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h4 className="text-lg font-semibold mb-4">{editingReminder ? 'Edit' : 'Add New'} Reminder</h4>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="screeningType" className="block text-sm font-medium text-textSecondary mb-1">Screening Type</label>
                        <select name="screeningType" id="screeningType" value={reminderFormData.screeningType} onChange={handleReminderFormChange} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                            {SCREENING_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="lastScreeningDate" className="block text-sm font-medium text-textSecondary mb-1">Last Screening Date (Optional)</label>
                        <input type="date" name="lastScreeningDate" id="lastScreeningDate" value={reminderFormData.lastScreeningDate || ''} onChange={handleReminderFormChange} className="w-full p-2 border border-slate-300 rounded-md bg-white"/>
                    </div>
                    <div>
                        <label htmlFor="frequencyYears" className="block text-sm font-medium text-textSecondary mb-1">Recommended Frequency (Years, Optional)</label>
                        <input type="number" name="frequencyYears" id="frequencyYears" value={reminderFormData.frequencyYears || ''} min="0" onChange={handleReminderFormChange} className="w-full p-2 border border-slate-300 rounded-md bg-white"/>
                    </div>
                    <div>
                        <label htmlFor="reminderDate" className="block text-sm font-medium text-textSecondary mb-1">Specific Reminder Date (Overrides calculation, Optional)</label>
                        <input type="date" name="reminderDate" id="reminderDate" value={reminderFormData.reminderDate || ''} onChange={handleReminderFormChange} className="w-full p-2 border border-slate-300 rounded-md bg-white"/>
                    </div>
                     <div>
                        <label htmlFor="reminderNotes" className="block text-sm font-medium text-textSecondary mb-1">Notes (Optional)</label>
                        <textarea name="notes" id="reminderNotes" value={reminderFormData.notes || ''} onChange={handleReminderFormChange} rows={3} className="w-full p-2 border border-slate-300 rounded-md bg-white"/>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" name="isCompleted" id="isCompleted" checked={reminderFormData.isCompleted || false} onChange={handleReminderFormChange} className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary"/>
                        <label htmlFor="isCompleted" className="ml-2 block text-sm text-textPrimary">Mark as completed</label>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button onClick={() => setShowReminderModal(false)} className="px-3 py-1.5 text-sm bg-slate-200 hover:bg-slate-300 rounded-md">Cancel</button>
                        <button onClick={handleReminderSubmit} className="px-3 py-1.5 text-sm bg-secondary text-textPrimary hover:bg-secondary-dark rounded-md">{editingReminder ? 'Save Changes' : 'Add Reminder'}</button>
                    </div>
                </div>
            </div>
            </div>
        )}
    </div>
  );
};


const EducationalResourcesView: React.FC = () => {
    const [articles, setArticles] = useState<EducationalArticle[]>(() => {
        const saved = localStorage.getItem('womensCare_educationalArticles');
        if (saved) return JSON.parse(saved);
        return [ // Mock data
            { id: 'edu1', title: 'Understanding Your Menstrual Cycle', category: 'Menstrual Health', summary: 'Learn about the phases of your cycle and what they mean.', tags: ['cycle', 'period'] },
            { id: 'edu2', title: 'Tips for Managing PMS', category: 'Menstrual Health', summary: 'Effective strategies to cope with Premenstrual Syndrome.', tags: ['pms', 'symptoms'] },
            { id: 'edu3', title: 'Importance of Regular Check-ups', category: 'General Wellness', summary: 'Why regular visits to your gynecologist are crucial.', tags: ['health', 'screening'] },
        ];
    });
    // For simplicity, not adding add/edit/delete for articles in this pass
    // const [showArticleModal, setShowArticleModal] = useState(false);
    // const [viewingArticle, setViewingArticle] = useState<EducationalArticle | undefined>(undefined);

    useEffect(() => {
        localStorage.setItem('womensCare_educationalArticles', JSON.stringify(articles));
    }, [articles]);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-textPrimary">Health Library</h3>
            <p className="text-textSecondary">Browse articles and resources related to women's health. (Content is for informational purposes only).</p>
            {articles.length === 0 && <p className="text-textSecondary text-center py-4">No educational resources available yet.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {articles.map(article => (
                    <div key={article.id} className="p-4 bg-surface rounded-lg shadow hover:shadow-md transition-shadow">
                        <h4 className="font-semibold text-primary mb-1">{article.title}</h4>
                        <p className="text-xs text-accent mb-1">{article.category}</p>
                        <p className="text-sm text-textSecondary mb-2">{article.summary}</p>
                        {article.contentUrl ? 
                            <a href={article.contentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Read more...</a>
                            : <span className="text-sm text-slate-400">Full article coming soon...</span>}
                         {article.tags && <div className="mt-2 text-xs">Tags: {article.tags.join(', ')}</div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const PostnatalCareView: React.FC = () => {
    const [recoveryLogs, setRecoveryLogs] = useState<PostpartumRecoveryLogEntry[]>(() => {
        const saved = localStorage.getItem('womensCare_postpartumRecoveryLogs');
        return saved ? JSON.parse(saved) : [];
    });
    const [mentalWellnessLogs, setMentalWellnessLogs] = useState<MentalWellnessCheckinEntry[]>(() => {
        const saved = localStorage.getItem('womensCare_mentalWellnessLogs');
        return saved ? JSON.parse(saved) : [];
    });

    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [editingRecoveryLog, setEditingRecoveryLog] = useState<PostpartumRecoveryLogEntry | undefined>(undefined);
    const [recoveryFormData, setRecoveryFormData] = useState<Partial<PostpartumRecoveryLogEntry>>({date: formatDate(new Date()), physicalSymptoms: []});

    const [showMentalWellnessModal, setShowMentalWellnessModal] = useState(false);
    const [editingMentalWellnessLog, setEditingMentalWellnessLog] = useState<MentalWellnessCheckinEntry | undefined>(undefined);
    const [mentalWellnessFormData, setMentalWellnessFormData] = useState<Partial<MentalWellnessCheckinEntry>>({date: formatDate(new Date()), moods: []});

    useEffect(() => { localStorage.setItem('womensCare_postpartumRecoveryLogs', JSON.stringify(recoveryLogs)); }, [recoveryLogs]);
    useEffect(() => { localStorage.setItem('womensCare_mentalWellnessLogs', JSON.stringify(mentalWellnessLogs)); }, [mentalWellnessLogs]);
    
    // Recovery Log Handlers
    const handleOpenRecoveryModal = (log?: PostpartumRecoveryLogEntry) => {
        setEditingRecoveryLog(log);
        setRecoveryFormData(log ? {...log} : {date: formatDate(new Date()), physicalSymptoms: [], bleedingLevel: 'Moderate', painLevel: 0});
        setShowRecoveryModal(true);
    };
    const handleRecoveryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setRecoveryFormData(prev => ({...prev, [name]: type === 'number' ? parseInt(value) : value }));
    };
    const handleRecoverySymptomCheckboxChange = (symptomName: string) => {
        setRecoveryFormData(prev => ({
            ...prev,
            physicalSymptoms: prev.physicalSymptoms?.includes(symptomName) ? prev.physicalSymptoms.filter(s => s !== symptomName) : [...(prev.physicalSymptoms || []), symptomName]
        }));
    };
    const handleRecoverySubmit = () => {
        const finalLog = { ...recoveryFormData, id: editingRecoveryLog?.id || Date.now().toString()} as PostpartumRecoveryLogEntry;
        setRecoveryLogs(prev => editingRecoveryLog ? prev.map(l => l.id === finalLog.id ? finalLog : l) : [...prev, finalLog]);
        setShowRecoveryModal(false);
    };
    const handleDeleteRecoveryLog = (id: string) => {
        if (window.confirm("Delete this recovery log?")) setRecoveryLogs(prev => prev.filter(l => l.id !== id));
    };

    // Mental Wellness Log Handlers
    const handleOpenMentalWellnessModal = (log?: MentalWellnessCheckinEntry) => {
        setEditingMentalWellnessLog(log);
        setMentalWellnessFormData(log ? {...log} : {date: formatDate(new Date()), moods: [], energyLevel: 3, sleepQuality: 3, supportSystemRating:3 });
        setShowMentalWellnessModal(true);
    };
    const handleMentalWellnessFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setMentalWellnessFormData(prev => ({...prev, [name]: type === 'number' ? parseInt(value) : value }));
    };
    const handleMentalWellnessMoodCheckboxChange = (moodName: string) => {
        setMentalWellnessFormData(prev => ({
            ...prev,
            moods: prev.moods?.includes(moodName) ? prev.moods.filter(s => s !== moodName) : [...(prev.moods || []), moodName]
        }));
    };
    const handleMentalWellnessSubmit = () => {
        const finalLog = { ...mentalWellnessFormData, id: editingMentalWellnessLog?.id || Date.now().toString()} as MentalWellnessCheckinEntry;
        setMentalWellnessLogs(prev => editingMentalWellnessLog ? prev.map(l => l.id === finalLog.id ? finalLog : l) : [...prev, finalLog]);
        setShowMentalWellnessModal(false);
    };
     const handleDeleteMentalWellnessLog = (id: string) => {
        if (window.confirm("Delete this mental wellness log?")) setMentalWellnessLogs(prev => prev.filter(l => l.id !== id));
    };


    return (
        <div className="space-y-8">
            {/* Postpartum Recovery Section */}
            <section>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-textPrimary">Postpartum Recovery Log</h4>
                    <button onClick={() => handleOpenRecoveryModal()} className="bg-pink-500 text-white px-3 py-1.5 rounded-md text-sm flex items-center space-x-1">
                        <PlusIcon className="w-4 h-4" /><span>Log Recovery</span>
                    </button>
                </div>
                {recoveryLogs.length === 0 && <p className="text-textSecondary text-center text-sm py-3">No recovery logs yet.</p>}
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {recoveryLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                        <li key={log.id} className="p-3 bg-slate-50 rounded-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-sm">{new Date(log.date).toLocaleDateString()}</p>
                                    {log.physicalSymptoms?.length > 0 && <p className="text-xs">Symptoms: {log.physicalSymptoms.join(', ')}{log.customPhysicalSymptom ? `, ${log.customPhysicalSymptom}` : ''}</p>}
                                    {log.bleedingLevel && <p className="text-xs">Bleeding: {log.bleedingLevel}</p>}
                                    {log.painLevel !== undefined && <p className="text-xs">Pain: {log.painLevel}/10</p>}
                                    {log.notes && <p className="text-xs italic">Notes: {log.notes}</p>}
                                </div>
                                <div className="flex space-x-1">
                                    <button onClick={() => handleOpenRecoveryModal(log)} className="p-1 text-blue-500"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteRecoveryLog(log.id)} className="p-1 text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Mental Wellness Section */}
            <section>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-textPrimary">Mental Wellness Check-in</h4>
                    <button onClick={() => handleOpenMentalWellnessModal()} className="bg-teal-500 text-white px-3 py-1.5 rounded-md text-sm flex items-center space-x-1">
                        <PlusIcon className="w-4 h-4" /><span>Log Check-in</span>
                    </button>
                </div>
                {mentalWellnessLogs.length === 0 && <p className="text-textSecondary text-center text-sm py-3">No mental wellness check-ins yet.</p>}
                 <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {mentalWellnessLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                        <li key={log.id} className="p-3 bg-slate-50 rounded-md">
                           <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-sm">{new Date(log.date).toLocaleDateString()}</p>
                                    {log.moods?.length > 0 && <p className="text-xs">Moods: {log.moods.join(', ')}</p>}
                                    {log.energyLevel && <p className="text-xs">Energy: {log.energyLevel}/5</p>}
                                    {log.sleepQuality && <p className="text-xs">Sleep: {log.sleepQuality}/5</p>}
                                    {log.supportSystemRating && <p className="text-xs">Support: {log.supportSystemRating}/5</p>}
                                    {log.notes && <p className="text-xs italic">Notes: {log.notes}</p>}
                                </div>
                                <div className="flex space-x-1">
                                    <button onClick={() => handleOpenMentalWellnessModal(log)} className="p-1 text-blue-500"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteMentalWellnessLog(log.id)} className="p-1 text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Recovery Log Modal */}
            {showRecoveryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-30">
                    <div className="bg-surface p-5 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h5 className="text-md font-semibold mb-3">{editingRecoveryLog ? 'Edit' : 'Log'} Postpartum Recovery</h5>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="recoveryLogDate" className="block text-xs font-medium text-slate-700 mb-0.5">Date</label>
                                <input type="date" name="date" id="recoveryLogDate" value={recoveryFormData.date || ''} onChange={handleRecoveryFormChange} className="w-full p-2 border rounded-md bg-white"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Symptoms:</label>
                                <div className="grid grid-cols-2 gap-1 mt-1 max-h-28 overflow-y-auto">
                                    {POSTPARTUM_COMMON_SYMPTOMS.map(s => <label key={s} className="text-xs flex items-center"><input type="checkbox" className="mr-1 rounded text-pink-500" checked={recoveryFormData.physicalSymptoms?.includes(s)} onChange={() => handleRecoverySymptomCheckboxChange(s)}/>{s}</label>)}
                                </div>
                                <input type="text" name="customPhysicalSymptom" placeholder="Other symptom" value={recoveryFormData.customPhysicalSymptom || ''} onChange={handleRecoveryFormChange} className="w-full p-1.5 border rounded-md text-xs mt-1 bg-white"/>
                            </div>
                            <select name="bleedingLevel" value={recoveryFormData.bleedingLevel || ''} onChange={handleRecoveryFormChange} className="w-full p-2 border rounded-md text-sm bg-white">
                                <option value="">Bleeding Level</option>
                                <option value="Heavy">Heavy</option><option value="Moderate">Moderate</option><option value="Light">Light</option><option value="Spotting">Spotting</option>
                            </select>
                            <label className="text-sm">Pain Level (0-10): {recoveryFormData.painLevel || 0}</label>
                            <input type="range" name="painLevel" min="0" max="10" value={recoveryFormData.painLevel || 0} onChange={handleRecoveryFormChange} className="w-full"/>
                            <textarea name="notes" placeholder="Notes" value={recoveryFormData.notes || ''} onChange={handleRecoveryFormChange} rows={2} className="w-full p-2 border rounded-md text-sm bg-white"/>
                        </div>
                        <div className="flex justify-end space-x-2 mt-3">
                            <button onClick={() => setShowRecoveryModal(false)} className="px-3 py-1 text-xs bg-slate-200 rounded">Cancel</button>
                            <button onClick={handleRecoverySubmit} className="px-3 py-1 text-xs bg-pink-500 text-white rounded">{editingRecoveryLog ? 'Save' : 'Log'}</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Mental Wellness Modal */}
            {showMentalWellnessModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-30">
                    <div className="bg-surface p-5 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h5 className="text-md font-semibold mb-3">{editingMentalWellnessLog ? 'Edit' : 'New'} Mental Wellness Check-in</h5>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="mentalWellnessLogDate" className="block text-xs font-medium text-slate-700 mb-0.5">Date</label>
                                <input type="date" name="date" id="mentalWellnessLogDate" value={mentalWellnessFormData.date || ''} onChange={handleMentalWellnessFormChange} className="w-full p-2 border rounded-md bg-white"/>
                            </div>
                             <div>
                                <label className="text-sm font-medium">Moods:</label>
                                <div className="grid grid-cols-2 gap-1 mt-1 max-h-28 overflow-y-auto">
                                    {MOOD_OPTIONS.map(s => <label key={s} className="text-xs flex items-center"><input type="checkbox" className="mr-1 rounded text-teal-500" checked={mentalWellnessFormData.moods?.includes(s)} onChange={() => handleMentalWellnessMoodCheckboxChange(s)}/>{s}</label>)}
                                </div>
                            </div>
                            {[
                                {label: 'Energy Level', name: 'energyLevel'}, 
                                {label: 'Sleep Quality', name: 'sleepQuality'},
                                {label: 'Support System', name: 'supportSystemRating'}
                            ].map(item => (
                                <div key={item.name}>
                                    <label className="text-sm">{item.label} (1-5): {mentalWellnessFormData[item.name as keyof typeof mentalWellnessFormData] || 3}</label>
                                    <input type="range" name={item.name} min="1" max="5" value={mentalWellnessFormData[item.name as keyof typeof mentalWellnessFormData] as number || 3} onChange={handleMentalWellnessFormChange} className="w-full"/>
                                </div>
                            ))}
                            <textarea name="notes" placeholder="Journal or notes" value={mentalWellnessFormData.notes || ''} onChange={handleMentalWellnessFormChange} rows={3} className="w-full p-2 border rounded-md text-sm bg-white"/>
                        </div>
                        <div className="flex justify-end space-x-2 mt-3">
                            <button onClick={() => setShowMentalWellnessModal(false)} className="px-3 py-1 text-xs bg-slate-200 rounded">Cancel</button>
                            <button onClick={handleMentalWellnessSubmit} className="px-3 py-1 text-xs bg-teal-500 text-white rounded">{editingMentalWellnessLog ? 'Save' : 'Log'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const WomensCarePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tracker');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tracker':
        return <PeriodTrackerView />;
      case 'symptoms':
        return <SymptomLogView />;
      case 'reminders':
        return <ScreeningRemindersView />;
      case 'education':
        return <EducationalResourcesView />;
      case 'postnatal':
        return <PostnatalCareView />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{tabName: ActiveTab, currentTab: ActiveTab, onClick: () => void, children: React.ReactNode, icon?: React.ReactNode}> = 
  ({tabName, currentTab, onClick, children, icon}) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-2.5 text-sm font-medium rounded-t-lg transition-colors
                    ${currentTab === tabName 
                        ? 'bg-surface text-primary border-b-2 border-primary shadow-sm' 
                        : 'text-textSecondary hover:text-primary hover:bg-slate-50'}`}
        role="tab"
        aria-selected={currentTab === tabName}
    >
        {icon}{children}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3">
            <FemaleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
            <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary">Women's Wellness Hub</h2>
        </div>
      </div>

      <div role="tablist" className="border-b border-slate-200 flex flex-wrap -mb-px">
        <TabButton tabName="tracker" currentTab={activeTab} onClick={() => setActiveTab('tracker')}>Period Tracker</TabButton>
        <TabButton tabName="symptoms" currentTab={activeTab} onClick={() => setActiveTab('symptoms')}>Symptom Log</TabButton>
        <TabButton tabName="reminders" currentTab={activeTab} onClick={() => setActiveTab('reminders')}>Screening Reminders</TabButton>
        <TabButton tabName="education" currentTab={activeTab} onClick={() => setActiveTab('education')} icon={<BookOpenIcon className="w-4 h-4 mr-1 hidden sm:inline-block"/>}>Resources</TabButton>
        <TabButton tabName="postnatal" currentTab={activeTab} onClick={() => setActiveTab('postnatal')}>Postnatal Care</TabButton>
      </div>

      <div className="mt-0 py-4"> {/* Adjusted margin for closer content to tabs */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default WomensCarePage;