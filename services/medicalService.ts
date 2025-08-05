import { supabase } from '../src/integrations/supabase/client';
import { 
    MedicalCondition, MedicalConditionInput, 
    Prescription, PrescriptionInput,
    Appointment, AppointmentInput 
} from '../types/phase1Types';
import { validateUserId, validateId, sanitizeForLog } from '../utils/securityUtils';

// =============================================
// MEDICAL CONDITIONS
// =============================================

export const getMedicalConditions = async (userId: string, familyMemberId?: string): Promise<MedicalCondition[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        let query = supabase
            .from('medical_conditions')
            .select('*')
            .eq('user_id', validatedUserId)
            .eq('is_active', true);
        
        if (familyMemberId) {
            const validatedFamilyMemberId = validateId(familyMemberId);
            query = query.eq('family_member_id', validatedFamilyMemberId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get medical conditions:', sanitizeForLog(error));
        throw new Error('Failed to get medical conditions');
    }
};

export const addMedicalCondition = async (userId: string, conditionData: MedicalConditionInput): Promise<MedicalCondition> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('medical_conditions')
            .insert({ ...conditionData, user_id: validatedUserId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to add medical condition:', sanitizeForLog(error));
        throw new Error('Failed to add medical condition');
    }
};

export const updateMedicalCondition = async (userId: string, conditionId: string, conditionData: Partial<MedicalConditionInput>): Promise<MedicalCondition> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedConditionId = validateId(conditionId);
        
        const { data, error } = await supabase
            .from('medical_conditions')
            .update(conditionData)
            .eq('user_id', validatedUserId)
            .eq('id', validatedConditionId)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) throw new Error('No medical condition found to update');
        return data;
    } catch (error) {
        console.error('Failed to update medical condition:', sanitizeForLog(error));
        throw new Error('Failed to update medical condition');
    }
};

export const deleteMedicalCondition = async (userId: string, conditionId: string): Promise<void> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedConditionId = validateId(conditionId);
        
        const { error } = await supabase
            .from('medical_conditions')
            .update({ is_active: false })
            .eq('user_id', validatedUserId)
            .eq('id', validatedConditionId);
        
        if (error) throw error;
    } catch (error) {
        console.error('Failed to delete medical condition:', sanitizeForLog(error));
        throw new Error('Failed to delete medical condition');
    }
};

// =============================================
// PRESCRIPTIONS
// =============================================

export const getPrescriptions = async (userId: string, familyMemberId?: string): Promise<Prescription[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        let query = supabase
            .from('prescriptions')
            .select('*')
            .eq('user_id', validatedUserId)
            .eq('is_active', true);
        
        if (familyMemberId) {
            const validatedFamilyMemberId = validateId(familyMemberId);
            query = query.eq('family_member_id', validatedFamilyMemberId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get prescriptions:', sanitizeForLog(error));
        throw new Error('Failed to get prescriptions');
    }
};

export const addPrescription = async (userId: string, prescriptionData: PrescriptionInput): Promise<Prescription> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('prescriptions')
            .insert({ ...prescriptionData, user_id: validatedUserId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to add prescription:', sanitizeForLog(error));
        throw new Error('Failed to add prescription');
    }
};

export const updatePrescription = async (userId: string, prescriptionId: string, prescriptionData: Partial<PrescriptionInput>): Promise<Prescription> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedPrescriptionId = validateId(prescriptionId);
        
        const { data, error } = await supabase
            .from('prescriptions')
            .update(prescriptionData)
            .eq('user_id', validatedUserId)
            .eq('id', validatedPrescriptionId)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) throw new Error('No prescription found to update');
        return data;
    } catch (error) {
        console.error('Failed to update prescription:', sanitizeForLog(error));
        throw new Error('Failed to update prescription');
    }
};

export const deletePrescription = async (userId: string, prescriptionId: string): Promise<void> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedPrescriptionId = validateId(prescriptionId);
        
        const { error } = await supabase
            .from('prescriptions')
            .update({ is_active: false })
            .eq('user_id', validatedUserId)
            .eq('id', validatedPrescriptionId);
        
        if (error) throw error;
    } catch (error) {
        console.error('Failed to delete prescription:', sanitizeForLog(error));
        throw new Error('Failed to delete prescription');
    }
};

// =============================================
// APPOINTMENTS
// =============================================

export const getAppointments = async (userId: string, familyMemberId?: string): Promise<Appointment[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        let query = supabase
            .from('appointments')
            .select('*')
            .eq('user_id', validatedUserId);
        
        if (familyMemberId) {
            const validatedFamilyMemberId = validateId(familyMemberId);
            query = query.eq('family_member_id', validatedFamilyMemberId);
        }
        
        const { data, error } = await query.order('appointment_date', { ascending: true });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get appointments:', sanitizeForLog(error));
        throw new Error('Failed to get appointments');
    }
};

export const getUpcomingAppointments = async (userId: string): Promise<Appointment[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('user_id', validatedUserId)
            .eq('status', 'scheduled')
            .gte('appointment_date', new Date().toISOString())
            .order('appointment_date', { ascending: true })
            .limit(10);
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get upcoming appointments:', sanitizeForLog(error));
        throw new Error('Failed to get upcoming appointments');
    }
};

export const addAppointment = async (userId: string, appointmentData: AppointmentInput): Promise<Appointment> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('appointments')
            .insert({ ...appointmentData, user_id: validatedUserId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to add appointment:', sanitizeForLog(error));
        throw new Error('Failed to add appointment');
    }
};

export const updateAppointment = async (userId: string, appointmentId: string, appointmentData: Partial<AppointmentInput>): Promise<Appointment> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedAppointmentId = validateId(appointmentId);
        
        const { data, error } = await supabase
            .from('appointments')
            .update(appointmentData)
            .eq('user_id', validatedUserId)
            .eq('id', validatedAppointmentId)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) throw new Error('No appointment found to update');
        return data;
    } catch (error) {
        console.error('Failed to update appointment:', sanitizeForLog(error));
        throw new Error('Failed to update appointment');
    }
};

export const deleteAppointment = async (userId: string, appointmentId: string): Promise<void> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedAppointmentId = validateId(appointmentId);
        
        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('user_id', validatedUserId)
            .eq('id', validatedAppointmentId);
        
        if (error) throw error;
    } catch (error) {
        console.error('Failed to delete appointment:', sanitizeForLog(error));
        throw new Error('Failed to delete appointment');
    }
};