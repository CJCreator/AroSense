import { Prescription } from '../types';
import { supabase } from '../src/integrations/supabase/client';
import { validateUserId, validateId, sanitizeForLog } from '../utils/securityUtils';

// Import Phase 1 medical service
import { getPrescriptions as getPhase1Prescriptions, addPrescription as addPhase1Prescription, updatePrescription as updatePhase1Prescription, deletePrescription as deletePhase1Prescription } from './medicalService';

export const getPrescriptions = async (userId: string): Promise<Prescription[]> => {
    try {
        const phase1Data = await getPhase1Prescriptions(userId);
        
        // Map Phase 1 data to legacy format
        return phase1Data.map(item => ({
            id: item.id,
            user_id: item.user_id,
            medicationName: item.medication_name,
            dosage: item.dosage,
            frequency: item.frequency,
            prescribingDoctor: item.prescribing_doctor || '',
            pharmacy: item.pharmacy,
            refillDate: item.end_date,
            familyMemberId: item.family_member_id || ''
        }));
    } catch (error) {
        console.error('Failed to get prescriptions:', sanitizeForLog(error));
        return [];
    }
};

export const addPrescription = async (userId: string, prescriptionData: Partial<Prescription>): Promise<Prescription> => {
    try {
        // Map legacy data to Phase 1 format
        const phase1Data = {
            family_member_id: prescriptionData.familyMemberId || undefined,
            medication_name: prescriptionData.medicationName || '',
            dosage: prescriptionData.dosage || '',
            frequency: prescriptionData.frequency || '',
            prescribing_doctor: prescriptionData.prescribingDoctor,
            pharmacy: prescriptionData.pharmacy,
            end_date: prescriptionData.refillDate,
            is_active: true
        };
        
        const result = await addPhase1Prescription(userId, phase1Data);
        
        // Map back to legacy format
        return {
            id: result.id,
            user_id: result.user_id,
            medicationName: result.medication_name,
            dosage: result.dosage,
            frequency: result.frequency,
            prescribingDoctor: result.prescribing_doctor || '',
            pharmacy: result.pharmacy,
            refillDate: result.end_date,
            familyMemberId: result.family_member_id || ''
        };
    } catch (error) {
        console.error('Failed to add prescription:', sanitizeForLog(error));
        throw new Error('Failed to add prescription');
    }
};

export const updatePrescription = async (userId: string, prescriptionId: string, prescriptionData: Partial<Prescription>): Promise<Prescription> => {
    try {
        // Map legacy data to Phase 1 format
        const phase1Data: any = {};
        if (prescriptionData.medicationName) phase1Data.medication_name = prescriptionData.medicationName;
        if (prescriptionData.dosage) phase1Data.dosage = prescriptionData.dosage;
        if (prescriptionData.frequency) phase1Data.frequency = prescriptionData.frequency;
        if (prescriptionData.prescribingDoctor) phase1Data.prescribing_doctor = prescriptionData.prescribingDoctor;
        if (prescriptionData.pharmacy) phase1Data.pharmacy = prescriptionData.pharmacy;
        if (prescriptionData.refillDate) phase1Data.end_date = prescriptionData.refillDate;
        if (prescriptionData.familyMemberId) phase1Data.family_member_id = prescriptionData.familyMemberId;
        
        const result = await updatePhase1Prescription(userId, prescriptionId, phase1Data);
        
        // Map back to legacy format
        return {
            id: result.id,
            user_id: result.user_id,
            medicationName: result.medication_name,
            dosage: result.dosage,
            frequency: result.frequency,
            prescribingDoctor: result.prescribing_doctor || '',
            pharmacy: result.pharmacy,
            refillDate: result.end_date,
            familyMemberId: result.family_member_id || ''
        };
    } catch (error) {
        console.error('Failed to update prescription:', sanitizeForLog(error));
        throw new Error('Failed to update prescription');
    }
};

export const deletePrescription = async (userId: string, prescriptionId: string): Promise<void> => {
    try {
        await deletePhase1Prescription(userId, prescriptionId);
    } catch (error) {
        console.error('Failed to delete prescription:', sanitizeForLog(error));
        throw new Error('Failed to delete prescription');
    }
};