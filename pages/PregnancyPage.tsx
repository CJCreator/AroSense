import React, { useState, useEffect, useMemo } from 'react';
import PregnantWomanIcon from '../components/icons/PregnantWomanIcon.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import EditIcon from '../components/icons/EditIcon.tsx';
import TrashIcon from '../components/icons/TrashIcon.tsx';
import {
    PregnancyProfile, PregnancySymptomEntry, WeightLogEntry, BloodPressureLogEntry,
    KickCountSession, PrenatalAppointment,
    PREGNANCY_COMMON_SYMPTOMS, MOOD_OPTIONS
} from '../types.ts';

type ActivePregnancyTab = 'progress' | 'symptoms' | 'vitals' | 'fetal' | 'appointments' | 'resources';

const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const formatTime = (date: Date): string => date.toTimeString().split(' ')[0].substring(0,5); // HH:MM

// Helper to calculate weeks between two dates
const calculateWeeksBetween = (startDateStr: string, endDateStr: string): number => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
};

const TabButton: React.FC<{tabName: ActivePregnancyTab, currentTab: ActivePregnancyTab, onClick: () => void, children: React.ReactNode}> = 
  ({tabName, currentTab, onClick, children}) => (
    <button
        onClick={onClick}
        className={`px-3 py-2.5 text-sm font-medium rounded-t-lg transition-colors
                    ${currentTab === tabName 
                        ? 'bg-surface text-primary border-b-2 border-primary shadow-sm' 
                        : 'text-textSecondary hover:text-primary hover:bg-slate-50'}`}
        role="tab"
        aria-selected={currentTab === tabName}
    >
        {children}
    </button>
);

// --- Progress Tab ---
const ProgressView: React.FC<{profile: PregnancyProfile | null, onUpdateProfile: (data: Partial<PregnancyProfile>) => void}> = ({ profile, onUpdateProfile}) => {
    const [lmpInput, setLmpInput] = useState(profile?.lmp || '');
    const [eddInput, setEddInput] = useState(profile?.edd || '');

    const pregnancyWeek = useMemo(() => {
        if (profile?.lmp) {
            return calculateWeeksBetween(profile.lmp, formatDate(new Date()));
        } else if (profile?.edd) {
            const today = new Date();
            const weeksRemaining = calculateWeeksBetween(formatDate(today), profile.edd);
            return 40 - weeksRemaining;
        }
        return null;
    }, [profile]);

    const trimester = useMemo(() => {
        if (pregnancyWeek === null) return null;
        if (pregnancyWeek <= 13) return 1;
        if (pregnancyWeek <= 27) return 2;
        if (pregnancyWeek <= 42) return 3; // Up to 42 weeks
        return null;
    }, [pregnancyWeek]);

    const handleUpdate = () => {
        onUpdateProfile({ lmp: lmpInput || undefined, edd: eddInput || undefined });
    };
    
    // Mock week-by-week data
    const weeklyInfo = pregnancyWeek !== null && pregnancyWeek > 0 && pregnancyWeek <= 40 ? 
        `You are in week ${pregnancyWeek}. Baby is about the size of a [fruit/vegetable for week ${pregnancyWeek}]. Common changes this week include [common changes for week ${pregnancyWeek}].` 
        : "Please enter your LMP or EDD to see weekly progress.";

    return (
        <div className="space-y-4 p-4 bg-surface rounded-lg shadow">
            <h4 className="text-lg font-semibold">Pregnancy Journey</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="lmp" className="block text-sm font-medium text-textSecondary">Last Menstrual Period (LMP)</label>
                    <input type="date" id="lmp" value={lmpInput} onChange={e => setLmpInput(e.target.value)} className="w-full p-2 border rounded-md bg-white"/>
                </div>
                <div>
                    <label htmlFor="edd" className="block text-sm font-medium text-textSecondary">Estimated Due Date (EDD)</label>
                    <input type="date" id="edd" value={eddInput} onChange={e => setEddInput(e.target.value)} className="w-full p-2 border rounded-md bg-white"/>
                </div>
            </div>
            <button onClick={handleUpdate} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark text-sm">Update Dates</button>

            {pregnancyWeek !== null && pregnancyWeek >= 0 && (
                <div className="mt-4 p-4 bg-primary-light text-primary-dark rounded-md">
                    <p className="font-semibold">Current Week: {pregnancyWeek} (Trimester {trimester || 'N/A'})</p>
                    {profile?.edd && <p>Estimated Due Date: {new Date(profile.edd).toLocaleDateString()}</p>}
                </div>
            )}
            <div className="mt-4 p-3 bg-slate-50 rounded-md">
                <h5 className="font-semibold mb-1">This Week's Overview:</h5>
                <p className="text-sm text-textSecondary">{weeklyInfo}</p>
                <p className="text-xs mt-2 text-slate-400">(Detailed weekly information and visuals will be available in future updates.)</p>
            </div>
        </div>
    );
};

// --- Symptoms Tab --- (Similar to WomensCare SymptomLogView, but uses PREGNANCY_COMMON_SYMPTOMS)
const PregnancySymptomView: React.FC = () => {
    const [symptomsLog, setSymptomsLog] = useState<PregnancySymptomEntry[]>(() => JSON.parse(localStorage.getItem('pregnancy_symptomsLog') || '[]'));
    const [showModal, setShowModal] = useState(false);
    const [editingLog, setEditingLog] = useState<PregnancySymptomEntry | undefined>(undefined);
    const [formData, setFormData] = useState<Partial<PregnancySymptomEntry>>({ date: formatDate(new Date()), symptoms: [], moods: [] });

    useEffect(() => { localStorage.setItem('pregnancy_symptomsLog', JSON.stringify(symptomsLog)); }, [symptomsLog]);

    const handleOpenModal = (log?: PregnancySymptomEntry) => {
        setEditingLog(log);
        setFormData(log ? {...log} : { date: formatDate(new Date()), symptoms: [], moods: [], severity: 'Mild' });
        setShowModal(true);
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleCheckboxChange = (itemName: string, type: 'symptoms' | 'moods') => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type]?.includes(itemName) ? prev[type]?.filter(s => s !== itemName) : [...(prev[type] || []), itemName]
        }));
    };
    const handleSubmit = () => {
        const finalLog = { ...formData, id: editingLog?.id || Date.now().toString() } as PregnancySymptomEntry;
        setSymptomsLog(prev => editingLog ? prev.map(l => l.id === finalLog.id ? finalLog : l) : [...prev, finalLog]);
        setShowModal(false);
    };
    const handleDelete = (id: string) => {
      if(window.confirm("Delete this log?")) setSymptomsLog(prev => prev.filter(l => l.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">Symptom Tracker</h4>
                <button onClick={() => handleOpenModal()} className="bg-primary text-white px-3 py-1.5 rounded-md text-sm flex items-center space-x-1"><PlusIcon className="w-4 h-4"/>Log Symptoms</button>
            </div>
            {symptomsLog.length === 0 && <p className="text-center text-textSecondary text-sm py-3">No symptoms logged.</p>}
            <ul className="space-y-2 max-h-80 overflow-y-auto">
                {symptomsLog.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                    <li key={log.id} className="p-3 bg-surface rounded-md shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-sm">{new Date(log.date).toLocaleDateString()} {log.severity && <span className="text-xs bg-slate-200 px-1 rounded-full ml-1">{log.severity}</span>}</p>
                                {log.symptoms.length > 0 && <p className="text-xs">Symptoms: {log.symptoms.join(', ')}</p>}
                                {log.moods && log.moods.length > 0 && <p className="text-xs">Moods: {log.moods.join(', ')}</p>}
                                {log.notes && <p className="text-xs italic">Notes: {log.notes}</p>}
                            </div>
                            <div className="flex space-x-1">
                                <button onClick={() => handleOpenModal(log)} className="p-1 text-blue-500"><EditIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(log.id)} className="p-1 text-red-500"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
                    <div className="bg-surface p-5 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h5 className="text-md font-semibold mb-3">{editingLog ? 'Edit' : 'Log'} Symptoms</h5>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="pregSymptomDate" className="block text-sm font-medium text-textSecondary mb-1">Date</label>
                                <input type="date" id="pregSymptomDate" name="date" value={formData.date || ''} onChange={handleChange} className="w-full p-2 border rounded-md bg-white"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Symptoms:</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-1 max-h-28 overflow-y-auto">
                                    {PREGNANCY_COMMON_SYMPTOMS.map(s => <label key={s} className="text-xs flex items-center"><input type="checkbox" className="mr-1 rounded text-primary" checked={formData.symptoms?.includes(s)} onChange={() => handleCheckboxChange(s, 'symptoms')}/>{s}</label>)}
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-medium">Moods:</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-1 max-h-28 overflow-y-auto">
                                    {MOOD_OPTIONS.map(s => <label key={s} className="text-xs flex items-center"><input type="checkbox" className="mr-1 rounded text-primary" checked={formData.moods?.includes(s)} onChange={() => handleCheckboxChange(s, 'moods')}/>{s}</label>)}
                                </div>
                            </div>
                            <select name="severity" value={formData.severity || ''} onChange={handleChange} className="w-full p-2 border rounded-md text-sm bg-white">
                                <option value="">Severity (Optional)</option>
                                <option value="Mild">Mild</option><option value="Moderate">Moderate</option><option value="Severe">Severe</option>
                            </select>
                            <textarea name="notes" placeholder="Notes" value={formData.notes || ''} onChange={handleChange} rows={2} className="w-full p-2 border rounded-md text-sm bg-white"/>
                        </div>
                        <div className="flex justify-end space-x-2 mt-3">
                            <button onClick={() => setShowModal(false)} className="px-3 py-1 text-xs bg-slate-200 rounded">Cancel</button>
                            <button onClick={handleSubmit} className="px-3 py-1 text-xs bg-primary text-white rounded">{editingLog ? 'Save' : 'Log'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Vitals Tab --- (Weight, BP, Glucose)
const VitalsView: React.FC = () => {
    const [weightLogs, setWeightLogs] = useState<WeightLogEntry[]>(() => JSON.parse(localStorage.getItem('pregnancy_weightLogs') || '[]'));
    const [bpLogs, setBpLogs] = useState<BloodPressureLogEntry[]>(() => JSON.parse(localStorage.getItem('pregnancy_bpLogs') || '[]'));
    // Glucose logs would be similar if needed

    const [showWeightModal, setShowWeightModal] = useState(false);
    const [weightFormData, setWeightFormData] = useState<Partial<WeightLogEntry>>({date: formatDate(new Date()), unit: 'kg'});
    
    const [showBpModal, setShowBpModal] = useState(false);
    const [bpFormData, setBpFormData] = useState<Partial<BloodPressureLogEntry>>({date: formatDate(new Date())});

    useEffect(() => { localStorage.setItem('pregnancy_weightLogs', JSON.stringify(weightLogs)); }, [weightLogs]);
    useEffect(() => { localStorage.setItem('pregnancy_bpLogs', JSON.stringify(bpLogs)); }, [bpLogs]);

    const handleLogSubmit = (type: 'weight' | 'bp') => {
        if (type === 'weight') {
            const newLog = {...weightFormData, id: Date.now().toString()} as WeightLogEntry;
            if(!newLog.weight || newLog.weight <= 0) { alert("Weight is required and must be positive."); return; }
            setWeightLogs(prev => [...prev, newLog].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setShowWeightModal(false);
            setWeightFormData({date: formatDate(new Date()), unit: 'kg'});
        } else if (type === 'bp') {
            const newLog = {...bpFormData, id: Date.now().toString()} as BloodPressureLogEntry;
            if(!newLog.systolic || !newLog.diastolic) { alert("Systolic and Diastolic values are required."); return; }
            setBpLogs(prev => [...prev, newLog].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setShowBpModal(false);
            setBpFormData({date: formatDate(new Date())});
        }
    };
    
    // Simplified: Delete handlers not implemented for brevity
    
    return (
        <div className="space-y-6">
            {/* Weight Logging */}
            <section>
                <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold">Weight Tracker</h5>
                    <button onClick={() => setShowWeightModal(true)} className="text-primary text-sm flex items-center"><PlusIcon className="w-4 h-4 mr-1"/>Log Weight</button>
                </div>
                {weightLogs.length === 0 && <p className="text-xs text-textSecondary text-center">No weight logged.</p>}
                <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                    {weightLogs.map(log => <li key={log.id} className="p-1 bg-slate-50 rounded">{new Date(log.date).toLocaleDateString()}: {log.weight} {log.unit} {log.notes && `(${log.notes})`}</li>)}
                </ul>
                {showWeightModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
                    <div className="bg-surface p-4 rounded-lg shadow-xl w-full max-w-sm">
                        <h6 className="text-sm font-semibold mb-2">Log Weight</h6>
                        <div>
                            <label htmlFor="pregWeightDate" className="block text-xs font-medium text-textSecondary mb-0.5">Date</label>
                            <input type="date" id="pregWeightDate" value={weightFormData.date || ''} onChange={e=>setWeightFormData(p=>({...p, date:e.target.value}))} className="w-full p-1.5 border rounded mb-2 text-sm bg-white"/>
                        </div>
                        <div className="flex gap-2 mb-2">
                        <input type="number" placeholder="Weight" value={weightFormData.weight || ''} onChange={e=>setWeightFormData(p=>({...p, weight:parseFloat(e.target.value)}))} className="w-full p-1.5 border rounded text-sm bg-white"/>
                         <select value={weightFormData.unit || 'kg'} onChange={e=>setWeightFormData(p=>({...p, unit:e.target.value as 'kg'|'lbs'}))} className="p-1.5 border rounded text-sm bg-white">
                            <option value="kg">kg</option>
                            <option value="lbs">lbs</option>
                        </select>
                        </div>
                        <input type="text" placeholder="Notes (optional)" value={weightFormData.notes || ''} onChange={e=>setWeightFormData(p=>({...p, notes:e.target.value}))} className="w-full p-1.5 border rounded mb-2 text-sm bg-white"/>
                        <div className="flex justify-end space-x-2"><button onClick={()=>setShowWeightModal(false)} className="px-2 py-1 text-xs bg-slate-200 rounded">Cancel</button><button onClick={()=>handleLogSubmit('weight')} className="px-2 py-1 text-xs bg-primary text-white rounded">Log</button></div>
                    </div></div>
                )}
            </section>
             {/* BP Logging */}
            <section>
                <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold">Blood Pressure Tracker</h5>
                    <button onClick={() => setShowBpModal(true)} className="text-primary text-sm flex items-center"><PlusIcon className="w-4 h-4 mr-1"/>Log BP</button>
                </div>
                {bpLogs.length === 0 && <p className="text-xs text-textSecondary text-center">No BP logged.</p>}
                 <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                    {bpLogs.map(log => <li key={log.id} className="p-1 bg-slate-50 rounded">{new Date(log.date).toLocaleDateString()}: {log.systolic}/{log.diastolic} mmHg {log.pulse && `(Pulse: ${log.pulse} bpm)`} {log.notes && `(${log.notes})`}</li>)}
                </ul>
                 {showBpModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
                    <div className="bg-surface p-4 rounded-lg shadow-xl w-full max-w-sm">
                        <h6 className="text-sm font-semibold mb-2">Log Blood Pressure</h6>
                        <div>
                           <label htmlFor="pregBPDate" className="block text-xs font-medium text-textSecondary mb-0.5">Date</label>
                           <input type="date" id="pregBPDate" value={bpFormData.date || ''} onChange={e=>setBpFormData(p=>({...p, date:e.target.value}))} className="w-full p-1.5 border rounded mb-2 text-sm bg-white"/>
                        </div>
                        <div className="flex gap-2 mb-2">
                        <input type="number" placeholder="Systolic" value={bpFormData.systolic || ''} onChange={e=>setBpFormData(p=>({...p, systolic:parseInt(e.target.value)}))} className="w-full p-1.5 border rounded text-sm bg-white"/>
                        <input type="number" placeholder="Diastolic" value={bpFormData.diastolic || ''} onChange={e=>setBpFormData(p=>({...p, diastolic:parseInt(e.target.value)}))} className="w-full p-1.5 border rounded text-sm bg-white"/>
                        </div>
                        <input type="number" placeholder="Pulse (optional)" value={bpFormData.pulse || ''} onChange={e=>setBpFormData(p=>({...p, pulse:parseInt(e.target.value)}))} className="w-full p-1.5 border rounded mb-2 text-sm bg-white"/>
                        <input type="text" placeholder="Notes (optional)" value={bpFormData.notes || ''} onChange={e=>setBpFormData(p=>({...p, notes:e.target.value}))} className="w-full p-1.5 border rounded mb-2 text-sm bg-white"/>
                        <div className="flex justify-end space-x-2"><button onClick={()=>setShowBpModal(false)} className="px-2 py-1 text-xs bg-slate-200 rounded">Cancel</button><button onClick={()=>handleLogSubmit('bp')} className="px-2 py-1 text-xs bg-primary text-white rounded">Log</button></div>
                    </div></div>
                )}
            </section>
            {/* Glucose logging would follow a similar pattern */}
            <p className="text-xs text-center text-slate-400 mt-4">Glucose monitoring and detailed charts coming soon.</p>
        </div>
    );
};

// --- Fetal Monitoring Tab --- (Kick Counter, Contraction Timer)
const FetalMonitoringView: React.FC = () => {
    const [kickSessions, setKickSessions] = useState<KickCountSession[]>(() => JSON.parse(localStorage.getItem('pregnancy_kickSessions') || '[]'));
    // Contraction timer state and logic would be more complex, simplified for now
    const [showKickModal, setShowKickModal] = useState(false);
    const [kickFormData, setKickFormData] = useState<Partial<KickCountSession>>({date: formatDate(new Date()), startTime: formatTime(new Date())});

    useEffect(() => { localStorage.setItem('pregnancy_kickSessions', JSON.stringify(kickSessions)); }, [kickSessions]);

    const handleKickSubmit = () => {
        if (!kickFormData.startTime || !kickFormData.endTime || !kickFormData.kickCount) {
            alert("Please fill all fields for kick count.");
            return;
        }
        const start = new Date(`${kickFormData.date}T${kickFormData.startTime}`);
        const end = new Date(`${kickFormData.date}T${kickFormData.endTime}`);
        if (end <= start) {
            alert("End time must be after start time.");
            return;
        }
        const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

        const newSession = {...kickFormData, id: Date.now().toString(), durationMinutes} as KickCountSession;
        setKickSessions(prev => [...prev, newSession].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setShowKickModal(false);
    };


    return (
        <div className="space-y-6">
            <section>
                 <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold">Kick Counter</h5>
                    <button onClick={() => { setKickFormData({date: formatDate(new Date()), startTime: formatTime(new Date())}); setShowKickModal(true);}} className="text-primary text-sm flex items-center"><PlusIcon className="w-4 h-4 mr-1"/>Log Kick Session</button>
                </div>
                {kickSessions.length === 0 && <p className="text-xs text-textSecondary text-center">No kick sessions logged.</p>}
                 <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                    {kickSessions.map(s => <li key={s.id} className="p-1 bg-slate-50 rounded">{new Date(s.date).toLocaleDateString()} {s.startTime}-{s.endTime}: {s.kickCount} kicks ({s.durationMinutes} min) {s.notes && `(${s.notes})`}</li>)}
                </ul>
                {showKickModal && (
                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
                    <div className="bg-surface p-4 rounded-lg shadow-xl w-full max-w-sm">
                        <h6 className="text-sm font-semibold mb-2">Log Kick Session</h6>
                        <div>
                            <label htmlFor="pregKickDate" className="block text-xs font-medium text-textSecondary mb-0.5">Date</label>
                            <input type="date" id="pregKickDate" value={kickFormData.date || ''} onChange={e=>setKickFormData(p=>({...p, date: e.target.value}))} className="w-full p-1.5 border rounded mb-2 text-sm bg-white"/>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <div>
                            <label htmlFor="pregKickStartTime" className="block text-xs font-medium text-textSecondary mb-0.5">Start Time</label>
                            <input type="time" id="pregKickStartTime" value={kickFormData.startTime || ''} onChange={e=>setKickFormData(p=>({...p, startTime: e.target.value}))} className="w-full p-1.5 border rounded text-sm bg-white"/>
                          </div>
                          <div>
                            <label htmlFor="pregKickEndTime" className="block text-xs font-medium text-textSecondary mb-0.5">End Time</label>
                            <input type="time" id="pregKickEndTime" value={kickFormData.endTime || ''} onChange={e=>setKickFormData(p=>({...p, endTime: e.target.value}))} className="w-full p-1.5 border rounded text-sm bg-white"/>
                          </div>
                        </div>
                        <input type="number" placeholder="Kick Count" value={kickFormData.kickCount || ''} onChange={e=>setKickFormData(p=>({...p, kickCount: parseInt(e.target.value)}))} className="w-full p-1.5 border rounded mb-2 text-sm bg-white"/>
                        <input type="text" placeholder="Notes (optional)" value={kickFormData.notes || ''} onChange={e=>setKickFormData(p=>({...p, notes:e.target.value}))} className="w-full p-1.5 border rounded mb-2 text-sm bg-white"/>
                        <div className="flex justify-end space-x-2"><button onClick={()=>setShowKickModal(false)} className="px-2 py-1 text-xs bg-slate-200 rounded">Cancel</button><button onClick={handleKickSubmit} className="px-2 py-1 text-xs bg-primary text-white rounded">Log</button></div>
                    </div></div>
                )}
            </section>
            <section>
                <h5 className="font-semibold">Contraction Timer</h5>
                <p className="text-xs text-textSecondary text-center mt-2">Contraction timer feature coming soon. Consult your doctor about when to start timing contractions.</p>
            </section>
        </div>
    );
};

// --- Appointments Tab ---
const AppointmentsView: React.FC = () => {
    const [appointments, setAppointments] = useState<PrenatalAppointment[]>(() => JSON.parse(localStorage.getItem('pregnancy_appointments') || '[]'));
    const [showModal, setShowModal] = useState(false);
    const [editingAppt, setEditingAppt] = useState<PrenatalAppointment|undefined>(undefined);
    const [formData, setFormData] = useState<Partial<PrenatalAppointment>>({date: formatDate(new Date()), time: formatTime(new Date())});

    useEffect(() => { localStorage.setItem('pregnancy_appointments', JSON.stringify(appointments)); }, [appointments]);

    const handleOpenModal = (appt?: PrenatalAppointment) => {
        setEditingAppt(appt);
        setFormData(appt ? {...appt} : {date: formatDate(new Date()), time: formatTime(new Date())});
        setShowModal(true);
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(p => ({...p, [e.target.name]: e.target.value}));
    const handleSubmit = () => {
        const finalAppt = {...formData, id: editingAppt?.id || Date.now().toString()} as PrenatalAppointment;
        setAppointments(p => editingAppt ? p.map(a => a.id === finalAppt.id ? finalAppt:a) : [...p, finalAppt].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setShowModal(false);
    };
    const handleDelete = (id:string) => {
      if(window.confirm("Delete appointment?")) setAppointments(p => p.filter(a => a.id !== id));
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">Prenatal Appointments</h4>
                <button onClick={()=>handleOpenModal()} className="bg-primary text-white px-3 py-1.5 rounded-md text-sm flex items-center space-x-1"><PlusIcon className="w-4 h-4"/>Add Appointment</button>
            </div>
            {appointments.length === 0 && <p className="text-center text-textSecondary text-sm py-3">No appointments scheduled.</p>}
            <ul className="space-y-2 max-h-96 overflow-y-auto">
                {appointments.map(appt => (
                    <li key={appt.id} className="p-3 bg-surface rounded-md shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-sm">{new Date(appt.date).toLocaleDateString()} at {appt.time}</p>
                                <p className="text-xs">{appt.doctorOrClinic} - {appt.purpose}</p>
                                {appt.summaryOrNotes && <p className="text-xs italic mt-1">Notes: {appt.summaryOrNotes}</p>}
                            </div>
                             <div className="flex space-x-1">
                                <button onClick={() => handleOpenModal(appt)} className="p-1 text-blue-500"><EditIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(appt.id)} className="p-1 text-red-500"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
             {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
                    <div className="bg-surface p-5 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h5 className="text-md font-semibold mb-3">{editingAppt ? 'Edit' : 'Add'} Appointment</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="pregApptDate" className="block text-xs font-medium text-textSecondary mb-0.5">Date</label>
                                <input type="date" id="pregApptDate" name="date" value={formData.date || ''} onChange={handleChange} className="w-full p-2 border rounded text-sm bg-white"/>
                            </div>
                            <div>
                                <label htmlFor="pregApptTime" className="block text-xs font-medium text-textSecondary mb-0.5">Time</label>
                                <input type="time" id="pregApptTime" name="time" value={formData.time || ''} onChange={handleChange} className="w-full p-2 border rounded text-sm bg-white"/>
                            </div>
                            <input type="text" name="doctorOrClinic" placeholder="Doctor/Clinic" value={formData.doctorOrClinic || ''} onChange={handleChange} className="md:col-span-2 p-2 border rounded text-sm bg-white"/>
                            <input type="text" name="purpose" placeholder="Purpose of visit" value={formData.purpose || ''} onChange={handleChange} className="md:col-span-2 p-2 border rounded text-sm bg-white"/>
                            <textarea name="summaryOrNotes" placeholder="Summary/Notes" value={formData.summaryOrNotes || ''} onChange={handleChange} rows={3} className="md:col-span-2 p-2 border rounded text-sm bg-white"/>
                            <input type="text" name="questionsToAsk" placeholder="Questions to ask" value={formData.questionsToAsk || ''} onChange={handleChange} className="md:col-span-2 p-2 border rounded text-sm bg-white"/>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button onClick={() => setShowModal(false)} className="px-3 py-1 text-xs bg-slate-200 rounded">Cancel</button>
                            <button onClick={handleSubmit} className="px-3 py-1 text-xs bg-primary text-white rounded">{editingAppt ? 'Save' : 'Add'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Resources Tab ---
const PregnancyResourcesView: React.FC = () => {
    // Mock resources
    const resources = [
        { id: 'res1', title: 'Nutrition During Pregnancy', summary: 'What to eat and what to avoid for a healthy pregnancy.', category: 'Diet' },
        { id: 'res2', title: 'Safe Exercises for Each Trimester', summary: 'Stay active safely throughout your pregnancy.', category: 'Fitness' },
        { id: 'res3', title: 'Understanding Labor & Delivery', summary: 'Know what to expect during childbirth.', category: 'Labor' },
        { id: 'res4', title: 'Creating Your Birth Plan', summary: 'A guide to help you outline your preferences.', category: 'Preparation' },
    ];
    return (
        <div className="space-y-4 p-4 bg-surface rounded-lg shadow">
            <h4 className="text-lg font-semibold">Pregnancy Resources</h4>
            <p className="text-sm text-textSecondary">Helpful articles and guides. (Content is for informational purposes only and not medical advice).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resources.map(res => (
                    <div key={res.id} className="p-3 bg-slate-50 rounded-md">
                        <h5 className="font-medium text-primary text-sm">{res.title}</h5>
                        <p className="text-xs text-accent">{res.category}</p>
                        <p className="text-xs text-textSecondary mt-1">{res.summary}</p>
                         <button className="text-xs text-primary hover:underline mt-1">Read more (placeholder)</button>
                    </div>
                ))}
            </div>
             <p className="text-xs text-center text-slate-400 mt-4">More resources including hospital bag checklists and postnatal prep info coming soon.</p>
        </div>
    );
};


const PregnancyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActivePregnancyTab>('progress');
  const [profile, setProfile] = useState<PregnancyProfile | null>(() => JSON.parse(localStorage.getItem('pregnancy_profile') || 'null'));

  useEffect(() => { localStorage.setItem('pregnancy_profile', JSON.stringify(profile));}, [profile]);

  const handleUpdateProfile = (data: Partial<PregnancyProfile>) => {
      setProfile(prev => ({ ...(prev || {id: 'user_pregnancy'}), ...data }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'progress': return <ProgressView profile={profile} onUpdateProfile={handleUpdateProfile} />;
      case 'symptoms': return <PregnancySymptomView />;
      case 'vitals': return <VitalsView />;
      case 'fetal': return <FetalMonitoringView />;
      case 'appointments': return <AppointmentsView />;
      case 'resources': return <PregnancyResourcesView />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3">
            <PregnantWomanIcon className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary">Pregnancy Journey</h2>
        </div>
      </div>

      <div role="tablist" className="border-b border-slate-200 flex flex-wrap -mb-px">
        <TabButton tabName="progress" currentTab={activeTab} onClick={() => setActiveTab('progress')}>Progress</TabButton>
        <TabButton tabName="symptoms" currentTab={activeTab} onClick={() => setActiveTab('symptoms')}>Symptoms</TabButton>
        <TabButton tabName="vitals" currentTab={activeTab} onClick={() => setActiveTab('vitals')}>Vitals</TabButton>
        <TabButton tabName="fetal" currentTab={activeTab} onClick={() => setActiveTab('fetal')}>Fetal Monitoring</TabButton>
        <TabButton tabName="appointments" currentTab={activeTab} onClick={() => setActiveTab('appointments')}>Appointments</TabButton>
        <TabButton tabName="resources" currentTab={activeTab} onClick={() => setActiveTab('resources')}>Resources</TabButton>
      </div>

      <div className="mt-0 py-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PregnancyPage;