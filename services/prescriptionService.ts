import { Prescription } from '../types';
import { supabase } from '../integrations/supabase/client';

export const getPrescriptions = async (userId: string): Promise<Prescription[]> => {
    if (!userId) return [];
    const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Prescription[];
};

export const addPrescription = async (userId: string, prescriptionData: Partial<Prescription>): Promise<Prescription> => {
    if (!userId) throw new Error("User not authenticated.");
    const { data, error } = await supabase
        .from('prescriptions')
        .insert({ ...prescriptionData, user_id: userId })
        .select()
        .single();
    
    if (error) throw error;
    return data as Prescription;
};

export const updatePrescription = async (userId: string, prescriptionId: string, prescriptionData: Partial<Prescription>): Promise<Prescription> => {
    if (!userId) throw new Error("User not authenticated.");
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
    if (!userId) throw new Error("User not authenticated.");
    const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', prescriptionId)
        .eq('user_id', userId);

    if (error) throw error;
};