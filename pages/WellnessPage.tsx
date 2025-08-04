import React, { useState, useEffect, useMemo, useCallback } from 'react';
import HeartbeatIcon from '../components/icons/HeartbeatIcon.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import EditIcon from '../components/icons/EditIcon.tsx';
import TrashIcon from '../components/icons/TrashIcon.tsx';
import BookOpenIcon from '../components/icons/BookOpenIcon.tsx'; // For educational resources
import {
    VitalLog, BloodPressureReading, HeartRateReading, BloodGlucoseReading, TemperatureReading, OxygenSaturationReading,
    WeightLogEntry, BMIRecord, WeightGoal,
    ActivityLog, ActivityGoal, ACTIVITY_TYPES, ACTIVITY_EFFORT_LEVELS,
    SleepLog, SLEEP_QUALITY_RATINGS,
    HydrationLog, HydrationGoal,
    MoodLog, MOOD_RATING_OPTIONS, MOOD_OPTIONS,
    WellnessResource, WellnessSummary, FamilyMember, ActivityTypeForGamification
} from '../types.ts';
import { DEFAULT_FAMILY_MEMBER_IMAGE } from '../constants.tsx'; 
import { awardPoints, checkAndAwardBadges, updateStreak, incrementLogCount } from '../utils/gamificationUtils.ts';
// import useLocalStorage from '/hooks/useLocalStorage'; // Replaced by service
import * as wellnessService from '../services/wellnessService.ts'; // Import the service
import AppModal from '../components/AppModal.tsx'; 
import DateTimeInputGroup from '../components/DateTimeInputGroup.tsx'; 
import { useAuth } from '../contexts/AuthContext.tsx'; 


// Mock current user/family member for context (height for BMI etc)
// This should eventually come from the logged-in user or selected family member profile
const MOCK_USER_FOR_WELLNESS: Partial<FamilyMember> = {
    id: 'user1', 
    name: 'Current User',
    heightCm: 170 
};


type ActiveWellnessTab = 'dashboard' | 'vitals' | 'weight_bmi' | 'activity' | 'sleep' | 'hydration' | 'mood' | 'resources';

const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const formatTime = (date: Date): string => date.toTimeString().split(' ')[0].substring(0, 5); // HH:MM


const TabButton: React.FC<{ tabName: ActiveWellnessTab, currentTab: ActiveWellnessTab, onClick: () => void, children: React.ReactNode }> =
    ({ tabName, currentTab, onClick, children }) => (
        <button
            onClick={onClick}
            className={`flex-shrink-0 px-3 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2
                    ${currentTab === tabName
                    ? 'border-primary text-primary bg-surface shadow-sm'
                    : 'border-transparent text-textSecondary hover:text-primary hover:bg-slate-50'}`}
            role="tab"
            aria-selected={currentTab === tabName}
        >
            {children}
        </button>
    );


// --- Dashboard Tab ---
const WellnessDashboardView: React.FC<{summary: WellnessSummary | null, onLogAction: (action: ActiveWellnessTab) => void, isLoading: boolean}> = ({summary, onLogAction, isLoading}) => {
    
    const SummaryCard: React.FC<{title: string; value?: string; subValue?:string; unit?: string; action?: () => void; actionLabel?: string}> = 
    ({title, value, subValue, unit, action, actionLabel}) => (
        <div className="bg-slate-50 p-4 rounded-lg shadow-sm">
            <h4 className="text-md font-semibold text-textPrimary">{title}</h4>
            {isLoading ? <p className="text-sm text-textSecondary mt-1">Loading...</p> : 
             value ? (
                <p className="text-2xl font-bold text-primary mt-1">{value} <span className="text-sm font-normal text-textSecondary">{unit}</span></p>
            ) : <p className="text-sm text-textSecondary mt-1">No data yet.</p>}
            {!isLoading && subValue && <p className="text-xs text-textSecondary">{subValue}</p>}
            {action && actionLabel && <button onClick={action} className="mt-2 text-xs bg-primary-light text-primary-dark px-2 py-1 rounded hover:bg-primary">{actionLabel}</button>}
        </div>
    );

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-textPrimary">Your Wellness Snapshot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SummaryCard 
                    title="Blood Pressure" 
                    value={summary?.lastBP ? `${summary.lastBP.systolic}/${summary.lastBP.diastolic}` : undefined}
                    unit="mmHg"
                    subValue={summary?.lastBP ? `Pulse: ${summary.lastBP.pulse || 'N/A'} bpm on ${new Date(summary.lastBP.date).toLocaleDateString()}` : undefined}
                    action={() => onLogAction('vitals')} actionLabel="Log BP"
                />
                <SummaryCard 
                    title="Weight & BMI" 
                    value={summary?.currentWeight ? `${summary.currentWeight.weight}` : undefined}
                    unit={summary?.currentWeight?.unit}
                    subValue={summary?.currentBMI ? `BMI: ${summary.currentBMI.toFixed(1)} ${summary?.weightGoal?.targetWeight ? `(Goal: ${summary.weightGoal.targetWeight} ${summary.weightGoal.targetWeightUnit})` : ''}`: undefined }
                    action={() => onLogAction('weight_bmi')} actionLabel="Log Weight"
                />
                 <SummaryCard 
                    title="Activity" 
                    value={summary?.todayActivityProgress ? `${summary.todayActivityProgress.logged}`: undefined}
                    unit={summary?.todayActivityProgress?.unit}
                    subValue={summary?.todayActivityProgress?.goal ? `Goal: ${summary.todayActivityProgress.goal} ${summary.todayActivityProgress.unit}` : 'Set a goal!'}
                    action={() => onLogAction('activity')} actionLabel="Log Activity"
                />
                <SummaryCard 
                    title="Hydration" 
                    value={summary?.todayHydrationProgress ? `${summary.todayHydrationProgress.logged}` : undefined}
                    unit={summary?.todayHydrationProgress?.unit}
                    subValue={summary?.todayHydrationProgress?.goal ? `Goal: ${summary.todayHydrationProgress.goal} ${summary.todayHydrationProgress.unit}`: 'Set a goal!'}
                    action={() => onLogAction('hydration')} actionLabel="Log Water"
                />
                <SummaryCard 
                    title="Last Mood" 
                    value={summary?.lastMood?.selectedMoods?.join(', ') || (summary?.lastMood?.moodRating ? `${summary.lastMood.moodRating}/5` : undefined)}
                    subValue={summary?.lastMood ? `On ${new Date(summary.lastMood.date).toLocaleDateString()}${summary.lastMood.journal ? ': ' + summary.lastMood.journal.substring(0,30)+'...' : ''}` : undefined}
                    action={() => onLogAction('mood')} actionLabel="Log Mood"
                />
            </div>
             <p className="text-sm text-textSecondary text-center mt-4">This dashboard shows your latest entries. Visit individual tabs for detailed logs and more options.</p>
        </div>
    );
};


// --- Vitals Tab ---
const VitalsView: React.FC<{userId: string}> = ({userId}) => {
    const [vitals, setVitals] = useState<VitalLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentVitalType, setCurrentVitalType] = useState<'BP' | 'HR' | 'Glucose' | 'Temp' | 'SpO2' | null>(null);
    
    const [bpData, setBpData] = useState<Partial<BloodPressureReading>>({});
    const [hrData, setHrData] = useState<Partial<HeartRateReading>>({});
    const [glucoseData, setGlucoseData] = useState<Partial<BloodGlucoseReading>>({unit: 'mg/dL', readingContext: 'Fasting'});
    const [tempData, setTempData] = useState<Partial<TemperatureReading>>({unit: 'Celsius'});
    const [spo2Data, setSpo2Data] = useState<Partial<OxygenSaturationReading>>({});

    useEffect(() => {
        if (!userId) return;
        setIsLoading(true);
        wellnessService.getVitals(userId)
            .then(data => setVitals(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || (b.time && a.time ? b.time.localeCompare(a.time) : 0))))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [userId]);

    const openModal = (type: 'BP' | 'HR' | 'Glucose' | 'Temp' | 'SpO2') => {
        setCurrentVitalType(type);
        const commonFields = { date: formatDate(new Date()), time: formatTime(new Date()) };
        if (type === 'BP') setBpData(commonFields);
        if (type === 'HR') setHrData(commonFields);
        if (type === 'Glucose') setGlucoseData({...commonFields, unit: 'mg/dL', readingContext: 'Fasting'});
        if (type === 'Temp') setTempData({...commonFields, unit: 'Celsius'});
        if (type === 'SpO2') setSpo2Data(commonFields);
        setShowModal(true);
    };

    const handleSaveVital = async () => {
        if (!userId) return;
        let newVitalLog: VitalLog | null = null;
        const base = { id: Date.now().toString(), notes: (bpData.notes || hrData.notes || glucoseData.notes || tempData.notes || spo2Data.notes), familyMemberId: userId };

        switch (currentVitalType) {
            case 'BP':
                if (!bpData.date || !bpData.time || !bpData.systolic || !bpData.diastolic) { alert("Date, Time, Systolic and Diastolic are required."); return; }
                newVitalLog = { ...base, ...bpData, type: 'BloodPressure' } as BloodPressureReading;
                break;
            case 'HR':
                 if (!hrData.date || !hrData.time || !hrData.value) { alert("Date, Time, and Heart rate value are required."); return; }
                newVitalLog = { ...base, ...hrData, type: 'HeartRate' } as HeartRateReading;
                break;
            case 'Glucose':
                if (!glucoseData.date || !glucoseData.time || !glucoseData.level) { alert("Date, Time, and Glucose level are required."); return; }
                newVitalLog = { ...base, ...glucoseData, type: 'BloodGlucose' } as BloodGlucoseReading;
                break;
            case 'Temp':
                 if (!tempData.date || !tempData.time || !tempData.value) { alert("Date, Time, and Temperature value are required."); return; }
                newVitalLog = { ...base, ...tempData, type: 'Temperature' } as TemperatureReading;
                break;
            case 'SpO2':
                 if (!spo2Data.date || !spo2Data.time || !spo2Data.value) { alert("Date, Time, and SpO2 value are required."); return; }
                newVitalLog = { ...base, ...spo2Data, type: 'OxygenSaturation' } as OxygenSaturationReading;
                break;
        }

        if (newVitalLog) {
            const updatedVitals = [newVitalLog, ...vitals].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || (b.time && a.time ? b.time.localeCompare(a.time) : 0) );
            await wellnessService.saveVitals(userId, updatedVitals);
            setVitals(updatedVitals);
            awardPoints(userId, ActivityTypeForGamification.LOG_VITALS_WELLNESS, `Logged ${currentVitalType}`);
            incrementLogCount(userId, ActivityTypeForGamification.LOG_VITALS_WELLNESS);
            checkAndAwardBadges(userId, ActivityTypeForGamification.LOG_VITALS_WELLNESS);
        }
        setShowModal(false);
        setCurrentVitalType(null);
    };
    
    const handleDeleteVital = async (id: string) => {
      if(window.confirm("Delete this vital log?")) {
          const updatedVitals = vitals.filter(v => v.id !== id);
          await wellnessService.saveVitals(userId, updatedVitals);
          setVitals(updatedVitals);
      }
    };
    
    const getBPStatus = (s: number, d: number) => {
        if (s > 140 || d > 90) return 'text-red-600'; if (s < 90 || d < 60) return 'text-blue-600'; return 'text-green-600';
    };

    const renderVital = (vital: VitalLog) => {
      let content = '';
      let statusClass = 'text-textPrimary';
      switch(vital.type) {
        case 'BloodPressure': 
            content = `${vital.systolic}/${vital.diastolic} mmHg ${vital.pulse ? `(Pulse: ${vital.pulse} bpm)` : ''}`;
            statusClass = getBPStatus(vital.systolic, vital.diastolic);
            break;
        case 'HeartRate': content = `${vital.value} bpm`; break;
        case 'BloodGlucose': content = `${vital.level} ${vital.unit} (${vital.readingContext})`; break;
        case 'Temperature': content = `${vital.value} °${vital.unit[0]}`; break;
        case 'OxygenSaturation': content = `${vital.value}% SpO2`; break;
      }
      return <span className={statusClass}>{content}</span>;
    }

    if (isLoading) return <p className="text-center text-textSecondary">Loading vitals...</p>;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                <button onClick={() => openModal('BP')} className="btn-add-vital"><PlusIcon className="w-4 h-4 mr-1"/>Log BP</button>
                <button onClick={() => openModal('HR')} className="btn-add-vital"><PlusIcon className="w-4 h-4 mr-1"/>Log Heart Rate</button>
                <button onClick={() => openModal('Glucose')} className="btn-add-vital"><PlusIcon className="w-4 h-4 mr-1"/>Log Glucose</button>
                <button onClick={() => openModal('Temp')} className="btn-add-vital"><PlusIcon className="w-4 h-4 mr-1"/>Log Temperature</button>
                <button onClick={() => openModal('SpO2')} className="btn-add-vital"><PlusIcon className="w-4 h-4 mr-1"/>Log SpO2</button>
            </div>
            {vitals.length === 0 && <p className="text-textSecondary text-center py-4">No vitals logged yet.</p>}
            <ul className="space-y-3 max-h-[60vh] overflow-y-auto">
                {vitals.map(v => (
                    <li key={v.id} className="p-3 bg-slate-50 rounded-md shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold">{v.type} - {new Date(v.date).toLocaleDateString()} {v.time}</p>
                                <p className="text-md mt-1">{renderVital(v)}</p>
                                {v.notes && <p className="text-xs text-textSecondary mt-1">Notes: {v.notes}</p>}
                            </div>
                            <button onClick={() => handleDeleteVital(v.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    </li>
                ))}
            </ul>
             <p className="text-xs text-center text-slate-400 mt-4">Trend charts and more detailed insights coming soon.</p>

            <AppModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                title={`Log ${currentVitalType}`} 
                primaryActionText="Save"
                onPrimaryAction={handleSaveVital}
            >
                <div className="space-y-4">
                {currentVitalType === 'BP' && (<>
                    <DateTimeInputGroup
                        dateId="vitalDateBP" timeId="vitalTimeBP"
                        dateValue={bpData.date || ''} timeValue={bpData.time || ''}
                        onDateChange={value => setBpData(p => ({...p, date: value}))}
                        onTimeChange={value => setBpData(p => ({...p, time: value}))}
                        required
                    />
                    <div className="flex gap-2">
                        <input type="number" placeholder="Systolic (mmHg)" value={bpData.systolic || ''} onChange={e => setBpData(p => ({...p, systolic: parseInt(e.target.value)}))} className="form-input-wellness" required/>
                        <input type="number" placeholder="Diastolic (mmHg)" value={bpData.diastolic || ''} onChange={e => setBpData(p => ({...p, diastolic: parseInt(e.target.value)}))} className="form-input-wellness" required/>
                    </div>
                    <input type="number" placeholder="Pulse (bpm, optional)" value={bpData.pulse || ''} onChange={e => setBpData(p => ({...p, pulse: parseInt(e.target.value)}))} className="form-input-wellness"/>
                    <textarea placeholder="Notes (optional)" value={bpData.notes || ''} onChange={e => setBpData(p => ({...p, notes: e.target.value}))} className="form-input-wellness" rows={2}/>
                </>)}
                {currentVitalType === 'HR' && (<>
                    <DateTimeInputGroup
                        dateId="vitalDateHR" timeId="vitalTimeHR"
                        dateValue={hrData.date || ''} timeValue={hrData.time || ''}
                        onDateChange={value => setHrData(p => ({...p, date: value}))}
                        onTimeChange={value => setHrData(p => ({...p, time: value}))}
                        required
                    />
                    <input type="number" placeholder="Heart Rate (bpm)" value={hrData.value || ''} onChange={e => setHrData(p => ({...p, value: parseInt(e.target.value)}))} className="form-input-wellness" required/>
                    <textarea placeholder="Notes (optional)" value={hrData.notes || ''} onChange={e => setHrData(p => ({...p, notes: e.target.value}))} className="form-input-wellness" rows={2}/>
                </>)}
                {currentVitalType === 'Glucose' && (<>
                     <DateTimeInputGroup
                        dateId="vitalDateGlucose" timeId="vitalTimeGlucose"
                        dateValue={glucoseData.date || ''} timeValue={glucoseData.time || ''}
                        onDateChange={value => setGlucoseData(p => ({...p, date: value}))}
                        onTimeChange={value => setGlucoseData(p => ({...p, time: value}))}
                        required
                    />
                    <input type="number" placeholder="Glucose Level" value={glucoseData.level || ''} onChange={e => setGlucoseData(p => ({...p, level: parseFloat(e.target.value)}))} className="form-input-wellness" required/>
                    <div className="flex gap-2">
                        <select value={glucoseData.unit} onChange={e => setGlucoseData(p => ({...p, unit: e.target.value as 'mg/dL' | 'mmol/L'}))} className="form-input-wellness">
                            <option value="mg/dL">mg/dL</option><option value="mmol/L">mmol/L</option>
                        </select>
                        <select value={glucoseData.readingContext} onChange={e => setGlucoseData(p => ({...p, readingContext: e.target.value as any}))} className="form-input-wellness">
                            {['Fasting', 'Post-Meal', 'Random', 'Before Meal', 'After Meal'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                     <textarea placeholder="Notes (optional)" value={glucoseData.notes || ''} onChange={e => setGlucoseData(p => ({...p, notes: e.target.value}))} className="form-input-wellness" rows={2}/>
                </>)}
                {currentVitalType === 'Temp' && (<>
                    <DateTimeInputGroup
                        dateId="vitalDateTemp" timeId="vitalTimeTemp"
                        dateValue={tempData.date || ''} timeValue={tempData.time || ''}
                        onDateChange={value => setTempData(p => ({...p, date: value}))}
                        onTimeChange={value => setTempData(p => ({...p, time: value}))}
                        required
                    />
                    <div className="flex gap-2">
                        <input type="number" step="0.1" placeholder="Temperature" value={tempData.value || ''} onChange={e => setTempData(p => ({...p, value: parseFloat(e.target.value)}))} className="form-input-wellness" required/>
                        <select value={tempData.unit} onChange={e => setTempData(p => ({...p, unit: e.target.value as 'Celsius' | 'Fahrenheit'}))} className="form-input-wellness">
                            <option value="Celsius">°C</option><option value="Fahrenheit">°F</option>
                        </select>
                    </div>
                     <textarea placeholder="Notes (optional)" value={tempData.notes || ''} onChange={e => setTempData(p => ({...p, notes: e.target.value}))} className="form-input-wellness" rows={2}/>
                </>)}
                {currentVitalType === 'SpO2' && (<>
                     <DateTimeInputGroup
                        dateId="vitalDateSpO2" timeId="vitalTimeSpO2"
                        dateValue={spo2Data.date || ''} timeValue={spo2Data.time || ''}
                        onDateChange={value => setSpo2Data(p => ({...p, date: value}))}
                        onTimeChange={value => setSpo2Data(p => ({...p, time: value}))}
                        required
                    />
                    <input type="number" placeholder="SpO2 (%)" value={spo2Data.value || ''} min="0" max="100" onChange={e => setSpo2Data(p => ({...p, value: parseInt(e.target.value)}))} className="form-input-wellness" required/>
                    <textarea placeholder="Notes (optional)" value={spo2Data.notes || ''} onChange={e => setSpo2Data(p => ({...p, notes: e.target.value}))} className="form-input-wellness" rows={2}/>
                </>)}
                </div>
            </AppModal>
        </div>
    );
};

// --- Weight & BMI Tab ---
const WeightBmiView: React.FC<{userId: string, userHeightCm?: number}> = ({userId, userHeightCm}) => {
    const defaultHeight = userHeightCm || MOCK_USER_FOR_WELLNESS.heightCm;

    const [weightLogs, setWeightLogs] = useState<WeightLogEntry[]>([]);
    const [bmiRecords, setBmiRecords] = useState<BMIRecord[]>([]);
    const [weightGoal, setWeightGoal] = useState<WeightGoal>({ heightUnitForBMI: 'cm', currentHeightForBMI: defaultHeight});
    const [isLoading, setIsLoading] = useState(true);
    
    const [showLogModal, setShowLogModal] = useState(false);
    const [logFormData, setLogFormData] = useState<Partial<WeightLogEntry>>({date: formatDate(new Date()), unit:'kg'});

    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalFormData, setGoalFormData] = useState<WeightGoal>(weightGoal);

    useEffect(() => {
        if(!userId) return;
        setIsLoading(true);
        Promise.all([
            wellnessService.getWeightLogs(userId),
            wellnessService.getBmiRecords(userId),
            wellnessService.getWeightGoal(userId, { heightUnitForBMI: 'cm', currentHeightForBMI: defaultHeight})
        ]).then(([wl, br, wg]) => {
            setWeightLogs(wl.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setBmiRecords(br.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setWeightGoal(wg);
            setGoalFormData(wg); // Initialize goal form with fetched data
        }).catch(console.error)
          .finally(() => setIsLoading(false));
    }, [userId, defaultHeight]);


    const calculateBmi = (weight: number, weightUnit: 'kg'|'lbs', height: number, heightUnit: 'cm'|'inches'): number | null => {
        if (!height || height <=0) return null;
        const weightInKg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
        const heightInM = heightUnit === 'inches' ? height * 0.0254 : height / 100;
        if (heightInM <=0 || weightInKg <=0) return null;
        return weightInKg / (heightInM * heightInM);
    };

    const handleSaveLog = async () => {
        if (!logFormData.weight || logFormData.weight <= 0 || !logFormData.date) { alert("Please enter a valid date and weight."); return; }
        const newLog: WeightLogEntry = {
            id: Date.now().toString(),
            date: logFormData.date,
            weight: logFormData.weight,
            unit: logFormData.unit || 'kg',
            notes: logFormData.notes,
            familyMemberId: userId
        };
        const updatedWeightLogs = [newLog, ...weightLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        await wellnessService.saveWeightLogs(userId, updatedWeightLogs);
        setWeightLogs(updatedWeightLogs);
        
        const currentHeight = weightGoal.currentHeightForBMI || defaultHeight;
        const currentHeightUnit = weightGoal.heightUnitForBMI || 'cm';
        let updatedBmiRecords = [...bmiRecords];

        if (currentHeight && currentHeight > 0) {
            const bmiVal = calculateBmi(newLog.weight, newLog.unit, currentHeight, currentHeightUnit);
            if (bmiVal !== null) {
                const newBmiRecord: BMIRecord = {
                    id: Date.now().toString(), // Ensure unique ID
                    date: newLog.date,
                    weight: newLog.weight,
                    weightUnit: newLog.unit,
                    height: currentHeight,
                    heightUnit: currentHeightUnit,
                    bmi: bmiVal,
                    familyMemberId: userId
                };
                updatedBmiRecords = [newBmiRecord, ...bmiRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                await wellnessService.saveBmiRecords(userId, updatedBmiRecords);
                setBmiRecords(updatedBmiRecords);
            }
        }
        setShowLogModal(false);
    };
    
    const handleSaveGoal = async () => {
        await wellnessService.saveWeightGoal(userId, goalFormData);
        setWeightGoal(goalFormData);
        setShowGoalModal(false);

        const latestWeightLog = weightLogs[0];
        if (latestWeightLog && goalFormData.currentHeightForBMI && goalFormData.currentHeightForBMI > 0) {
            const bmiVal = calculateBmi(latestWeightLog.weight, latestWeightLog.unit, goalFormData.currentHeightForBMI, goalFormData.heightUnitForBMI || 'cm');
            if (bmiVal !== null) {
                 const newBmiRecord: BMIRecord = {
                    id: `bmi_${latestWeightLog.id}`, 
                    date: latestWeightLog.date,
                    weight: latestWeightLog.weight,
                    weightUnit: latestWeightLog.unit,
                    height: goalFormData.currentHeightForBMI,
                    heightUnit: goalFormData.heightUnitForBMI || 'cm',
                    bmi: bmiVal,
                    familyMemberId: userId
                };
                const updatedBmiRecords = (() => {
                    const existing = bmiRecords.find(b => b.date === newBmiRecord.date);
                    if(existing) return bmiRecords.map(b => b.id === existing.id ? newBmiRecord : b);
                    return [newBmiRecord, ...bmiRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                })();
                await wellnessService.saveBmiRecords(userId, updatedBmiRecords);
                setBmiRecords(updatedBmiRecords);
            }
        }
    };
    
    const handleDeleteWeightLog = async (id: string) => {
        if(window.confirm("Delete this weight log? Corresponding BMI record might also be affected.")) {
            const updatedWeightLogs = weightLogs.filter(w => w.id !== id);
            await wellnessService.saveWeightLogs(userId, updatedWeightLogs);
            setWeightLogs(updatedWeightLogs);

            const updatedBmiRecords = bmiRecords.filter(b => !b.id.includes(id)); 
            await wellnessService.saveBmiRecords(userId, updatedBmiRecords);
            setBmiRecords(updatedBmiRecords);
        }
    };


    const latestBmi = bmiRecords[0];
    const weightProgress = useMemo(() => {
        if (!weightGoal.targetWeight || weightLogs.length === 0) return null;
        const currentW = weightLogs[0].unit === weightGoal.targetWeightUnit ? weightLogs[0].weight : 
                        (weightLogs[0].unit === 'kg' && weightGoal.targetWeightUnit === 'lbs' ? weightLogs[0].weight * 2.20462 : weightLogs[0].weight / 2.20462);
        const diff = currentW - weightGoal.targetWeight;
        return { diff: diff.toFixed(1), unit: weightGoal.targetWeightUnit };
    }, [weightGoal, weightLogs]);

    if (isLoading) return <p className="text-center text-textSecondary">Loading weight & BMI data...</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-textPrimary">Weight & BMI</h3>
                <div className="flex gap-2">
                    <button onClick={() => { setLogFormData({date: formatDate(new Date()), unit: weightGoal.targetWeightUnit || 'kg'}); setShowLogModal(true);}} className="btn-add-wellness"><PlusIcon className="w-4 h-4 mr-1"/>Log Weight</button>
                    <button onClick={() => { setGoalFormData(weightGoal); setShowGoalModal(true);}} className="btn-edit-wellness"><EditIcon className="w-4 h-4 mr-1"/>Set Goal/Height</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-100 rounded-lg">
                    <h4 className="font-semibold">Current Weight</h4>
                    {weightLogs.length > 0 ? <p className="text-2xl">{weightLogs[0].weight.toFixed(1)} {weightLogs[0].unit}</p> : <p>No data</p>}
                    <p className="text-xs text-textSecondary">{weightLogs.length > 0 ? `Logged on ${new Date(weightLogs[0].date).toLocaleDateString()}` : ''}</p>
                </div>
                <div className="p-4 bg-slate-100 rounded-lg">
                    <h4 className="font-semibold">Current BMI</h4>
                    {latestBmi ? <p className="text-2xl">{latestBmi.bmi.toFixed(1)}</p> : <p>No data (Set height to calculate)</p>}
                     <p className="text-xs text-textSecondary">{latestBmi ? `Calculated on ${new Date(latestBmi.date).toLocaleDateString()}` : ''}</p>
                </div>
                {weightGoal.targetWeight && (
                     <div className="p-4 bg-primary-light text-primary-dark rounded-lg md:col-span-2">
                        <h4 className="font-semibold">Weight Goal: {weightGoal.targetWeight} {weightGoal.targetWeightUnit}</h4>
                        {weightProgress && <p>You are {Math.abs(parseFloat(weightProgress.diff))} {weightProgress.unit} {parseFloat(weightProgress.diff) > 0 ? 'above' : 'below'} your goal.</p>}
                     </div>
                )}
            </div>
            
            <h4 className="text-md font-semibold mt-4">Weight Log History</h4>
            {weightLogs.length === 0 && <p className="text-textSecondary text-center py-2">No weight logged.</p>}
            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {weightLogs.map(log => (
                    <li key={log.id} className="p-2 bg-slate-50 rounded flex justify-between items-center">
                        <span>{new Date(log.date).toLocaleDateString()}: {log.weight.toFixed(1)} {log.unit} {log.notes && `(${log.notes})`} {bmiRecords.find(b=>b.date === log.date) ? `(BMI: ${bmiRecords.find(b=>b.date === log.date)!.bmi.toFixed(1)})` : ''}</span>
                        <button onClick={() => handleDeleteWeightLog(log.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                    </li>
                ))}
            </ul>

            <AppModal 
                isOpen={showLogModal} 
                onClose={() => setShowLogModal(false)} 
                title="Log Weight" 
                primaryActionText="Save Log"
                onPrimaryAction={handleSaveLog}
            >
                <div className="space-y-4">
                <div>
                    <label htmlFor="weightLogDate" className="form-label-wellness">Date<span className="text-red-500">*</span></label>
                    <input type="date" id="weightLogDate" value={logFormData.date || ''} onChange={e => setLogFormData(p => ({...p, date: e.target.value}))} className="form-input-wellness" required/>
                </div>
                <div className="flex gap-2">
                    <input type="number" step="0.1" placeholder="Weight" value={logFormData.weight || ''} onChange={e => setLogFormData(p => ({...p, weight: parseFloat(e.target.value)}))} className="form-input-wellness" required/>
                    <select value={logFormData.unit} onChange={e => setLogFormData(p => ({...p, unit: e.target.value as 'kg'|'lbs'}))} className="form-input-wellness">
                        <option value="kg">kg</option><option value="lbs">lbs</option>
                    </select>
                </div>
                <textarea placeholder="Notes (optional)" value={logFormData.notes || ''} onChange={e => setLogFormData(p => ({...p, notes: e.target.value}))} className="form-input-wellness" rows={2}/>
                </div>
            </AppModal>

            <AppModal 
                isOpen={showGoalModal} 
                onClose={() => setShowGoalModal(false)} 
                title="Set Weight Goal & Height" 
                primaryActionText="Save Goal"
                onPrimaryAction={handleSaveGoal}
            >
                <div className="space-y-4">
                <label className="form-label-wellness">Your Current Height (for BMI)</label>
                 <div className="flex gap-2">
                    <input type="number" placeholder="Height" value={goalFormData.currentHeightForBMI || ''} onChange={e => setGoalFormData(p => ({...p, currentHeightForBMI: parseFloat(e.target.value)}))} className="form-input-wellness"/>
                    <select value={goalFormData.heightUnitForBMI} onChange={e => setGoalFormData(p => ({...p, heightUnitForBMI: e.target.value as 'cm'|'inches'}))} className="form-input-wellness">
                        <option value="cm">cm</option><option value="inches">inches</option>
                    </select>
                </div>
                <label className="form-label-wellness mt-3">Target Weight (Optional)</label>
                <div className="flex gap-2">
                    <input type="number" step="0.1" placeholder="Target Weight" value={goalFormData.targetWeight || ''} onChange={e => setGoalFormData(p => ({...p, targetWeight: parseFloat(e.target.value)}))} className="form-input-wellness"/>
                    <select value={goalFormData.targetWeightUnit} onChange={e => setGoalFormData(p => ({...p, targetWeightUnit: e.target.value as 'kg'|'lbs'}))} className="form-input-wellness">
                        <option value="kg">kg</option><option value="lbs">lbs</option>
                    </select>
                </div>
                </div>
            </AppModal>
            <p className="text-xs text-center text-slate-400 mt-4">Weight and BMI trend charts coming soon.</p>
        </div>
    );
};


// --- Activity Tab ---
const ActivityView: React.FC<{userId: string}> = ({userId}) => {
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [activityGoal, setActivityGoal] = useState<ActivityGoal>({ type: 'daily', steps: 10000 });
    const [isLoading, setIsLoading] = useState(true);
    
    const [showLogModal, setShowLogModal] = useState(false);
    const [logFormData, setLogFormData] = useState<Partial<ActivityLog>>({ date: formatDate(new Date()), activityType: ACTIVITY_TYPES[0], durationMinutes: 30 });

    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalFormData, setGoalFormData] = useState<ActivityGoal>(activityGoal);

    useEffect(() => {
        if(!userId) return;
        setIsLoading(true);
        Promise.all([
            wellnessService.getActivityLogs(userId),
            wellnessService.getActivityGoal(userId, { type: 'daily', steps: 10000 })
        ]).then(([logs, goal]) => {
            setActivityLogs(logs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setActivityGoal(goal);
            setGoalFormData(goal);
        }).catch(console.error)
          .finally(() => setIsLoading(false));
    }, [userId]);


    const handleSaveLog = async () => {
        if (!logFormData.date || !logFormData.activityType || (logFormData.activityType === 'Other' && !logFormData.customActivityType) || !logFormData.durationMinutes || logFormData.durationMinutes <=0) {
            alert("Please fill date, activity type and duration correctly."); return;
        }
        const newLog: ActivityLog = {
            id: Date.now().toString(),
            date: logFormData.date,
            activityType: logFormData.activityType,
            customActivityType: logFormData.activityType === 'Other' ? logFormData.customActivityType : undefined,
            durationMinutes: logFormData.durationMinutes,
            effortLevel: logFormData.effortLevel,
            steps: logFormData.steps,
            notes: logFormData.notes,
            familyMemberId: userId
        };
        const updatedLogs = [newLog, ...activityLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        await wellnessService.saveActivityLogs(userId, updatedLogs);
        setActivityLogs(updatedLogs);
        setShowLogModal(false);
    };

    const handleSaveGoal = async () => {
        await wellnessService.saveActivityGoal(userId, goalFormData);
        setActivityGoal(goalFormData);
        setShowGoalModal(false);
    };
    
    const handleDeleteActivity = async (id: string) => {
        if (window.confirm("Delete this activity log?")) {
            const updatedLogs = activityLogs.filter(a => a.id !== id);
            await wellnessService.saveActivityLogs(userId, updatedLogs);
            setActivityLogs(updatedLogs);
        }
    };
    
    const today = formatDate(new Date());
    const todaysActivityDuration = activityLogs.filter(a=>a.date === today).reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
    const todaysSteps = activityLogs.filter(a=>a.date === today).reduce((sum, a) => sum + (a.steps || 0), 0);

    if (isLoading) return <p className="text-center text-textSecondary">Loading activity data...</p>;

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-textPrimary">Activity Tracker</h3>
                <div className="flex gap-2">
                    <button onClick={() => {setLogFormData({date: formatDate(new Date()), activityType: ACTIVITY_TYPES[0], durationMinutes: 30}); setShowLogModal(true);}} className="btn-add-wellness"><PlusIcon className="w-4 h-4 mr-1"/>Log Activity</button>
                    <button onClick={() => {setGoalFormData(activityGoal); setShowGoalModal(true);}} className="btn-edit-wellness"><EditIcon className="w-4 h-4 mr-1"/>Set Goal</button>
                </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-lg">
                <h4 className="font-semibold">Today's Summary</h4>
                <p>Duration: {todaysActivityDuration} minutes {activityGoal.durationMinutes ? `/ ${activityGoal.durationMinutes} min goal` : ''}</p>
                <p>Steps: {todaysSteps} steps {activityGoal.steps ? `/ ${activityGoal.steps} steps goal` : ''}</p>
            </div>

            <h4 className="text-md font-semibold mt-4">Activity Log History</h4>
            {activityLogs.length === 0 && <p className="text-textSecondary text-center py-2">No activities logged.</p>}
            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {activityLogs.map(log => (
                    <li key={log.id} className="p-2 bg-slate-50 rounded flex justify-between items-center">
                        <div>
                            <p>{new Date(log.date).toLocaleDateString()}: {log.activityType === 'Other' ? log.customActivityType : log.activityType} - {log.durationMinutes} min</p>
                            <p className="text-xs text-textSecondary">
                                {log.effortLevel && `Effort: ${log.effortLevel} `}
                                {log.steps && `Steps: ${log.steps} `}
                                {log.notes && `Notes: ${log.notes}`}
                            </p>
                        </div>
                        <button onClick={() => handleDeleteActivity(log.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                    </li>
                ))}
            </ul>
             <p className="text-xs text-center text-slate-400 mt-2">Wearable integration for automatic tracking coming soon.</p>

            <AppModal 
                isOpen={showLogModal} 
                onClose={() => setShowLogModal(false)} 
                title="Log Activity" 
                primaryActionText="Save Log"
                onPrimaryAction={handleSaveLog}
            >
                <div className="space-y-4">
                <div>
                    <label htmlFor="activityLogDate" className="form-label-wellness">Date<span className="text-red-500">*</span></label>
                    <input type="date" id="activityLogDate" value={logFormData.date || ''} onChange={e => setLogFormData(p => ({...p, date: e.target.value}))} className="form-input-wellness" required/>
                </div>
                <select value={logFormData.activityType} onChange={e => setLogFormData(p => ({...p, activityType: e.target.value}))} className="form-input-wellness" required>
                    {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {logFormData.activityType === 'Other' && <input type="text" placeholder="Specify Activity" value={logFormData.customActivityType || ''} onChange={e => setLogFormData(p => ({...p, customActivityType: e.target.value}))} className="form-input-wellness" required/>}
                <input type="number" placeholder="Duration (minutes)" value={logFormData.durationMinutes || ''} onChange={e => setLogFormData(p => ({...p, durationMinutes: parseInt(e.target.value)}))} className="form-input-wellness" required/>
                <select value={logFormData.effortLevel || ''} onChange={e => setLogFormData(p => ({...p, effortLevel: e.target.value as any}))} className="form-input-wellness">
                    <option value="">Effort Level (Optional)</option>
                    {ACTIVITY_EFFORT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <input type="number" placeholder="Steps (Optional)" value={logFormData.steps || ''} onChange={e => setLogFormData(p => ({...p, steps: parseInt(e.target.value)}))} className="form-input-wellness"/>
                <textarea placeholder="Notes (optional)" value={logFormData.notes || ''} onChange={e => setLogFormData(p => ({...p, notes: e.target.value}))} className="form-input-wellness" rows={2}/>
                </div>
            </AppModal>

            <AppModal 
                isOpen={showGoalModal} 
                onClose={() => setShowGoalModal(false)} 
                title="Set Activity Goal"
                primaryActionText="Save Goal"
                onPrimaryAction={handleSaveGoal}
            >
                <div className="space-y-4">
                <select value={goalFormData.type} onChange={e => setGoalFormData(p => ({...p, type: e.target.value as 'daily'|'weekly'}))} className="form-input-wellness">
                    <option value="daily">Daily Goal</option><option value="weekly">Weekly Goal</option>
                </select>
                <input type="number" placeholder="Target Steps (e.g., 10000)" value={goalFormData.steps || ''} onChange={e => setGoalFormData(p => ({...p, steps: parseInt(e.target.value) || undefined }))} className="form-input-wellness"/>
                <input type="number" placeholder="Target Duration (minutes, e.g., 30)" value={goalFormData.durationMinutes || ''} onChange={e => setGoalFormData(p => ({...p, durationMinutes: parseInt(e.target.value) || undefined}))} className="form-input-wellness"/>
                </div>
            </AppModal>
        </div>
    );
};


// --- Sleep Tab ---
const SleepView: React.FC<{userId: string}> = ({userId}) => {
    const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<SleepLog>>({ date: formatDate(new Date()), bedTime: '22:00', wakeTime: '06:00'});

     useEffect(() => {
        if(!userId) return;
        setIsLoading(true);
        wellnessService.getSleepLogs(userId)
            .then(data => setSleepLogs(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [userId]);


    const calculateDuration = (bedTimeStr?: string, wakeTimeStr?: string): number | undefined => {
        if (!bedTimeStr || !wakeTimeStr) return undefined;
        const bed = new Date(`1970-01-01T${bedTimeStr}:00`);
        let wake = new Date(`1970-01-01T${wakeTimeStr}:00`);
        if (wake <= bed) wake = new Date(`1970-01-02T${wakeTimeStr}:00`); // Next day
        return (wake.getTime() - bed.getTime()) / (1000 * 60 * 60);
    };

    const handleSave = async () => {
        if (!formData.date || !formData.bedTime || !formData.wakeTime) { alert("Date, Bed time and wake time are required."); return; }
        const durationHours = calculateDuration(formData.bedTime, formData.wakeTime);
        const newLog: SleepLog = {
            id: Date.now().toString(),
            date: formData.date,
            bedTime: formData.bedTime,
            wakeTime: formData.wakeTime,
            durationHours: durationHours,
            quality: formData.quality,
            notes: formData.notes,
            familyMemberId: userId
        };
        const updatedLogs = [newLog, ...sleepLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        await wellnessService.saveSleepLogs(userId, updatedLogs);
        setSleepLogs(updatedLogs);
        setShowModal(false);
    };
    
    const handleDeleteSleepLog = async (id: string) => {
        if (window.confirm("Delete this sleep log?")) {
            const updatedLogs = sleepLogs.filter(s => s.id !== id);
            await wellnessService.saveSleepLogs(userId, updatedLogs);
            setSleepLogs(updatedLogs);
        }
    };

    if (isLoading) return <p className="text-center text-textSecondary">Loading sleep data...</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-textPrimary">Sleep Tracker</h3>
                <button onClick={() => {setFormData({date:formatDate(new Date()), bedTime:'22:00', wakeTime:'06:00'}); setShowModal(true);}} className="btn-add-wellness"><PlusIcon className="w-4 h-4 mr-1"/>Log Sleep</button>
            </div>
            {sleepLogs.length === 0 && <p className="text-textSecondary text-center py-2">No sleep logged.</p>}
            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {sleepLogs.map(log => (
                    <li key={log.id} className="p-2 bg-slate-50 rounded flex justify-between items-center">
                        <div>
                            <p>{new Date(log.date).toLocaleDateString()}: {log.bedTime} - {log.wakeTime} ({log.durationHours?.toFixed(1) || 'N/A'} hrs)</p>
                            <p className="text-xs text-textSecondary">
                                {log.quality && `Quality: ${log.quality} `}
                                {log.notes && `Notes: ${log.notes}`}
                            </p>
                        </div>
                        <button onClick={() => handleDeleteSleepLog(log.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                    </li>
                ))}
            </ul>
             <p className="text-xs text-center text-slate-400 mt-2">Sleep pattern charts and insights coming soon.</p>

            <AppModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                title="Log Sleep" 
                primaryActionText="Save Log"
                onPrimaryAction={handleSave}
            >
                <div className="space-y-4">
                <div>
                    <label htmlFor="sleepLogDate" className="form-label-wellness">Date<span className="text-red-500">*</span></label>
                    <input type="date" id="sleepLogDate" value={formData.date || ''} onChange={e => setFormData(p => ({...p, date: e.target.value}))} className="form-input-wellness" required/>
                </div>
                <div className="flex gap-2">
                  <div>
                    <label htmlFor="sleepLogBedTime" className="form-label-wellness">Bed Time<span className="text-red-500">*</span></label>
                    <input type="time" id="sleepLogBedTime" value={formData.bedTime || ''} onChange={e => setFormData(p => ({...p, bedTime: e.target.value}))} className="form-input-wellness" required/>
                  </div>
                  <div>
                    <label htmlFor="sleepLogWakeTime" className="form-label-wellness">Wake Time<span className="text-red-500">*</span></label>
                    <input type="time" id="sleepLogWakeTime" value={formData.wakeTime || ''} onChange={e => setFormData(p => ({...p, wakeTime: e.target.value}))} className="form-input-wellness" required/>
                  </div>
                </div>
                <select value={formData.quality || ''} onChange={e => setFormData(p => ({...p, quality: e.target.value as any}))} className="form-input-wellness">
                    <option value="">Sleep Quality (Optional)</option>
                    {SLEEP_QUALITY_RATINGS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <textarea placeholder="Notes (optional)" value={formData.notes || ''} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} className="form-input-wellness" rows={2}/>
                </div>
            </AppModal>
        </div>
    );
};

// --- Hydration Tab ---
const HydrationView: React.FC<{userId: string}> = ({userId}) => {
    const [hydrationLogs, setHydrationLogs] = useState<HydrationLog[]>([]);
    const [hydrationGoal, setHydrationGoal] = useState<HydrationGoal>({targetAmount: 2000, targetUnit: 'ml'});
    const [isLoading, setIsLoading] = useState(true);
    
    const [showLogModal, setShowLogModal] = useState(false);
    const [logFormData, setLogFormData] = useState<Partial<HydrationLog>>({ date: formatDate(new Date()), unit: 'ml', amount: 250 });

    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalFormData, setGoalFormData] = useState<HydrationGoal>(hydrationGoal);

    useEffect(() => {
        if(!userId) return;
        setIsLoading(true);
        Promise.all([
            wellnessService.getHydrationLogs(userId),
            wellnessService.getHydrationGoal(userId, {targetAmount: 2000, targetUnit: 'ml'})
        ]).then(([logs, goal]) => {
            setHydrationLogs(logs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setHydrationGoal(goal);
            setGoalFormData(goal);
        }).catch(console.error)
          .finally(() => setIsLoading(false));
    }, [userId]);

    const handleSaveLog = async () => {
        if (!userId) return;
        if (!logFormData.date || !logFormData.amount || logFormData.amount <= 0) { alert("Please enter a valid date and amount."); return; }
        const newLog: HydrationLog = {
            id: Date.now().toString(),
            date: logFormData.date,
            amount: logFormData.amount,
            unit: logFormData.unit || 'ml',
            notes: logFormData.notes,
            familyMemberId: userId
        };
        const updatedLogs = [newLog, ...hydrationLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        await wellnessService.saveHydrationLogs(userId, updatedLogs);
        setHydrationLogs(updatedLogs);
        
        awardPoints(userId, ActivityTypeForGamification.LOG_WATER_WELLNESS);
        checkAndAwardBadges(userId, ActivityTypeForGamification.LOG_WATER_WELLNESS);
        updateStreak(userId, ActivityTypeForGamification.LOG_WATER_WELLNESS);

        setShowLogModal(false);
    };
    
    const handleSaveGoal = async () => {
        await wellnessService.saveHydrationGoal(userId, goalFormData);
        setHydrationGoal(goalFormData);
        setShowGoalModal(false);
    };

    const handleDeleteHydrationLog = async (id: string) => {
        if (window.confirm("Delete this hydration log?")) {
            const updatedLogs = hydrationLogs.filter(h => h.id !== id);
            await wellnessService.saveHydrationLogs(userId, updatedLogs);
            setHydrationLogs(updatedLogs);
        }
    };

    const today = formatDate(new Date());
    const todaysHydration = useMemo(() => {
        return hydrationLogs.filter(h => h.date === today).reduce((sum, h) => {
            let amountInMl = h.amount;
            if (h.unit === 'oz') amountInMl *= 29.5735;
            if (h.unit === 'glasses') amountInMl *= 250; // Assuming 1 glass = 250ml
            return sum + amountInMl;
        }, 0);
    }, [hydrationLogs, today]);

    const goalInMl = useMemo(() => {
        if (hydrationGoal.targetUnit === 'ml') return hydrationGoal.targetAmount;
        if (hydrationGoal.targetUnit === 'oz') return hydrationGoal.targetAmount * 29.5735;
        if (hydrationGoal.targetUnit === 'glasses') return hydrationGoal.targetAmount * 250;
        return 2000; // Default
    }, [hydrationGoal]);
    
    const progressPercent = goalInMl > 0 ? Math.min((todaysHydration / goalInMl) * 100, 100) : 0;

    if (isLoading) return <p className="text-center text-textSecondary">Loading hydration data...</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-textPrimary">Hydration Tracker</h3>
                 <div className="flex gap-2">
                    <button onClick={() => {setLogFormData({date:formatDate(new Date()), unit: hydrationGoal.targetUnit || 'ml', amount: 250 }); setShowLogModal(true);}} className="btn-add-wellness"><PlusIcon className="w-4 h-4 mr-1"/>Log Water</button>
                    <button onClick={() => {setGoalFormData(hydrationGoal); setShowGoalModal(true);}} className="btn-edit-wellness"><EditIcon className="w-4 h-4 mr-1"/>Set Goal</button>
                </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-lg">
                <h4 className="font-semibold">Today's Intake: {todaysHydration.toFixed(0)} ml / {goalInMl.toFixed(0)} ml goal</h4>
                <div className="w-full bg-slate-300 rounded-full h-2.5 mt-2">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>
            
            <h4 className="text-md font-semibold mt-4">Hydration Log History</h4>
            {hydrationLogs.length === 0 && <p className="text-textSecondary text-center py-2">No water intake logged.</p>}
            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {hydrationLogs.map(log => (
                    <li key={log.id} className="p-2 bg-slate-50 rounded flex justify-between items-center">
                        <span>{new Date(log.date).toLocaleDateString()}: {log.amount} {log.unit} {log.notes && `(${log.notes})`}</span>
                        <button onClick={() => handleDeleteHydrationLog(log.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                    </li>
                ))}
            </ul>
            <p className="text-xs text-center text-slate-400 mt-2">Reminders for hydration coming soon.</p>

            <AppModal 
                isOpen={showLogModal} 
                onClose={() => setShowLogModal(false)} 
                title="Log Water Intake" 
                primaryActionText="Save Log"
                onPrimaryAction={handleSaveLog}
            >
                <div className="space-y-4">
                <div>
                    <label htmlFor="hydrationLogDate" className="form-label-wellness">Date<span className="text-red-500">*</span></label>
                    <input type="date" id="hydrationLogDate" value={logFormData.date || ''} onChange={e => setLogFormData(p => ({...p, date: e.target.value}))} className="form-input-wellness" required/>
                </div>
                <div className="flex gap-2">
                    <input type="number" placeholder="Amount" value={logFormData.amount || ''} onChange={e => setLogFormData(p => ({...p, amount: parseInt(e.target.value)}))} className="form-input-wellness" required/>
                    <select value={logFormData.unit} onChange={e => setLogFormData(p => ({...p, unit: e.target.value as any}))} className="form-input-wellness">
                        <option value="ml">ml</option><option value="oz">oz</option><option value="glasses">glasses</option>
                    </select>
                </div>
                <textarea placeholder="Notes (optional)" value={logFormData.notes || ''} onChange={e => setLogFormData(p => ({...p, notes: e.target.value}))} className="form-input-wellness" rows={2}/>
                </div>
            </AppModal>

             <AppModal 
                isOpen={showGoalModal} 
                onClose={() => setShowGoalModal(false)} 
                title="Set Daily Hydration Goal" 
                primaryActionText="Save Goal"
                onPrimaryAction={handleSaveGoal}
            >
                <div className="space-y-4">
                <div className="flex gap-2">
                    <input type="number" placeholder="Target Amount" value={goalFormData.targetAmount || ''} onChange={e => setGoalFormData(p => ({...p, targetAmount: parseInt(e.target.value)}))} className="form-input-wellness" required/>
                    <select value={goalFormData.targetUnit} onChange={e => setGoalFormData(p => ({...p, targetUnit: e.target.value as any}))} className="form-input-wellness">
                        <option value="ml">ml</option><option value="oz">oz</option><option value="glasses">glasses</option>
                    </select>
                </div>
                </div>
            </AppModal>
        </div>
    );
};

// --- Mood Tab ---
const MoodView: React.FC<{userId: string}> = ({userId}) => {
    const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<MoodLog>>({ date: formatDate(new Date()), moodRating: 3, selectedMoods:[] });
    
    useEffect(() => {
        if(!userId) return;
        setIsLoading(true);
        wellnessService.getMoodLogs(userId)
            .then(data => setMoodLogs(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())))
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [userId]);

    const handleSave = async () => {
        if (!formData.date) { alert("Date is required."); return; }
        const newLog: MoodLog = {
            id: Date.now().toString(),
            date: formData.date,
            moodRating: formData.moodRating,
            selectedMoods: formData.selectedMoods,
            journal: formData.journal,
            notes: formData.notes, 
            familyMemberId: userId
        };
        const updatedLogs = [newLog, ...moodLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        await wellnessService.saveMoodLogs(userId, updatedLogs);
        setMoodLogs(updatedLogs);
        setShowModal(false);
    };

    const handleMoodCheckboxChange = (moodName: string) => {
        setFormData(prev => ({
            ...prev,
            selectedMoods: prev.selectedMoods?.includes(moodName) 
                ? prev.selectedMoods.filter(s => s !== moodName) 
                : [...(prev.selectedMoods || []), moodName]
        }));
    };
    
    const handleDeleteMoodLog = async (id: string) => {
        if (window.confirm("Delete this mood log?")) {
            const updatedLogs = moodLogs.filter(m => m.id !== id);
            await wellnessService.saveMoodLogs(userId, updatedLogs);
            setMoodLogs(updatedLogs);
        }
    };

    if (isLoading) return <p className="text-center text-textSecondary">Loading mood data...</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-textPrimary">Mood & Well-being</h3>
                <button onClick={() => {setFormData({date: formatDate(new Date()), moodRating: 3, selectedMoods: []}); setShowModal(true);}} className="btn-add-wellness"><PlusIcon className="w-4 h-4 mr-1"/>Log Mood</button>
            </div>
            {moodLogs.length === 0 && <p className="text-textSecondary text-center py-2">No mood logged.</p>}
            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {moodLogs.map(log => (
                    <li key={log.id} className="p-2 bg-slate-50 rounded">
                       <div className="flex justify-between items-start">
                            <div>
                                <p>{new Date(log.date).toLocaleDateString()}: {log.moodRating ? MOOD_RATING_OPTIONS.find(o=>o.value === log.moodRating)?.label : log.selectedMoods?.join(', ') || 'N/A'}</p>
                                {log.journal && <p className="text-xs italic text-textSecondary mt-1">Journal: {log.journal}</p>}
                            </div>
                            <button onClick={() => handleDeleteMoodLog(log.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    </li>
                ))}
            </ul>
             <p className="text-xs text-center text-slate-400 mt-2">Mood trend analysis and mindfulness resources coming soon.</p>

            <AppModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                title="Log Mood & Journal" 
                primaryActionText="Save Log"
                onPrimaryAction={handleSave}
            >
                <div className="space-y-4">
                <div>
                    <label htmlFor="moodLogDate" className="form-label-wellness">Date<span className="text-red-500">*</span></label>
                    <input type="date" id="moodLogDate" value={formData.date || ''} onChange={e => setFormData(p => ({...p, date: e.target.value}))} className="form-input-wellness" required/>
                </div>
                <label className="form-label-wellness">Overall Mood Rating: {formData.moodRating || 3}/5</label>
                <input type="range" min="1" max="5" value={formData.moodRating || 3} onChange={e => setFormData(p => ({...p, moodRating: parseInt(e.target.value)}))} className="w-full"/>
                
                <label className="form-label-wellness mt-2">Specific Moods (Optional):</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-md">
                    {MOOD_OPTIONS.map(mood => (
                        <label key={mood} className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" checked={formData.selectedMoods?.includes(mood)} onChange={() => handleMoodCheckboxChange(mood)} className="rounded text-primary focus:ring-primary"/>
                        <span>{mood}</span>
                        </label>
                    ))}
                </div>
                <textarea placeholder="Journal / Notes (optional)" value={formData.journal || ''} onChange={e => setFormData(p => ({...p, journal: e.target.value}))} className="form-input-wellness mt-2" rows={3}/>
                </div>
            </AppModal>
        </div>
    );
};

// --- Resources Tab ---
const WellnessResourcesView: React.FC = () => {
    const [resources, setResources] = useState<WellnessResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        wellnessService.getWellnessResources()
            .then(setResources)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);
    
    if (isLoading) return <p className="text-center text-textSecondary">Loading resources...</p>;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-textPrimary">Wellness Library</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map(res => (
                    <div key={res.id} className="p-4 bg-surface rounded-lg shadow hover:shadow-md transition-shadow">
                        <BookOpenIcon className="w-6 h-6 text-primary mb-2"/>
                        <h4 className="font-semibold text-primary mb-1">{res.title}</h4>
                        <p className="text-xs text-accent mb-1">{res.category}</p>
                        <p className="text-sm text-textSecondary mb-2">{res.summary}</p>
                        <button className="text-xs text-primary hover:underline">Read more (placeholder)</button>
                    </div>
                ))}
            </div>
        </div>
    );
};


const WellnessPage: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || '';
  const userHeight = currentUser?.user_metadata?.heightCm || MOCK_USER_FOR_WELLNESS.heightCm;


  const [activeTab, setActiveTab] = useState<ActiveWellnessTab>('dashboard');
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  
  // States for summary data - fetched individually or as a combined summary
  const [vitalsSummary, setVitalsSummary] = useState<VitalLog[]>([]);
  const [weightLogsSummary, setWeightLogsSummary] = useState<WeightLogEntry[]>([]);
  const [bmiRecordsSummary, setBmiRecordsSummary] = useState<BMIRecord[]>([]);
  const [weightGoalSummary, setWeightGoalSummary] = useState<WeightGoal>({ heightUnitForBMI: 'cm', currentHeightForBMI: userHeight});
  const [activityLogsSummary, setActivityLogsSummary] = useState<ActivityLog[]>([]);
  const [activityGoalSummary, setActivityGoalSummary] = useState<ActivityGoal>({ type: 'daily', steps: 10000 });
  const [hydrationLogsSummary, setHydrationLogsSummary] = useState<HydrationLog[]>([]);
  const [hydrationGoalSummary, setHydrationGoalSummary] = useState<HydrationGoal>({targetAmount: 2000, targetUnit: 'ml'});
  const [moodLogsSummary, setMoodLogsSummary] = useState<MoodLog[]>([]);

  useEffect(() => {
      if(!userId) {
        setIsLoadingSummary(false);
        return;
      }
      setIsLoadingSummary(true);
      Promise.all([
          wellnessService.getVitals(userId),
          wellnessService.getWeightLogs(userId),
          wellnessService.getBmiRecords(userId),
          wellnessService.getWeightGoal(userId, { heightUnitForBMI: 'cm', currentHeightForBMI: userHeight}),
          wellnessService.getActivityLogs(userId),
          wellnessService.getActivityGoal(userId, { type: 'daily', steps: 10000 }),
          wellnessService.getHydrationLogs(userId),
          wellnessService.getHydrationGoal(userId, {targetAmount: 2000, targetUnit: 'ml'}),
          wellnessService.getMoodLogs(userId)
      ]).then(([v, wl, br, wg, al, ag, hl, hg, ml]) => {
          setVitalsSummary(v);
          setWeightLogsSummary(wl);
          setBmiRecordsSummary(br);
          setWeightGoalSummary(wg);
          setActivityLogsSummary(al);
          setActivityGoalSummary(ag);
          setHydrationLogsSummary(hl);
          setHydrationGoalSummary(hg);
          setMoodLogsSummary(ml);
      }).catch(console.error)
        .finally(() => setIsLoadingSummary(false));

  }, [userId, userHeight]);

  // Effect to handle tab switching from sessionStorage (e.g., from Rewards page)
  useEffect(() => {
    const targetTab = sessionStorage.getItem('wellnessTargetTab');
    if (targetTab) {
      setActiveTab(targetTab as ActiveWellnessTab);
      sessionStorage.removeItem('wellnessTargetTab');
    }
  }, []);


  const wellnessSummary = useMemo<WellnessSummary | null>(() => {
    if(!userId || isLoadingSummary) return null; 

    const today = formatDate(new Date());
    const lastBP = vitalsSummary.filter(v => v.type === 'BloodPressure').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] as BloodPressureReading | undefined;
    const currentWeight = weightLogsSummary.length > 0 ? weightLogsSummary[0] : undefined;
    const currentBMI = bmiRecordsSummary.length > 0 ? bmiRecordsSummary[0].bmi : undefined;
    
    const todaysActivityDuration = activityLogsSummary.filter(a=>a.date === today).reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
    const todaysSteps = activityLogsSummary.filter(a=>a.date === today).reduce((sum, a) => sum + (a.steps || 0), 0);
    
    const todaysHydrationAmount = hydrationLogsSummary.filter(h => h.date === today).reduce((sum, h) => {
            let amountInMl = h.amount; 
            if (h.unit === 'oz') amountInMl = h.amount * 29.5735;
            else if (h.unit === 'glasses') amountInMl = h.amount * 250; 
            return sum + amountInMl;
        }, 0);

    const goalHydrationUnit = hydrationGoalSummary.targetUnit || 'ml';
    let displayHydrationLogged = todaysHydrationAmount;
    if(goalHydrationUnit === 'oz') displayHydrationLogged = todaysHydrationAmount / 29.5735;
    else if(goalHydrationUnit === 'glasses') displayHydrationLogged = todaysHydrationAmount / 250;


    return {
        lastBP,
        currentWeight,
        currentBMI,
        weightGoal: weightGoalSummary,
        todayActivityProgress: { logged: activityGoalSummary.steps ? todaysSteps : todaysActivityDuration, goal: activityGoalSummary.steps || activityGoalSummary.durationMinutes, unit: activityGoalSummary.steps ? 'steps' : 'minutes'},
        todayHydrationProgress: { logged: parseFloat(displayHydrationLogged.toFixed(1)), goal: hydrationGoalSummary.targetAmount, unit: hydrationGoalSummary.targetUnit },
        lastMood: moodLogsSummary.length > 0 ? moodLogsSummary.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : undefined,
    };
  }, [userId, isLoadingSummary, vitalsSummary, weightLogsSummary, bmiRecordsSummary, weightGoalSummary, activityLogsSummary, activityGoalSummary, hydrationLogsSummary, hydrationGoalSummary, moodLogsSummary]);
  
  const handleLogActionFromDashboard = (tabToOpen: ActiveWellnessTab) => {
      setActiveTab(tabToOpen);
  };


  const renderTabContent = () => {
    if (!currentUser) { 
      return <p className="text-center text-textSecondary p-6">Please log in to view and manage your wellness data.</p>;
    }
    switch (activeTab) {
      case 'dashboard': return <WellnessDashboardView summary={wellnessSummary} onLogAction={handleLogActionFromDashboard} isLoading={isLoadingSummary} />;
      case 'vitals': return <VitalsView userId={userId} />;
      case 'weight_bmi': return <WeightBmiView userId={userId} userHeightCm={userHeight}/>;
      case 'activity': return <ActivityView userId={userId} />;
      case 'sleep': return <SleepView userId={userId} />;
      case 'hydration': return <HydrationView userId={userId} />;
      case 'mood': return <MoodView userId={userId} />;
      case 'resources': return <WellnessResourcesView />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3">
            <HeartbeatIcon className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
            <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary">Wellness Tools</h2>
        </div>
      </div>

      <div role="tablist" className="border-b border-slate-200 flex flex-wrap -mb-px overflow-x-auto">
        <TabButton tabName="dashboard" currentTab={activeTab} onClick={() => setActiveTab('dashboard')}>Dashboard</TabButton>
        <TabButton tabName="vitals" currentTab={activeTab} onClick={() => setActiveTab('vitals')}>Vitals</TabButton>
        <TabButton tabName="weight_bmi" currentTab={activeTab} onClick={() => setActiveTab('weight_bmi')}>Weight & BMI</TabButton>
        <TabButton tabName="activity" currentTab={activeTab} onClick={() => setActiveTab('activity')}>Activity</TabButton>
        <TabButton tabName="sleep" currentTab={activeTab} onClick={() => setActiveTab('sleep')}>Sleep</TabButton>
        <TabButton tabName="hydration" currentTab={activeTab} onClick={() => setActiveTab('hydration')}>Hydration</TabButton>
        <TabButton tabName="mood" currentTab={activeTab} onClick={() => setActiveTab('mood')}>Mood</TabButton>
        <TabButton tabName="resources" currentTab={activeTab} onClick={() => setActiveTab('resources')}>Resources</TabButton>
      </div>

      <div className="mt-0 py-4">
        {renderTabContent()}
      </div>

      <style>{`
        .form-input-wellness {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #cbd5e1; /* slate-300 */
            border-radius: 0.375rem; /* rounded-md */
            font-size: 0.875rem; /* text-sm */
            background-color: #ffffff;
        }
        .form-input-wellness:focus {
            outline: 2px solid transparent;
            outline-offset: 2px;
            border-color: #06b6d4; /* primary */
            box-shadow: 0 0 0 2px #06b6d460;
        }
        .form-label-wellness {
            display: block;
            font-size: 0.875rem; 
            font-weight: 500; 
            color: #64748b; 
            margin-bottom: 0.25rem;
        }
        .btn-add-wellness {
             background-color: #06b6d4; 
             color: white;
             padding: 0.5rem 0.75rem;
             border-radius: 0.375rem;
             font-size: 0.875rem;
             display: flex;
             align-items: center;
        }
        .btn-add-wellness:hover {
            background-color: #0e7490;
        }
        .btn-edit-wellness {
             background-color: #facc15; 
             color: #1e293b; 
             padding: 0.5rem 0.75rem;
             border-radius: 0.375rem;
             font-size: 0.875rem;
             display: flex;
             align-items: center;
        }
        .btn-edit-wellness:hover {
            background-color: #eab308;
        }
         .btn-add-vital {
             background-color: #f1f5f9; 
             color: #06b6d4; 
             border: 1px solid #06b6d4; 
             padding: 0.5rem 0.75rem;
             border-radius: 0.375rem;
             font-size: 0.875rem;
             display: flex;
             align-items: center;
             transition: background-color 0.2s;
        }
        .btn-add-vital:hover {
            background-color: #e0f2f7; 
        }
      `}</style>
    </div>
  );
};

export default WellnessPage;