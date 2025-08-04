import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    FamilyMember, FeedingLogEntry, DiaperLogEntry, BabySleepLogEntry, GrowthRecordEntry,
    MilestoneEntry, VaccinationEntry,
    FEED_TYPES, FeedType, DIAPER_TYPES, DiaperType, MILESTONE_CATEGORIES, MilestoneCategory,
    MOCK_VACCINE_SCHEDULE,
    BABY_AGE_THRESHOLD_YEARS, MOCK_MILESTONES_CHECKLIST, ActivityTypeForGamification
} from '../types.ts';
import BabyIcon from '../components/icons/BabyIcon.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import EditIcon from '../components/icons/EditIcon.tsx';
import TrashIcon from '../components/icons/TrashIcon.tsx';
import BookOpenIcon from '../components/icons/BookOpenIcon.tsx';
import BabyNutritionMainView from './BabyNutritionMainView.tsx';
import HeartbeatIcon from '../components/icons/HeartbeatIcon.tsx';
import StarIcon from '../components/icons/StarIcon.tsx';
// import useLocalStorage from '/hooks/useLocalStorage'; // Replaced by service
import * as babyCareService from '../services/babyCareService.ts'; // Import the service
import AppModal from '../components/AppModal.tsx'; 
import { incrementLogCount, checkAndAwardBadges, awardPoints } from '../utils/gamificationUtils.ts';
import { useAuth } from '../contexts/AuthContext.tsx'; 
import * as familyMemberService from '../services/familyMemberService.ts'; 


type BabyCareTab = 'dashboard' | 'daily_logs' | 'growth' | 'milestones' | 'health' | 'nutrition' | 'my_firsts' | 'resources';

const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const formatDateTimeLocal = (date: Date): string => { 
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const parseDateTimeLocal = (dateTimeLocalStr: string): Date => new Date(dateTimeLocalStr);

type DailyLogSubTab = 'feeding' | 'diaper' | 'sleep';

interface MinimalLogDataBase {
  id?: string;
  childId?: string;
  notes?: string;
}

interface FeedingLogFormData extends MinimalLogDataBase, Partial<Omit<FeedingLogEntry, 'id'|'user_id'|'childId'|'timestamp'|'notes'>> {
    timestamp: string; 
    feedType: FeedType;
}
interface DiaperLogFormData extends MinimalLogDataBase, Partial<Omit<DiaperLogEntry, 'id'|'user_id'|'childId'|'timestamp'|'notes'>> {
    timestamp: string; 
    diaperType: DiaperType;
}
interface BabySleepLogFormData extends MinimalLogDataBase, Partial<Omit<BabySleepLogEntry, 'id'|'user_id'|'childId'|'startTime'|'endTime'|'notes'>> {
    startTime: string;   
    endTime: string;     
    location?: string;
}

type DailyFormDataUnion = FeedingLogFormData | DiaperLogFormData | BabySleepLogFormData;
type DailyLogUnion = FeedingLogEntry | DiaperLogEntry | BabySleepLogEntry;


const TabButton: React.FC<{tabName: BabyCareTab, currentTab: BabyCareTab, onClick: () => void, children: React.ReactNode, icon?: React.ReactNode}> = 
  ({tabName, currentTab, onClick, children, icon}) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-1.5 flex-shrink-0 px-3 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 whitespace-nowrap
                    ${currentTab === tabName 
                        ? 'border-primary text-primary bg-surface shadow-sm' 
                        : 'border-transparent text-textSecondary hover:text-primary hover:bg-slate-50'}`}
        role="tab"
        aria-selected={currentTab === tabName}
    >
        {icon}
        <span>{children}</span>
    </button>
);

const ChildSelector: React.FC<{
    familyMembers: FamilyMember[];
    selectedChildId: string | null;
    onSelectChild: (id: string) => void;
    isLoading: boolean;
}> = ({ familyMembers, selectedChildId, onSelectChild, isLoading }) => {
    const eligibleChildren = familyMembers.filter(member => {
        if (!member.dateOfBirth) return false;
        const birthDate = new Date(member.dateOfBirth);
        const ageInMilliseconds = new Date().getTime() - birthDate.getTime();
        const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
        return ageInYears < BABY_AGE_THRESHOLD_YEARS && 
               (member.relationshipToUser?.toLowerCase().includes('child') || 
                member.relationshipToUser?.toLowerCase().includes('son') || 
                member.relationshipToUser?.toLowerCase().includes('daughter'));
    });

    if (isLoading) {
        return <p className="text-sm text-textSecondary p-2">Loading children...</p>;
    }

    if (eligibleChildren.length === 0) {
        return (
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md text-center">
                No children eligible for Baby Care module found (under {BABY_AGE_THRESHOLD_YEARS} years old and identified as child/son/daughter).
                Please <Link to="/family-profiles" className="font-semibold underline">add or update a child profile</Link> first.
            </div>
        );
    }

    return (
        <div className="mb-4">
            <label htmlFor="childSelector" className="block text-sm font-medium text-textSecondary mb-1">Select Child Profile:</label>
            <select
                id="childSelector"
                value={selectedChildId || ''}
                onChange={(e) => onSelectChild(e.target.value)}
                className="w-full sm:w-auto p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white shadow-sm"
                aria-label="Select child profile for baby care module"
            >
                <option value="" disabled>-- Select a Child --</option>
                {eligibleChildren.map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                ))}
            </select>
        </div>
    );
};


const BabyDashboardView: React.FC<{ childId: string, userId: string }> = ({ childId, userId }) => {
    const [feedingLogs, setFeedingLogs] = useState<FeedingLogEntry[]>([]);
    const [diaperLogs, setDiaperLogs] = useState<DiaperLogEntry[]>([]);
    const [sleepLogs, setSleepLogs] = useState<BabySleepLogEntry[]>([]);
    const [vaccinationLogs, setVaccinationLogs] = useState<VaccinationEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (!userId || !childId) return;
      setIsLoading(true);
      Promise.all([
        babyCareService.getFeedingLogs(userId, childId),
        babyCareService.getDiaperLogs(userId, childId),
        babyCareService.getBabySleepLogs(userId, childId),
        babyCareService.getVaccinations(userId, childId),
      ]).then(([feeds, diapers, sleeps, vaccines]) => {
        setFeedingLogs(feeds);
        setDiaperLogs(diapers);
        setSleepLogs(sleeps);
        setVaccinationLogs(vaccines);
      }).catch(console.error).finally(() => setIsLoading(false));
    }, [userId, childId]);
    
    const latestFeed = feedingLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const latestDiaper = diaperLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const latestSleep = sleepLogs.sort((a,b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())[0];

    const nextDueVaccine = useMemo(() => {
        const administeredVaccineNames = vaccinationLogs.map(v => v.vaccineName.split(' - ')[0]); 
        return MOCK_VACCINE_SCHEDULE.find(v => !administeredVaccineNames.includes(v.name.split(' - ')[0]));
    }, [vaccinationLogs]);

    if (isLoading) return <p className="text-center text-textSecondary">Loading dashboard...</p>;

    return (
        <div className="p-4 bg-surface rounded-lg shadow space-y-4">
            <h4 className="text-lg font-semibold text-textPrimary">Quick Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-md">
                    <p className="text-sm font-medium">Last Feed:</p>
                    {latestFeed ? <p className="text-xs">{new Date(latestFeed.timestamp).toLocaleString()} - {latestFeed.feedType}</p> : <p className="text-xs text-textSecondary">No feeds logged.</p>}
                </div>
                <div className="p-3 bg-slate-50 rounded-md">
                    <p className="text-sm font-medium">Last Diaper Change:</p>
                    {latestDiaper ? <p className="text-xs">{new Date(latestDiaper.timestamp).toLocaleString()} - {latestDiaper.diaperType}</p> : <p className="text-xs text-textSecondary">No diapers logged.</p>}
                </div>
                <div className="p-3 bg-slate-50 rounded-md">
                    <p className="text-sm font-medium">Last Sleep:</p>
                    {latestSleep ? <p className="text-xs">{new Date(latestSleep.startTime).toLocaleTimeString()} to {new Date(latestSleep.endTime).toLocaleTimeString()} ({latestSleep.durationHours?.toFixed(1)} hrs)</p> : <p className="text-xs text-textSecondary">No sleep logged.</p>}
                </div>
                 <div className="p-3 bg-red-50 text-red-700 rounded-md md:col-span-2 lg:col-span-1">
                    <p className="text-sm font-medium">Next Due Vaccination (Mock):</p>
                    {nextDueVaccine ? <p className="text-xs">{nextDueVaccine.name} (Due around {nextDueVaccine.ageDue})</p> : <p className="text-xs">All mock vaccines logged or schedule complete.</p>}
                </div>
            </div>
            <p className="text-xs text-center text-slate-400 mt-4">More dashboard insights coming soon!</p>
        </div>
    );
};

const DailyLogsView: React.FC<{ childId: string, userId: string }> = ({ childId, userId }) => {
    const [activeSubTab, setActiveSubTab] = useState<DailyLogSubTab>('feeding');
    const [isLoading, setIsLoading] = useState(false);

    const [feedingLogs, setFeedingLogs] = useState<FeedingLogEntry[]>([]);
    const [diaperLogs, setDiaperLogs] = useState<DiaperLogEntry[]>([]);
    const [sleepLogs, setSleepLogs] = useState<BabySleepLogEntry[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<DailyLogUnion | undefined>(undefined);
    const [formData, setFormData] = useState<DailyFormDataUnion>({} as DailyFormDataUnion);

    const loadLogs = useCallback(async (tab: DailyLogSubTab) => {
      if (!userId || !childId) return;
      setIsLoading(true);
      try {
        if (tab === 'feeding') setFeedingLogs(await babyCareService.getFeedingLogs(userId, childId));
        else if (tab === 'diaper') setDiaperLogs(await babyCareService.getDiaperLogs(userId, childId));
        else if (tab === 'sleep') setSleepLogs(await babyCareService.getBabySleepLogs(userId, childId));
      } catch (error) { console.error("Error loading logs:", error); }
      finally { setIsLoading(false); }
    }, [userId, childId]);

    useEffect(() => {
        loadLogs(activeSubTab);
    }, [activeSubTab, loadLogs]);


    const openModal = (logToEdit?: DailyLogUnion) => {
        setEditingLog(logToEdit);
        let initialData: DailyFormDataUnion;
        const nowFormatted = formatDateTimeLocal(new Date());

        if (logToEdit) {
            initialData = JSON.parse(JSON.stringify(logToEdit)); 
            if ('timestamp' in initialData && typeof initialData.timestamp === 'string') {
                 initialData.timestamp = formatDateTimeLocal(new Date(initialData.timestamp));
            }
            if ('startTime' in initialData && typeof initialData.startTime === 'string') {
                initialData.startTime = formatDateTimeLocal(new Date(initialData.startTime));
            }
            if ('endTime' in initialData && typeof initialData.endTime === 'string' && initialData.endTime) {
                initialData.endTime = formatDateTimeLocal(new Date(initialData.endTime));
            }
        } else {
            if (activeSubTab === 'feeding') {
                initialData = { timestamp: nowFormatted, feedType: FEED_TYPES[0], durationMinutes: undefined, amountMl: undefined, breastSide: undefined, foodDetails: undefined, notes: undefined } as FeedingLogFormData;
            } else if (activeSubTab === 'diaper') {
                initialData = { timestamp: nowFormatted, diaperType: DIAPER_TYPES[0], consistency: undefined, color: undefined, notes: undefined } as DiaperLogFormData;
            } else if (activeSubTab === 'sleep') {
                initialData = {
                    startTime: nowFormatted,
                    endTime: formatDateTimeLocal(new Date(Date.now() + 60 * 60 * 1000 )), 
                    location: '', notes: '' 
                } as BabySleepLogFormData;
            } else {
                 initialData = {} as DailyFormDataUnion; 
            }
        }
        setFormData(initialData);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async () => { 
        if (!userId || !childId) return;
        const logId = editingLog?.id || Date.now().toString();
        
        if (activeSubTab === 'feeding') {
            const currentFormData = formData as FeedingLogFormData;
            if(!currentFormData.timestamp || !currentFormData.feedType) { alert("Timestamp and Feed Type are required."); return; }
            
            const finalLogData: FeedingLogEntry = {
                id: logId, user_id: userId, childId, timestamp: parseDateTimeLocal(currentFormData.timestamp).toISOString(), feedType: currentFormData.feedType,
                amountMl: currentFormData.amountMl, durationMinutes: currentFormData.durationMinutes, breastSide: currentFormData.breastSide,
                foodDetails: currentFormData.foodDetails, notes: currentFormData.notes,
            };
            const updatedLogs = editingLog ? feedingLogs.map(l => l.id === finalLogData.id ? finalLogData : l) : [...feedingLogs, finalLogData];
            await babyCareService.saveFeedingLogs(userId, childId, updatedLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            setFeedingLogs(updatedLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

        } else if (activeSubTab === 'diaper') {
            const currentFormData = formData as DiaperLogFormData;
             if(!currentFormData.timestamp || !currentFormData.diaperType) { alert("Timestamp and Diaper Type are required."); return; }
            const finalLogData: DiaperLogEntry = {
                id: logId, user_id: userId, childId, timestamp: parseDateTimeLocal(currentFormData.timestamp).toISOString(), diaperType: currentFormData.diaperType,
                consistency: currentFormData.consistency, color: currentFormData.color, notes: currentFormData.notes,
            };
            const updatedLogs = editingLog ? diaperLogs.map(l => l.id === finalLogData.id ? finalLogData : l) : [...diaperLogs, finalLogData];
            await babyCareService.saveDiaperLogs(userId, childId, updatedLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            setDiaperLogs(updatedLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

        } else if (activeSubTab === 'sleep') {
            const currentFormData = formData as BabySleepLogFormData;
            if(!currentFormData.startTime || !currentFormData.endTime) { alert("Start Time and End Time are required."); return; }
            
            const calculateDuration = (startStr: string, endStr: string): number | undefined => {
                const start = parseDateTimeLocal(startStr); let end = parseDateTimeLocal(endStr);
                if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000); 
                const durationMs = end.getTime() - start.getTime();
                if (durationMs < 0) return undefined; 
                return parseFloat((durationMs / (1000 * 60 * 60)).toFixed(1));
            };
            const durationHours = calculateDuration(currentFormData.startTime, currentFormData.endTime);
            if (durationHours === undefined) { alert("Invalid start or end time. End time must be after start time."); return; }
            
            const finalLogData: BabySleepLogEntry = {
                id: logId, user_id: userId, childId, startTime: parseDateTimeLocal(currentFormData.startTime).toISOString(), endTime: parseDateTimeLocal(currentFormData.endTime).toISOString(),
                durationHours, location: currentFormData.location, notes: currentFormData.notes,
            };
            const updatedLogs = editingLog ? sleepLogs.map(l => l.id === finalLogData.id ? finalLogData : l) : [...sleepLogs, finalLogData];
            await babyCareService.saveBabySleepLogs(userId, childId, updatedLogs.sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
            setSleepLogs(updatedLogs.sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
        }
        
        setIsModalOpen(false);
        setEditingLog(undefined);
    };

    const handleDeleteLog = async (logId: string) => {
        if (!userId || !childId) return;
        if(window.confirm("Are you sure you want to delete this log?")) {
            if (activeSubTab === 'feeding') {
                const updated = feedingLogs.filter(l => l.id !== logId);
                await babyCareService.saveFeedingLogs(userId, childId, updated);
                setFeedingLogs(updated);
            } else if (activeSubTab === 'diaper') {
                const updated = diaperLogs.filter(l => l.id !== logId);
                await babyCareService.saveDiaperLogs(userId, childId, updated);
                setDiaperLogs(updated);
            } else if (activeSubTab === 'sleep') {
                 const updated = sleepLogs.filter(l => l.id !== logId);
                await babyCareService.saveBabySleepLogs(userId, childId, updated);
                setSleepLogs(updated);
            }
        }
    };
    
    const renderLogList = () => {
        let logs: DailyLogUnion[] = [];
        if (activeSubTab === 'feeding') logs = feedingLogs;
        else if (activeSubTab === 'diaper') logs = diaperLogs;
        else if (activeSubTab === 'sleep') logs = sleepLogs;

        if (isLoading) return <p className="text-textSecondary text-center py-4">Loading logs...</p>;
        if (logs.length === 0) return <p className="text-textSecondary text-center py-4">No logs for this category yet.</p>;
        
         return (
            <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {logs.map(log => (
                    <li key={log.id} className="p-3 bg-slate-50 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="text-sm">
                                {activeSubTab === 'feeding' && (log as FeedingLogEntry).feedType && ( /* Type assertion for safety */
                                    <>
                                        <p><strong>Feed:</strong> {new Date((log as FeedingLogEntry).timestamp).toLocaleString()}</p>
                                        <p>Type: {(log as FeedingLogEntry).feedType}</p>
                                        {(log as FeedingLogEntry).amountMl && <p>Amount: {(log as FeedingLogEntry).amountMl} ml</p>}
                                        {(log as FeedingLogEntry).durationMinutes && <p>Duration: {(log as FeedingLogEntry).durationMinutes} min</p>}
                                        {(log as FeedingLogEntry).breastSide && <p>Side: {(log as FeedingLogEntry).breastSide}</p>}
                                        {(log as FeedingLogEntry).foodDetails && <p>Details: {(log as FeedingLogEntry).foodDetails}</p>}
                                    </>
                                )}
                                {activeSubTab === 'diaper' && (log as DiaperLogEntry).diaperType && (
                                    <>
                                        <p><strong>Diaper:</strong> {new Date((log as DiaperLogEntry).timestamp).toLocaleString()}</p>
                                        <p>Type: {(log as DiaperLogEntry).diaperType}</p>
                                        {(log as DiaperLogEntry).consistency && <p>Consistency: {(log as DiaperLogEntry).consistency}</p>}
                                        {(log as DiaperLogEntry).color && <p>Color: {(log as DiaperLogEntry).color}</p>}
                                    </>
                                )}
                                {activeSubTab === 'sleep' && (log as BabySleepLogEntry).startTime && (
                                    <>
                                        <p><strong>Sleep:</strong> {new Date((log as BabySleepLogEntry).startTime).toLocaleTimeString()} to {new Date((log as BabySleepLogEntry).endTime).toLocaleTimeString()}</p>
                                        <p>Duration: {(log as BabySleepLogEntry).durationHours?.toFixed(1)} hrs</p>
                                        {(log as BabySleepLogEntry).location && <p>Location: {(log as BabySleepLogEntry).location}</p>}
                                    </>
                                )}
                                {log.notes && <p className="text-xs italic mt-1">Notes: {log.notes}</p>}
                            </div>
                            <div className="flex space-x-1">
                                <button onClick={() => openModal(log)} className="p-1.5 text-blue-600 hover:text-blue-800" aria-label="Edit log"><EditIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleDeleteLog(log.id)} className="p-1.5 text-red-600 hover:text-red-800" aria-label="Delete log"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    const renderModalContent = () => {
        const currentFormData = formData; 
        if (activeSubTab === 'feeding' && 'feedType' in currentFormData) {
            return ( <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label><input type="datetime-local" value={currentFormData.timestamp} onChange={e => setFormData(p => ({...p, timestamp: e.target.value}))} className="w-full p-2 border rounded-md" required/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Feed Type</label><select value={currentFormData.feedType} onChange={e => setFormData(p => ({...p, feedType: e.target.value as FeedType}))} className="w-full p-2 border rounded-md" required>
                        {FEED_TYPES.map(ft => <option key={ft} value={ft}>{ft}</option>)}
                    </select></div>
                    {currentFormData.feedType === 'Breast Milk (Direct)' && <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label><input type="number" value={currentFormData.durationMinutes || ''} onChange={e => setFormData(p => ({...p, durationMinutes: parseInt(e.target.value) || undefined}))} className="w-full p-2 border rounded-md" /></div>}
                    {currentFormData.feedType === 'Breast Milk (Direct)' && <div><label className="block text-sm font-medium text-gray-700 mb-1">Breast Side</label><select value={currentFormData.breastSide || ''} onChange={e => setFormData(p => ({...p, breastSide: e.target.value as any}))} className="w-full p-2 border rounded-md">
                        <option value="">Select</option><option value="Left">Left</option><option value="Right">Right</option><option value="Both">Both</option>
                    </select></div>}
                    {(currentFormData.feedType === 'Breast Milk (Bottle)' || currentFormData.feedType === 'Formula') && <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount (ml)</label><input type="number" value={currentFormData.amountMl || ''} onChange={e => setFormData(p => ({...p, amountMl: parseInt(e.target.value) || undefined}))} className="w-full p-2 border rounded-md" /></div>}
                    {currentFormData.feedType === 'Solid Food' && <div><label className="block text-sm font-medium text-gray-700 mb-1">Food Details (Name, Reaction)</label><input type="text" value={currentFormData.foodDetails || ''} onChange={e => setFormData(p => ({...p, foodDetails: e.target.value}))} className="w-full p-2 border rounded-md" /></div>}
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={currentFormData.notes || ''} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} className="w-full p-2 border rounded-md" rows={2}/></div>
                </> );
        } else if (activeSubTab === 'diaper' && 'diaperType' in currentFormData) {
             return ( <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label><input type="datetime-local" value={currentFormData.timestamp} onChange={e => setFormData(p => ({...p, timestamp: e.target.value}))} className="w-full p-2 border rounded-md" required/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Diaper Type</label><select value={currentFormData.diaperType} onChange={e => setFormData(p => ({...p, diaperType: e.target.value as DiaperType}))} className="w-full p-2 border rounded-md" required>
                        {DIAPER_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                    </select></div>
                    {(currentFormData.diaperType === 'Soiled' || currentFormData.diaperType === 'Mixed (Wet & Soiled)') && <>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Consistency</label><select value={currentFormData.consistency || ''} onChange={e => setFormData(p => ({...p, consistency: e.target.value as any}))} className="w-full p-2 border rounded-md">
                            <option value="">Select</option><option value="Normal">Normal</option><option value="Loose">Loose</option><option value="Hard">Hard</option>
                        </select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Color</label><input type="text" value={currentFormData.color || ''} onChange={e => setFormData(p => ({...p, color: e.target.value}))} className="w-full p-2 border rounded-md" /></div>
                    </>}
                     <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={currentFormData.notes || ''} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} className="w-full p-2 border rounded-md" rows={2}/></div>
                </> );
        } else if (activeSubTab === 'sleep' && 'startTime' in currentFormData) {
             return ( <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label><input type="datetime-local" value={currentFormData.startTime} onChange={e => setFormData(p => ({...p, startTime: e.target.value}))} className="w-full p-2 border rounded-md" required/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">End Time</label><input type="datetime-local" value={currentFormData.endTime} onChange={e => setFormData(p => ({...p, endTime: e.target.value}))} className="w-full p-2 border rounded-md" required/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><input type="text" value={currentFormData.location || ''} onChange={e => setFormData(p => ({...p, location: e.target.value}))} className="w-full p-2 border rounded-md" placeholder="e.g., Crib, Bassinet"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={currentFormData.notes || ''} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} className="w-full p-2 border rounded-md" rows={2}/></div>
                </> );
        }
        return <p>Error: Form type not recognized.</p>;
    };
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                 <h4 className="text-lg font-semibold text-textPrimary">Daily Logs</h4>
                 <button onClick={() => openModal()} className="bg-primary text-white px-3 py-1.5 rounded-md text-sm flex items-center space-x-1">
                    <PlusIcon className="w-4 h-4"/> Log {activeSubTab.charAt(0).toUpperCase() + activeSubTab.slice(1)}
                </button>
            </div>
            <div className="flex space-x-1 border-b border-slate-200 mb-4">
                {(['feeding', 'diaper', 'sleep'] as DailyLogSubTab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveSubTab(tab)} 
                        className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-t-md ${activeSubTab === tab ? 'bg-slate-100 text-primary border-b-2 border-primary' : 'text-textSecondary hover:bg-slate-50'}`}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>
            {renderLogList()}
            <AppModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`${editingLog ? 'Edit' : 'Log'} ${activeSubTab.charAt(0).toUpperCase() + activeSubTab.slice(1)}`}
                primaryActionText={editingLog ? "Save Changes" : "Save Log"}
                onPrimaryAction={handleFormSubmit}
                size="md"
            >
                <div className="space-y-3">
                    {renderModalContent()}
                </div>
            </AppModal>
        </div>
    );
};

const GrowthTrackerView: React.FC<{childId: string, userId: string}> = ({ childId, userId }) => {
    const [growthRecords, setGrowthRecords] = useState<GrowthRecordEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<GrowthRecordEntry | undefined>(undefined);
    const [formData, setFormData] = useState<Partial<GrowthRecordEntry>>({date: formatDate(new Date())});

    useEffect(() => {
      if (!userId || !childId) return;
      setIsLoading(true);
      babyCareService.getGrowthRecords(userId, childId)
        .then(data => setGrowthRecords(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }, [userId, childId]);

    const openModal = (recordToEdit?: GrowthRecordEntry) => {
        setEditingRecord(recordToEdit);
        setFormData(recordToEdit ? {...recordToEdit} : {date: formatDate(new Date())});
        setIsModalOpen(true);
    };

    const handleSaveRecord = async () => {
        if (!userId || !childId) return;
        if (!formData.date) { alert("Date is required."); return; }
        if (!formData.weightKg && !formData.heightCm && !formData.headCircumferenceCm) {
            alert("Please enter at least one measurement (weight, height, or head circumference)."); return;
        }
        const newRecord: GrowthRecordEntry = {
            id: editingRecord?.id || Date.now().toString(), user_id: userId, childId, date: formData.date,
            weightKg: formData.weightKg, heightCm: formData.heightCm,
            headCircumferenceCm: formData.headCircumferenceCm, notes: formData.notes,
        };
        const updatedRecords = editingRecord ? growthRecords.map(r => r.id === newRecord.id ? newRecord : r) : [...growthRecords, newRecord];
        await babyCareService.saveGrowthRecords(userId, childId, updatedRecords.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setGrowthRecords(updatedRecords.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsModalOpen(false);
    };

    const handleDeleteRecord = async (recordId: string) => {
        if (!userId || !childId) return;
        if (window.confirm("Are you sure you want to delete this growth record?")) {
            const updated = growthRecords.filter(r => r.id !== recordId);
            await babyCareService.saveGrowthRecords(userId, childId, updated);
            setGrowthRecords(updated);
        }
    };
    
    if (isLoading) return <p className="text-textSecondary text-center py-4">Loading growth records...</p>;
     return (
        <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
                 <h4 className="text-lg font-semibold text-textPrimary">Growth Tracker</h4>
                 <button onClick={() => openModal()} className="bg-primary text-white px-3 py-1.5 rounded-md text-sm flex items-center space-x-1">
                    <PlusIcon className="w-4 h-4"/> Log Measurement
                </button>
            </div>
            {growthRecords.length === 0 && <p className="text-textSecondary text-center py-4">No growth records yet.</p>}
            <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {growthRecords.map(record => (
                    <li key={record.id} className="p-3 bg-slate-50 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="text-sm">
                                <p><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>
                                {record.weightKg && <p>Weight: {record.weightKg} kg</p>}
                                {record.heightCm && <p>Height: {record.heightCm} cm</p>}
                                {record.headCircumferenceCm && <p>Head Circum.: {record.headCircumferenceCm} cm</p>}
                                {record.notes && <p className="text-xs italic mt-1">Notes: {record.notes}</p>}
                            </div>
                            <div className="flex space-x-1">
                                <button onClick={() => openModal(record)} className="p-1.5 text-blue-600 hover:text-blue-800" aria-label="Edit record"><EditIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleDeleteRecord(record.id)} className="p-1.5 text-red-600 hover:text-red-800" aria-label="Delete record"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
             <p className="text-xs text-center text-slate-400 mt-4">Growth charts (WHO percentiles) coming soon.</p>
            <AppModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRecord ? "Edit Growth Record" : "Log New Growth Measurement"}
                primaryActionText={editingRecord ? "Save Changes" : "Save Record"}
                onPrimaryAction={handleSaveRecord}
                size="md"
            >
                <div className="space-y-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={formData.date || ''} onChange={e => setFormData(p => ({...p, date: e.target.value}))} className="w-full p-2 border rounded-md" required/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label><input type="number" step="0.01" value={formData.weightKg || ''} onChange={e => setFormData(p => ({...p, weightKg: parseFloat(e.target.value) || undefined}))} className="w-full p-2 border rounded-md"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label><input type="number" step="0.1" value={formData.heightCm || ''} onChange={e => setFormData(p => ({...p, heightCm: parseFloat(e.target.value) || undefined}))} className="w-full p-2 border rounded-md"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Head Circumference (cm)</label><input type="number" step="0.1" value={formData.headCircumferenceCm || ''} onChange={e => setFormData(p => ({...p, headCircumferenceCm: parseFloat(e.target.value) || undefined}))} className="w-full p-2 border rounded-md"/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={formData.notes || ''} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} className="w-full p-2 border rounded-md" rows={2}/></div>
                </div>
            </AppModal>
        </div>
    );
};


const MilestonesView: React.FC<{ childId: string, userId: string }> = ({ childId, userId }) => {
    const [milestones, setMilestones] = useState<MilestoneEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<MilestoneEntry | undefined>(undefined);
    const [formData, setFormData] = useState<Partial<MilestoneEntry>>({ category: MILESTONE_CATEGORIES[0], isAchieved: false });

     useEffect(() => {
        if (!userId || !childId) return;
        setIsLoading(true);
        babyCareService.getMilestones(userId, childId)
            .then(data => {
                if (data.length === 0) { // Initialize with MOCK_MILESTONES_CHECKLIST if empty
                    const initialChecklist: MilestoneEntry[] = MOCK_MILESTONES_CHECKLIST.map(mock => ({
                        ...mock, id: `${childId}_${mock.milestoneName.replace(/\s+/g, '_')}`, user_id: userId, childId, isAchieved: false,
                    }));
                    setMilestones(initialChecklist);
                    babyCareService.saveMilestones(userId, childId, initialChecklist); // Save initial list
                } else {
                    setMilestones(data);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [userId, childId]);

    const openModal = (milestoneToEdit?: MilestoneEntry) => {
        setEditingMilestone(milestoneToEdit);
        setFormData(milestoneToEdit ? {...milestoneToEdit} : { category: MILESTONE_CATEGORIES[0], isAchieved: false, milestoneName: '' });
        setIsModalOpen(true);
    };

    const handleSaveMilestone = async () => {
        if (!userId || !childId) return;
        if (!formData.milestoneName || !formData.category) { alert("Milestone Name and Category are required."); return; }
        if (formData.isAchieved && !formData.achievedDate) formData.achievedDate = formatDate(new Date());
        if (!formData.isAchieved) formData.achievedDate = undefined;

        const newMilestone: MilestoneEntry = {
            id: editingMilestone?.id || `${childId}_${Date.now().toString()}`, user_id: userId, childId, milestoneName: formData.milestoneName!,
            category: formData.category!, achievedDate: formData.achievedDate, isAchieved: formData.isAchieved || false,
            expectedDateRange: formData.expectedDateRange, tips: formData.tips, notes: formData.notes,
        };
        
        const updatedMilestones = editingMilestone ? milestones.map(m => m.id === newMilestone.id ? newMilestone : m) : [...milestones, newMilestone];
        await babyCareService.saveMilestones(userId, childId, updatedMilestones);
        setMilestones(updatedMilestones);
        
        if (newMilestone.isAchieved && (!editingMilestone || !editingMilestone.isAchieved)) {
           awardPoints(userId, ActivityTypeForGamification.LOG_BABY_MILESTONE, `Logged milestone: ${newMilestone.milestoneName}`);
           incrementLogCount(userId, ActivityTypeForGamification.LOG_BABY_MILESTONE);
           checkAndAwardBadges(userId, ActivityTypeForGamification.LOG_BABY_MILESTONE);
        }
        setIsModalOpen(false);
    };
    
    const toggleAchieved = async (milestoneId: string) => {
        if (!userId || !childId) return;
        const milestoneToUpdate = milestones.find(m => m.id === milestoneId);
        if (!milestoneToUpdate) return;

        const nowAchieved = !milestoneToUpdate.isAchieved;
        const updatedMilestone = {
            ...milestoneToUpdate, isAchieved: nowAchieved, 
            achievedDate: nowAchieved ? (milestoneToUpdate.achievedDate || formatDate(new Date())) : undefined
        };
        const updatedMilestones = milestones.map(m => m.id === milestoneId ? updatedMilestone : m);
        await babyCareService.saveMilestones(userId, childId, updatedMilestones);
        setMilestones(updatedMilestones);

        if (updatedMilestone.isAchieved && !milestoneToUpdate.isAchieved) {
           awardPoints(userId, ActivityTypeForGamification.LOG_BABY_MILESTONE, `Achieved milestone: ${updatedMilestone.milestoneName}`);
           incrementLogCount(userId, ActivityTypeForGamification.LOG_BABY_MILESTONE);
           checkAndAwardBadges(userId, ActivityTypeForGamification.LOG_BABY_MILESTONE);
        }
    };

    const handleDeleteMilestone = async (milestoneId: string) => {
        if (!userId || !childId) return;
        if (window.confirm("Are you sure you want to delete this milestone? This is for custom-added milestones only.")) {
            const isMock = MOCK_MILESTONES_CHECKLIST.some(mock => `${childId}_${mock.milestoneName.replace(/\s+/g, '_')}` === milestoneId);
            if(isMock && !milestones.find(m => m.id === milestoneId)?.notes) { 
                alert("Default checklist items cannot be easily deleted if unedited. Mark as not achieved or edit notes instead.");
                return;
            }
            const updated = milestones.filter(m => m.id !== milestoneId);
            await babyCareService.saveMilestones(userId, childId, updated);
            setMilestones(updated);
        }
    };
    
     if (isLoading) return <p className="text-textSecondary text-center py-4">Loading milestones...</p>;
     return (
        <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
                 <h4 className="text-lg font-semibold text-textPrimary">Developmental Milestones</h4>
                 <button onClick={() => openModal()} className="bg-primary text-white px-3 py-1.5 rounded-md text-sm flex items-center space-x-1">
                    <PlusIcon className="w-4 h-4"/> Add Custom Milestone
                </button>
            </div>
            {milestones.length === 0 && <p className="text-textSecondary text-center py-4">No milestones tracked yet. You can add custom ones or they will populate from a checklist soon.</p>}
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                {MILESTONE_CATEGORIES.map(category => (
                    <section key={category}>
                        <h5 className="text-md font-semibold text-primary mb-2 sticky top-0 bg-background py-1">{category}</h5>
                        <ul className="space-y-2">
                            {milestones.filter(m => m.category === category).sort((a,b) => (a.expectedDateRange?.start || '').localeCompare(b.expectedDateRange?.start || '')).map(milestone => (
                                <li key={milestone.id} className={`p-3 rounded-lg shadow-sm ${milestone.isAchieved ? 'bg-green-50' : 'bg-slate-50'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-grow">
                                            <label className="flex items-center cursor-pointer">
                                                <input type="checkbox" checked={milestone.isAchieved} onChange={() => toggleAchieved(milestone.id)} className="h-4 w-4 text-primary rounded border-slate-300 focus:ring-primary mr-2"/>
                                                <span className={`text-sm ${milestone.isAchieved ? 'line-through text-slate-500' : 'text-textPrimary'}`}>{milestone.milestoneName}</span>
                                            </label>
                                            {milestone.isAchieved && milestone.achievedDate && <p className="text-xs text-green-700 ml-6">Achieved: {new Date(milestone.achievedDate).toLocaleDateString()}</p>}
                                            {!milestone.isAchieved && milestone.expectedDateRange && <p className="text-xs text-slate-500 ml-6">Expected: {milestone.expectedDateRange.start} - {milestone.expectedDateRange.end}</p>}
                                            {milestone.notes && <p className="text-xs italic text-slate-600 ml-6 mt-0.5">Note: {milestone.notes}</p>}
                                        </div>
                                        <div className="flex space-x-1 flex-shrink-0">
                                            <button onClick={() => openModal(milestone)} className="p-1 text-blue-600 hover:text-blue-800" aria-label="Edit milestone"><EditIcon className="w-3.5 h-3.5"/></button>
                                            <button onClick={() => handleDeleteMilestone(milestone.id)} className="p-1 text-red-600 hover:text-red-800" aria-label="Delete milestone"><TrashIcon className="w-3.5 h-3.5"/></button>
                                        </div>
                                    </div>
                                </li>
                             ))}
                        </ul>
                    </section>
                ))}
            </div>
            <AppModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingMilestone ? "Edit Milestone" : "Add Custom Milestone"}
                primaryActionText={editingMilestone ? "Save Changes" : "Add Milestone"}
                onPrimaryAction={handleSaveMilestone}
                size="lg"
            >
                <div className="space-y-3">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Milestone Name</label><input type="text" value={formData.milestoneName || ''} onChange={e => setFormData(p => ({...p, milestoneName: e.target.value}))} className="w-full p-2 border rounded-md" required/></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value as MilestoneCategory}))} className="w-full p-2 border rounded-md" required>
                        {MILESTONE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select></div>
                    <div className="flex items-center"><input type="checkbox" checked={formData.isAchieved || false} onChange={e => setFormData(p => ({...p, isAchieved: e.target.checked}))} className="h-4 w-4 mr-2 rounded text-primary" /><label className="block text-sm font-medium text-gray-700 mb-1 pt-0.5">Achieved</label></div>
                    {formData.isAchieved && <div><label className="block text-sm font-medium text-gray-700 mb-1">Achieved Date</label><input type="date" value={formData.achievedDate || ''} onChange={e => setFormData(p => ({...p, achievedDate: e.target.value}))} className="w-full p-2 border rounded-md" /></div>}
                    <div>
                        <label htmlFor="milestoneNotes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea id="milestoneNotes" name="notes" value={formData.notes || ''} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} rows={2} className="w-full p-2 border rounded-md" />
                    </div>
                </div>
            </AppModal>
        </div>
    );
};

const HealthView: React.FC<{ childId: string, userId: string }> = ({ childId, userId }) => {
    const [vaccinations, setVaccinations] = useState<VaccinationEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
      if (!userId || !childId) return;
      setIsLoading(true);
      babyCareService.getVaccinations(userId, childId)
        .then(data => setVaccinations(data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }, [userId, childId]);

    if (isLoading) return <p>Loading health records...</p>;

    return (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-textPrimary">Health Records</h4>
            <section>
                <h5 className="font-semibold">Vaccination Schedule</h5>
                <p className="text-xs text-textSecondary mb-2">This is a mock schedule based on IAP. Consult your pediatrician for official schedule.</p>
                <ul className="space-y-2">
                    {MOCK_VACCINE_SCHEDULE.map(vaccineInfo => {
                        const administered = vaccinations.find(v => v.vaccineName.includes(vaccineInfo.name.split(' - ')[0]));
                        return (
                            <li key={vaccineInfo.name} className={`p-2 rounded-md ${administered ? 'bg-green-100' : 'bg-slate-100'}`}>
                                <p className="text-sm font-medium">{vaccineInfo.name} <span className="text-xs font-normal"> (Due: {vaccineInfo.ageDue})</span></p>
                                {administered ? 
                                    <p className="text-xs text-green-700">Administered on: {new Date(administered.administeredDate).toLocaleDateString()}</p>
                                    : <p className="text-xs text-red-600">Pending</p>
                                }
                            </li>
                        )
                    })}
                </ul>
                <p className="text-xs text-center text-slate-400 mt-4">Full vaccination management (adding/editing records) is coming soon.</p>
            </section>
        </div>
    );
};

const MyFirstsView: React.FC = () => {
    return (
        <div className="p-4 bg-surface rounded-lg shadow">
            <h4 className="text-lg font-semibold">My Firsts Journal</h4>
            <p className="text-sm text-textSecondary mt-2">A special place to record and cherish all of your baby's "firsts" - first smile, first word, first steps, and more. This feature is coming soon!</p>
        </div>
    );
};

const BabyCareResourcesView: React.FC = () => {
    return (
        <div className="p-4 bg-surface rounded-lg shadow">
            <h4 className="text-lg font-semibold">Parenting Resources</h4>
            <p className="text-sm text-textSecondary mt-2">A library of articles and guides on various baby care topics like sleep training, common illnesses, safety, and more. This feature is coming soon!</p>
        </div>
    );
};


const BabyCarePage: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || '';
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  const [activeTab, setActiveTab] = useState<BabyCareTab>('dashboard');

  const loadFamilyMembers = useCallback(async () => {
    if (currentUser) {
      setIsLoadingMembers(true);
      try {
        const members = await familyMemberService.getFamilyMembers(currentUser.id, currentUser.user_metadata.name || 'User');
        setFamilyMembers(members);
        const eligibleChildren = members.filter(member => {
            if (!member.dateOfBirth) return false;
            const birthDate = new Date(member.dateOfBirth);
            const ageInMilliseconds = new Date().getTime() - birthDate.getTime();
            const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
            return ageInYears < BABY_AGE_THRESHOLD_YEARS && 
                   (member.relationshipToUser?.toLowerCase().includes('child') || 
                    member.relationshipToUser?.toLowerCase().includes('son') || 
                    member.relationshipToUser?.toLowerCase().includes('daughter'));
        });
        if (eligibleChildren.length > 0 && !selectedChildId) {
            setSelectedChildId(eligibleChildren[0].id);
        }
      } catch (err) {
        console.error("Failed to load family members for Baby Care:", err);
      } finally {
        setIsLoadingMembers(false);
      }
    }
  }, [currentUser, selectedChildId]);

  useEffect(() => {
    loadFamilyMembers();
  }, [loadFamilyMembers]);

  // Effect to handle tab switching from sessionStorage (e.g., from Rewards page)
  useEffect(() => {
    const targetTab = sessionStorage.getItem('babyCareTargetTab');
    if (targetTab) {
      setActiveTab(targetTab as BabyCareTab);
      sessionStorage.removeItem('babyCareTargetTab');
    }
  }, []);

  const selectedChildProfile = useMemo(() => {
    return familyMembers.find(m => m.id === selectedChildId) || null;
  }, [familyMembers, selectedChildId]);

  const renderTabContent = () => {
    if (!selectedChildId || !userId) {
        return <p className="text-center text-textSecondary p-6">Please select a child to see their details.</p>;
    }

    switch (activeTab) {
      case 'dashboard': return <BabyDashboardView childId={selectedChildId} userId={userId} />;
      case 'daily_logs': return <DailyLogsView childId={selectedChildId} userId={userId} />;
      case 'growth': return <GrowthTrackerView childId={selectedChildId} userId={userId}/>;
      case 'milestones': return <MilestonesView childId={selectedChildId} userId={userId}/>;
      case 'health': return <HealthView childId={selectedChildId} userId={userId}/>;
      case 'nutrition': return <BabyNutritionMainView childId={selectedChildId} childProfile={selectedChildProfile}/>;
      case 'my_firsts': return <MyFirstsView />;
      case 'resources': return <BabyCareResourcesView />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3">
            <BabyIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gentle-pastel-blue" />
            <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary">Baby Care Hub</h2>
        </div>
      </div>
      
      <ChildSelector 
        familyMembers={familyMembers}
        selectedChildId={selectedChildId}
        onSelectChild={setSelectedChildId}
        isLoading={isLoadingMembers}
      />

      {selectedChildId ? (
        <>
            <div role="tablist" className="border-b border-slate-200 flex flex-wrap -mb-px overflow-x-auto">
                <TabButton tabName="dashboard" currentTab={activeTab} onClick={() => setActiveTab('dashboard')}>Dashboard</TabButton>
                <TabButton tabName="daily_logs" currentTab={activeTab} onClick={() => setActiveTab('daily_logs')}>Daily Logs</TabButton>
                <TabButton tabName="nutrition" currentTab={activeTab} onClick={() => setActiveTab('nutrition')}>Nutrition</TabButton>
                <TabButton tabName="growth" currentTab={activeTab} onClick={() => setActiveTab('growth')}>Growth</TabButton>
                <TabButton tabName="milestones" currentTab={activeTab} onClick={() => setActiveTab('milestones')}>Milestones</TabButton>
                <TabButton tabName="health" currentTab={activeTab} onClick={() => setActiveTab('health')} icon={<HeartbeatIcon className="w-4 h-4 mr-1 hidden sm:inline-block"/>}>Health</TabButton>
                <TabButton tabName="my_firsts" currentTab={activeTab} onClick={() => setActiveTab('my_firsts')} icon={<StarIcon className="w-4 h-4 mr-1 hidden sm:inline-block"/>}>My Firsts</TabButton>
                <TabButton tabName="resources" currentTab={activeTab} onClick={() => setActiveTab('resources')} icon={<BookOpenIcon className="w-4 h-4 mr-1 hidden sm:inline-block"/>}>Resources</TabButton>
            </div>
            <div className="mt-0 py-4">
                {renderTabContent()}
            </div>
        </>
      ) : null }
    </div>
  );
};

export default BabyCarePage;