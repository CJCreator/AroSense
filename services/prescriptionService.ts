import { Prescription } from '../types';
import { supabase } from '../src/integrations/supabase/client';
import { validateUserId, validateId } from '../utils/securityUtils';

export const getPrescriptions = async (userId: string): Promise<Prescription[]> => {
    if (!validateUserId(userId)) return [];
    const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Prescription[];
};

export const addPrescription = async (userId: string, prescriptionData: Partial<Prescription>): Promise<Prescription> => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID.");
    const { data, error } = await supabase
        .from('prescriptions')
        .insert({ ...prescriptionData, user_id: userId })
        .select()
        .single();
    
    if (error) throw error;
    return data as Prescription;
};

export const updatePrescription = async (userId: string, prescriptionId: string, prescriptionData: Partial<Prescription>): Promise<Prescription> => {
    if (!validateUserId(userId) || !validateId(prescriptionId)) throw new Error("Invalid user ID or prescription ID.");
    const { data, error } = await supabase
        .from('prescriptions')
        .update(prescriptionData)
        .eq('id', prescriptionId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data as Prescription;
};

export const deletePrescription = async (userId: string, prescriptionId: string): Promise<void> => {
    if (!validateUserId(userId) || !validateId(prescriptionId)) throw new Error("Invalid user ID or prescription ID.");
    const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', prescriptionId)
        .eq('user_id', userId);

    if (error) throw error;
};