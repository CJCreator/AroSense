import { supabase } from '../src/integrations/supabase/client';
import { EmergencyContact, FamilyMember } from '../types';
import { validateUserId, validateId, sanitizeForLog } from '../utils/securityUtils';

// Import Phase 1 services
import { getProfile } from './profileService';
import { getFamilyMembers } from './familyMemberService';
import { getMedicalConditions } from './medicalService';

// Emergency contact management using Phase 1 schema
export const getEmergencyContacts = async (userId: string): Promise<EmergencyContact[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('emergency_contacts')
            .select('*')
            .eq('user_id', validatedUserId)
            .order('is_primary', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get emergency contacts:', sanitizeForLog(error));
        throw new Error('Failed to get emergency contacts');
    }
};

export const addEmergencyContact = async (userId: string, contactData: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('emergency_contacts')
            .insert({ ...contactData, user_id: validatedUserId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to add emergency contact:', sanitizeForLog(error));
        throw new Error('Failed to add emergency contact');
    }
};

export const updateEmergencyContact = async (userId: string, contactId: string, contactData: Partial<EmergencyContact>): Promise<EmergencyContact> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedContactId = validateId(contactId);
        
        const { data, error } = await supabase
            .from('emergency_contacts')
            .update(contactData)
            .eq('id', validatedContactId)
            .eq('user_id', validatedUserId)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) throw new Error('No emergency contact found to update');
        return data;
    } catch (error) {
        console.error('Failed to update emergency contact:', sanitizeForLog(error));
        throw new Error('Failed to update emergency contact');
    }
};

export const deleteEmergencyContact = async (userId: string, contactId: string): Promise<void> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedContactId = validateId(contactId);
        
        const { error } = await supabase
            .from('emergency_contacts')
            .delete()
            .eq('id', validatedContactId)
            .eq('user_id', validatedUserId);
        
        if (error) throw error;
    } catch (error) {
        console.error('Failed to delete emergency contact:', sanitizeForLog(error));
        throw new Error('Failed to delete emergency contact');
    }
};

// Emergency information aggregation
export interface EmergencyInfo {
    profile: {
        name: string;
        blood_type?: string;
        emergency_contact_name?: string;
        emergency_contact_phone?: string;
        medical_notes?: string;
    };
    familyMembers: FamilyMember[];
    emergencyContacts: EmergencyContact[];
    medicalConditions: Array<{
        condition_name: string;
        severity: string;
        family_member_name?: string;
    }>;
}

export const getEmergencyInfo = async (userId: string): Promise<EmergencyInfo> => {
    try {
        const [profile, familyMembers, emergencyContacts, medicalConditions] = await Promise.all([
            getProfile(userId),
            getFamilyMembers(userId),
            getEmergencyContacts(userId),
            getMedicalConditions(userId)
        ]);
        
        // Get family member names for medical conditions
        const conditionsWithNames = medicalConditions.map(condition => {
            const member = familyMembers.find(fm => fm.id === condition.family_member_id);
            return {
                condition_name: condition.condition_name,
                severity: condition.severity,
                family_member_name: member?.name
            };
        });
        
        return {
            profile: {
                name: profile?.full_name || 'Unknown',
                blood_type: profile?.blood_type,
                emergency_contact_name: profile?.emergency_contact_name,
                emergency_contact_phone: profile?.emergency_contact_phone,
                medical_notes: profile?.medical_notes
            },
            familyMembers,
            emergencyContacts,
            medicalConditions: conditionsWithNames
        };
    } catch (error) {
        console.error('Failed to get emergency info:', sanitizeForLog(error));
        throw new Error('Failed to get emergency info');
    }
};

// Generate QR code data for emergency responders
export const generateEmergencyQRData = async (userId: string): Promise<string> => {
    try {
        const emergencyInfo = await getEmergencyInfo(userId);
        
        const qrData = {
            name: emergencyInfo.profile.name,
            bloodType: emergencyInfo.profile.blood_type,
            emergencyContact: emergencyInfo.profile.emergency_contact_name,
            emergencyPhone: emergencyInfo.profile.emergency_contact_phone,
            medicalNotes: emergencyInfo.profile.medical_notes,
            conditions: emergencyInfo.medicalConditions.map(c => `${c.condition_name} (${c.severity})`),
            contacts: emergencyInfo.emergencyContacts.filter(c => c.is_primary).map(c => ({
                name: c.name,
                phone: c.phone,
                relationship: c.relationship
            }))
        };
        
        return JSON.stringify(qrData);
    } catch (error) {
        console.error('Failed to generate emergency QR data:', sanitizeForLog(error));
        throw new Error('Failed to generate emergency QR data');
    }
};