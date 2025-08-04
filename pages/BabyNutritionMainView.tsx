import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FamilyMember, FoodLogEntry, LoggedFoodItem, MealType } from '../types.ts';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import EditIcon from '../components/icons/EditIcon.tsx';
import TrashIcon from '../components/icons/TrashIcon.tsx';
import BookOpenIcon from '../components/icons/BookOpenIcon.tsx';
import * as babyCareService from '../services/babyCareService.ts';
import AppModal from '../components/AppModal.tsx'; 
import { useAuth } from '../contexts/AuthContext.tsx';


type NutritionSubTab = 'guidance_0_6' | 'guidance_6_12' | 'guidance_1_3' | 'food_diary' | 'recipes_articles';

const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const formatTime = (date: Date): string => date.toTimeString().split(' ')[0].substring(0,5); // HH:MM

interface BabyNutritionMainViewProps {
  childId: string;
  childProfile: FamilyMember | null;
}

const NutritionSubTabButton: React.FC<{tabName: NutritionSubTab, currentTab: NutritionSubTab, onClick: () => void, children: React.ReactNode}> = 
  ({tabName, currentTab, onClick, children}) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap
                    ${currentTab === tabName 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'bg-slate-100 text-textSecondary hover:bg-slate-200'}`}
        role="tab"
        aria-selected={currentTab === tabName}
    >
        {children}
    </button>
);


const FoundationalNutritionView: React.FC<{}> = () => {
    return (
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <h3 className="text-lg font-semibold text-primary">Foundational Nutrition (0-6 Months)</h3>
            
            <section>
                <h4 className="text-md font-medium text-textPrimary mb-1">Exclusive Breastfeeding/Formula</h4>
                <p className="text-sm text-textSecondary">
                    The Indian Academy of Pediatrics (IAP) and WHO recommend <strong>exclusive breastfeeding for the first 6 months of life</strong>.
                    Breast milk provides all the nutrients a baby needs during this period.
                </p>
                <p className="text-sm text-textSecondary mt-1">
                    If breastfeeding is not possible or is supplemented, use an appropriate infant formula as advised by your pediatrician.
                </p>
                 <Link to="/baby-care" onClick={() => sessionStorage.setItem('babyCareTargetTab', 'daily_logs')} className="text-sm text-primary hover:underline mt-2 inline-block">
                    Go to Feeding Log to track feeds &raquo;
                </Link>
            </section>

            <section>
                <h4 className="text-md font-medium text-textPrimary mb-1">Tips for Breastfeeding Mothers</h4>
                <ul className="list-disc list-inside text-sm text-textSecondary space-y-1">
                    <li>Eat a balanced and varied diet rich in fruits, vegetables, whole grains, and proteins.</li>
                    <li>Stay well-hydrated by drinking plenty of water.</li>
                    <li>Continue taking prenatal vitamins as advised by your doctor.</li>
                    <li>Ensure adequate rest.</li>
                    <li>Consult your doctor about any dietary restrictions or concerns.</li>
                </ul>
            </section>

            <section>
                <h4 className="text-md font-medium text-textPrimary mb-1">Formula Feeding Best Practices</h4>
                <ul className="list-disc list-inside text-sm text-textSecondary space-y-1">
                    <li>Always choose an infant formula appropriate for your baby's age. <strong>Consult your pediatrician for recommendations.</strong></li>
                    <li>Follow preparation instructions on the formula packaging precisely. Use safe, boiled, and cooled water.</li>
                    <li>Ensure all feeding equipment (bottles, nipples) is properly sterilized before each use.</li>
                    <li>Do not add extra scoops of formula powder or dilute it more than instructed.</li>
                    <li>Discard any leftover formula after a feed.</li>
                </ul>
            </section>
        </div>
    );
};

const FoodDiaryView: React.FC<{childId: string, userId: string}> = ({childId, userId}) => {
    const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<FoodLogEntry | undefined>(undefined);
    const [currentMealType, setCurrentMealType] = useState<MealType>('Breakfast');
    const formId = "foodLogForm";
    
    const [foodItemFormData, setFoodItemFormData] = useState<Partial<LoggedFoodItem & { customFoodName: string }>>({ unit: 'g' });
    const [mealFormData, setMealFormData] = useState<{ date: string; time: string; items: LoggedFoodItem[]; notes?: string; isNewFoodIntroduction?: boolean; newFoodReaction?: FoodLogEntry['newFoodReaction']; newFoodReactionNotes?: string }>({ date: formatDate(new Date()), time: formatTime(new Date()), items: []});

    useEffect(() => {
      if (!userId || !childId) return;
      setIsLoading(true);
      babyCareService.getFoodLogs(userId, childId)
        .then(data => setFoodLogs(data.sort((a,b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }, [userId, childId]);

    const openModal = (mealType: MealType, logToEdit?: FoodLogEntry) => {
        setCurrentMealType(mealType);
        if (logToEdit) {
            setEditingLog(logToEdit);
            setMealFormData({
                date: logToEdit.date, time: logToEdit.time, items: [...logToEdit.items], notes: logToEdit.notes,
                isNewFoodIntroduction: logToEdit.isNewFoodIntroduction, newFoodReaction: logToEdit.newFoodReaction,
                newFoodReactionNotes: logToEdit.newFoodReactionNotes,
            });
        } else {
            setEditingLog(undefined);
            setMealFormData({ date: formatDate(new Date()), time: formatTime(new Date()), items: [] });
        }
        setFoodItemFormData({ unit: 'g', customFoodName: '' }); 
        setIsModalOpen(true);
    };

    const handleAddItemToMeal = () => {
        if (!foodItemFormData.customFoodName && !foodItemFormData.foodItemId) { alert("Please enter a food name..."); return; }
        if (!foodItemFormData.quantity || foodItemFormData.quantity <= 0) { alert("Please enter a valid quantity."); return; }
        
        const newItem: LoggedFoodItem = {
            customFoodName: foodItemFormData.customFoodName, quantity: foodItemFormData.quantity!,
            unit: foodItemFormData.unit as LoggedFoodItem['unit'],
        };
        setMealFormData(prev => ({ ...prev, items: [...prev.items, newItem]}));
        setFoodItemFormData({ unit: 'g', customFoodName: '' }); 
    };

    const handleRemoveItemFromMeal = (index: number) => {
        setMealFormData(prev => ({...prev, items: prev.items.filter((_, i) => i !== index)}));
    };
    
    const handleSaveMealLog = async () => {
        if (!userId || !childId) return;
        if (mealFormData.items.length === 0) { alert("Please add at least one food item."); return; }
        
        const logData = {
            date: mealFormData.date, time: mealFormData.time,
            mealType: currentMealType, items: mealFormData.items, notes: mealFormData.notes,
            isNewFoodIntroduction: mealFormData.isNewFoodIntroduction,
            newFoodReaction: mealFormData.isNewFoodIntroduction ? mealFormData.newFoodReaction : undefined,
            newFoodReactionNotes: mealFormData.isNewFoodIntroduction ? mealFormData.newFoodReactionNotes : undefined,
        };

        try {
            if (editingLog) {
                const updatedLog = await babyCareService.updateFoodLog(userId, editingLog.id, logData);
                setFoodLogs(prevLogs => prevLogs.map(log => log.id === editingLog.id ? updatedLog : log).sort((a,b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime()));
            } else {
                const addedLog = await babyCareService.addFoodLog(userId, childId, logData);
                setFoodLogs(prevLogs => [addedLog, ...prevLogs].sort((a,b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime()));
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save food log:", error);
            alert("Could not save food log.");
        }
    };
    
    const handleDeleteLog = async (logId: string) => {
        if (!userId || !childId) return;
        if (window.confirm("Are you sure you want to delete this meal log?")) {
            try {
                await babyCareService.deleteFoodLog(userId, logId);
                setFoodLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
            } catch (error) {
                console.error("Failed to delete food log:", error);
                alert("Could not delete food log.");
            }
        }
    };

    const groupedLogs = useMemo(() => {
        return foodLogs.reduce((acc, log) => {
            const date = log.date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(log);
            return acc;
        }, {} as Record<string, FoodLogEntry[]>);
    }, [foodLogs]);
    
    const sortedDates = Object.keys(groupedLogs).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());

    if (isLoading) return <p className="text-center text-textSecondary">Loading food diary...</p>;

    return (
        <div className="space-y-6 p-4">
            <h3 className="text-lg font-semibold text-primary">Food Diary</h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {(['Breakfast', 'Lunch', 'Dinner', 'SnackAM'] as MealType[]).map(mealType => (
                    <button 
                        key={mealType} onClick={() => openModal(mealType)}
                        className="w-full bg-primary-light text-primary-dark p-2.5 rounded-md hover:bg-primary hover:text-white transition-colors text-sm font-medium flex items-center justify-center space-x-1.5"
                    > <PlusIcon className="w-4 h-4" /> <span>Log {mealType === 'SnackAM' ? 'Snack' : mealType}</span> </button>
                ))}
            </div>

            {foodLogs.length === 0 ? (
                <p className="text-center text-textSecondary py-4">No food logged yet.</p>
            ) : ( 
                 <div className="space-y-4">
                    {sortedDates.map(date => (
                        <div key={date}>
                            <h4 className="text-md font-semibold text-textPrimary mb-2 border-b pb-1">
                                {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h4>
                            <div className="space-y-3">
                            {groupedLogs[date].map(log => (
                                <div key={log.id} className="p-3 bg-surface rounded-md shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-semibold text-primary">{log.mealType} at {log.time}</p>
                                            <ul className="list-disc list-inside ml-4 text-xs text-textSecondary mt-1">
                                                {log.items.map((item, index) => (
                                                    <li key={index}>
                                                        {item.customFoodName || item.foodItemId} - {item.quantity} {item.unit}
                                                    </li>
                                                ))}
                                            </ul>
                                            {log.notes && <p className="text-xs italic text-slate-500 mt-1">Notes: {log.notes}</p>}
                                            {log.isNewFoodIntroduction && (
                                                <div className="mt-1 p-1.5 bg-yellow-50 text-yellow-700 rounded text-xs">
                                                    <strong>New Food!</strong> Reaction: {log.newFoodReaction || 'N/A'}
                                                    {log.newFoodReactionNotes && <p>Details: {log.newFoodReactionNotes}</p>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col space-y-1 items-end">
                                            <button onClick={() => openModal(log.mealType, log)} className="p-1 text-blue-600 hover:text-blue-800" aria-label="Edit log"><EditIcon className="w-4 h-4"/></button>
                                            <button onClick={() => handleDeleteLog(log.id)} className="p-1 text-red-600 hover:text-red-800" aria-label="Delete log"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <AppModal 
                isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
                title={`${editingLog ? 'Edit' : 'Log'} ${currentMealType}`} 
                primaryActionText={editingLog ? "Save Changes" : "Save Log"}
                primaryActionFormId={formId}
            >
                
                 <form id={formId} onSubmit={(e) => { e.preventDefault(); handleSaveMealLog(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="mealDate" className="block text-sm font-medium text-textSecondary mb-1">Date</label>
                        <input type="date" id="mealDate" value={mealFormData.date} onChange={e => setMealFormData(p => ({...p, date: e.target.value}))} className="w-full p-2 border rounded bg-white" />
                    </div>
                    <div>
                        <label htmlFor="mealTime" className="block text-sm font-medium text-textSecondary mb-1">Time</label>
                        <input type="time" id="mealTime" value={mealFormData.time} onChange={e => setMealFormData(p => ({...p, time: e.target.value}))} className="w-full p-2 border rounded bg-white" />
                    </div>
                </div>

                <div className="border-t border-b py-3 my-3">
                    <h4 className="text-sm font-semibold mb-2 text-textPrimary">Add Food Item to Meal:</h4>
                    <div className="grid grid-cols-1 gap-3">
                         <div>
                            <label htmlFor="customFoodName" className="block text-xs font-medium text-textSecondary mb-1">Food Name</label>
                            <input 
                                type="text" id="customFoodName" placeholder="e.g., Mashed Banana"
                                value={foodItemFormData.customFoodName || ''}
                                onChange={e => setFoodItemFormData(p => ({...p, customFoodName: e.target.value}))}
                                className="w-full p-2 border rounded bg-white text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <label htmlFor="foodQuantity" className="block text-xs font-medium text-textSecondary mb-1">Quantity</label>
                                <input 
                                    type="number" id="foodQuantity" placeholder="e.g., 100"
                                    value={foodItemFormData.quantity || ''}
                                    onChange={e => setFoodItemFormData(p => ({...p, quantity: parseFloat(e.target.value) || undefined }))}
                                    className="w-full p-2 border rounded bg-white text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="foodUnit" className="block text-xs font-medium text-textSecondary mb-1">Unit</label>
                                <input 
                                    type="text" id="foodUnit" placeholder="g, ml, piece" list="commonUnits"
                                    value={foodItemFormData.unit || 'g'}
                                    onChange={e => setFoodItemFormData(p => ({...p, unit: e.target.value}))}
                                    className="w-full p-2 border rounded bg-white text-sm"
                                />
                                <datalist id="commonUnits">
                                    <option value="g" /> <option value="ml" /> <option value="piece" />
                                    <option value="tbsp" /> <option value="tsp" /> <option value="cup" /> <option value="oz" />
                                </datalist>
                            </div>
                        </div>
                        <button type="button" onClick={handleAddItemToMeal} className="w-full justify-center bg-secondary text-textPrimary px-3 py-1.5 rounded-md text-sm hover:bg-secondary-dark flex items-center space-x-1">
                            <PlusIcon className="w-3.5 h-3.5"/> Add Item to Meal
                        </button>
                    </div>
                </div>
                
                {mealFormData.items.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold mb-1 text-textPrimary">Items in this Meal:</h4>
                        <ul className="space-y-1 max-h-32 overflow-y-auto text-xs">
                            {mealFormData.items.map((item, index) => (
                                <li key={index} className="p-1.5 bg-slate-100 rounded flex justify-between items-center">
                                    <span>{item.customFoodName || item.foodItemId} - {item.quantity} {item.unit}</span>
                                    <button type="button" onClick={() => handleRemoveItemFromMeal(index)} className="p-0.5 text-red-500 hover:text-red-700" aria-label="Remove item"><TrashIcon className="w-3 h-3"/></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 <div>
                    <label className="flex items-center text-sm mt-3">
                        <input type="checkbox" checked={mealFormData.isNewFoodIntroduction || false} onChange={e => setMealFormData(p => ({...p, isNewFoodIntroduction: e.target.checked}))} className="mr-2 h-4 w-4 rounded text-primary"/> This meal includes a new food introduction
                    </label>
                </div>
                {mealFormData.isNewFoodIntroduction && (
                    <div className="p-2 border border-yellow-300 bg-yellow-50 rounded mt-2 space-y-2">
                        <div>
                            <label htmlFor="newFoodReaction" className="block text-xs font-medium text-yellow-800 mb-0.5">Reaction to New Food</label>
                            <select id="newFoodReaction" value={mealFormData.newFoodReaction || 'None'} onChange={e => setMealFormData(p => ({...p, newFoodReaction: e.target.value as FoodLogEntry['newFoodReaction']}))} className="w-full p-1.5 border rounded bg-white text-sm">
                                <option value="None">None</option> <option value="Mild">Mild</option> <option value="Moderate">Moderate</option> <option value="Severe">Severe</option>
                            </select>
                        </div>
                        <div>
                             <label htmlFor="newFoodReactionNotes" className="block text-xs font-medium text-yellow-800 mb-0.5">Reaction Details</label>
                            <textarea id="newFoodReactionNotes" value={mealFormData.newFoodReactionNotes || ''} onChange={e => setMealFormData(p => ({...p, newFoodReactionNotes: e.target.value}))} rows={2} className="w-full p-1.5 border rounded bg-white text-sm" placeholder="e.g., slight rash around mouth"/>
                        </div>
                    </div>
                )}
                <div>
                    <label htmlFor="mealNotes" className="block text-sm font-medium text-textSecondary mb-1 mt-3">Overall Meal Notes (Optional)</label>
                    <textarea id="mealNotes" value={mealFormData.notes || ''} onChange={e => setMealFormData(p => ({...p, notes: e.target.value}))} rows={2} className="w-full p-2 border rounded bg-white"/>
                </div>
                </form>
            </AppModal>
        </div>
    );
};

const RecipesArticlesView: React.FC<{}> = () => { 
    return (
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <h3 className="text-lg font-semibold text-primary">Recipes & Educational Articles</h3>
            <p className="text-sm text-textSecondary">
                This section will provide age-appropriate recipes (including Indian baby food), articles on various nutrition topics,
                and guidance on managing fussy eating, portion control, and food safety.
            </p>
            <p className="text-sm text-textSecondary mt-2">
                <BookOpenIcon className="w-5 h-5 inline mr-1 text-primary"/>
                Content coming soon!
            </p>
        </div>
    );
};


const BabyNutritionMainView: React.FC<BabyNutritionMainViewProps> = ({ childId, childProfile }) => {
  const [activeSubTab, setActiveSubTab] = useState<NutritionSubTab>('guidance_0_6');
  const { currentUser } = useAuth();
  const userId = currentUser?.id || '';

  const ageInMonths = useMemo(() => { 
    if (!childProfile?.dateOfBirth) return null;
    const birthDate = new Date(childProfile.dateOfBirth);
    const today = new Date();
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += today.getMonth();
    return months <= 0 ? 0 : months; 
  }, [childProfile]);

   useEffect(() => { 
    if (ageInMonths === null) setActiveSubTab('guidance_0_6'); 
    else if (ageInMonths <= 6) setActiveSubTab('guidance_0_6');
    else if (ageInMonths <= 12) setActiveSubTab('guidance_6_12');
    else setActiveSubTab('guidance_1_3');
  }, [ageInMonths]);


  const renderSubTabContent = () => {
    if (!userId) return <p className="text-textSecondary p-4">User information not available.</p>;
    switch (activeSubTab) {
      case 'guidance_0_6': return <FoundationalNutritionView />;
      case 'food_diary': return <FoodDiaryView childId={childId} userId={userId} />;
      case 'recipes_articles': return <RecipesArticlesView />;
      case 'guidance_6_12': return <div className="p-4 text-textSecondary">Guidance for 6-12 months (complementary feeding, allergy info, meal planning) will be here.</div>;
      case 'guidance_1_3': return <div className="p-4 text-textSecondary">Guidance for 1-3 years (toddler nutrition, key nutrients, foods to limit) will be here.</div>;
      default: return <p>Select a sub-category.</p>;
    }
  };

  return ( 
    <div className="space-y-4">
        <div className="p-4 bg-surface rounded-lg shadow">
            <h2 className="text-xl font-bold text-textPrimary mb-1">
                Baby Nutrition Guide
                {childProfile && <span className="text-base font-normal text-textSecondary"> for {childProfile.name}</span>}
                {ageInMonths !== null && <span className="text-sm font-normal text-accent ml-2">({ageInMonths} months old)</span>}
            </h2>
            <p className="text-sm text-textSecondary mb-4">Age-appropriate guidance and tools for your baby's healthy growth (0-3 years).</p>
             <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-slate-200" role="tablist">
                <NutritionSubTabButton tabName="guidance_0_6" currentTab={activeSubTab} onClick={() => setActiveSubTab('guidance_0_6')}>0-6 Months</NutritionSubTabButton>
                <NutritionSubTabButton tabName="guidance_6_12" currentTab={activeSubTab} onClick={() => setActiveSubTab('guidance_6_12')}>6-12 Months</NutritionSubTabButton>
                <NutritionSubTabButton tabName="guidance_1_3" currentTab={activeSubTab} onClick={() => setActiveSubTab('guidance_1_3')}>1-3 Years</NutritionSubTabButton>
                <NutritionSubTabButton tabName="food_diary" currentTab={activeSubTab} onClick={() => setActiveSubTab('food_diary')}>Food Diary</NutritionSubTabButton>
                <NutritionSubTabButton tabName="recipes_articles" currentTab={activeSubTab} onClick={() => setActiveSubTab('recipes_articles')}>Recipes & Info</NutritionSubTabButton>
            </div>
            <div>
                {renderSubTabContent()}
            </div>
        </div>
    </div>
  );
};

export default BabyNutritionMainView;