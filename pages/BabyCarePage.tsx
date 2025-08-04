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
import * as babyCareService from '../services/babyCareService.ts';
import AppModal from '../components/AppModal.tsx'; 
import { incrementLogCount, checkAndAwardBadges, awardPoints } from '../utils/gamificationUtils.ts';
import { useAuth } from '../contexts/AuthContext.tsx'; 
import * as familyMemberService from '../services/familyMemberService.ts'; 

// ... ChildSelector, TabButton, and other components remain the same ...

const DailyLogsView: React.FC<{ childId: string, userId: string }> = ({ childId, userId }) => {
    // ... state setup remains the same ...

    const handleFormSubmit = async () => { 
        if (!userId || !childId) return;
        
        try {
            if (activeSubTab === 'feeding') {
                const currentFormData = formData as FeedingLogFormData;
                // validation...
                const finalLogData = { /* ... build log data ... */ };
                if (editingLog) {
                    const updated = await babyCareService.updateFeedingLog(userId, editingLog.id, finalLogData);
                    setFeedingLogs(prev => prev.map(l => l.id === updated.id ? updated : l));
                } else {
                    const added = await babyCareService.addFeedingLog(userId, childId, finalLogData);
                    setFeedingLogs(prev => [added, ...prev]);
                }
            } 
            // ... else if for diaper, sleep ...
            
            setIsModalOpen(false);
            setEditingLog(undefined);
        } catch (error) {
            console.error("Failed to save log:", error);
            alert("Could not save log.");
        }
    };

    const handleDeleteLog = async (logId: string) => {
        if (!userId || !childId) return;
        if(window.confirm("Are you sure you want to delete this log?")) {
            try {
                if (activeSubTab === 'feeding') {
                    await babyCareService.deleteFeedingLog(userId, logId);
                    setFeedingLogs(prev => prev.filter(l => l.id !== logId));
                } 
                // ... else if for diaper, sleep ...
            } catch (error) {
                console.error("Failed to delete log:", error);
                alert("Could not delete log.");
            }
        }
    };

    // ... rest of the component remains the same ...
    return (
        <div>...UI for DailyLogsView...</div>
    );
};

const MilestonesView: React.FC<{ childId: string, userId: string }> = ({ childId, userId }) => {
    // ... state setup ...

    useEffect(() => {
        if (!userId || !childId) return;
        setIsLoading(true);
        babyCareService.getMilestones(userId, childId)
            .then(async (data) => {
                if (data.length === 0) {
                    const initialChecklist = MOCK_MILESTONES_CHECKLIST.map(mock => ({
                        ...mock, isAchieved: false,
                    }));
                    const newMilestones = await babyCareService.bulkAddMilestones(userId, childId, initialChecklist);
                    setMilestones(newMilestones);
                } else {
                    setMilestones(data);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [userId, childId]);

    const handleSaveMilestone = async () => {
        // ... form validation ...
        try {
            if (editingMilestone) {
                const updated = await babyCareService.updateMilestone(userId, editingMilestone.id, formData);
                setMilestones(prev => prev.map(m => m.id === updated.id ? updated : m));
            } else {
                const added = await babyCareService.addMilestone(userId, childId, formData as any);
                setMilestones(prev => [added, ...prev]);
            }
            // ... gamification ...
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save milestone:", error);
            alert("Could not save milestone.");
        }
    };

    const toggleAchieved = async (milestoneId: string) => {
        // ... logic to find and update milestone ...
        try {
            const updated = await babyCareService.updateMilestone(userId, milestoneId, { isAchieved: nowAchieved, achievedDate });
            setMilestones(prev => prev.map(m => m.id === updated.id ? updated : m));
            // ... gamification ...
        } catch (error) {
            console.error("Failed to update milestone:", error);
            alert("Could not update milestone.");
        }
    };

    const handleDeleteMilestone = async (milestoneId: string) => {
        // ... confirmation logic ...
        try {
            await babyCareService.deleteMilestone(userId, milestoneId);
            setMilestones(prev => prev.filter(m => m.id !== milestoneId));
        } catch (error) {
            console.error("Failed to delete milestone:", error);
            alert("Could not delete milestone.");
        }
    };

    // ... rest of the component remains the same ...
    return (
        <div>...UI for MilestonesView...</div>
    );
};

// ... Other views (Growth, Health, etc.) would be refactored similarly ...

const BabyCarePage: React.FC = () => {
  // ... existing state and setup ...
  // The component structure remains the same, but the sub-components now use the new services
  return (
    <div>...UI for BabyCarePage...</div>
  );
};

export default BabyCarePage;