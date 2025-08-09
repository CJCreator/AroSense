import { FamilyMember } from '../types';
import { supabase } from '../src/integrations/supabase/client';
import { DEFAULT_USER_PROFILE_IMAGE } from '../constants';
import { sanitizeForLog, validateUserId, validateId } from '../utils/securityUtils';

// Import Phase 1 service functions
import { getFamilyMembers as getPhase1FamilyMembers, addFamilyMember as addPhase1FamilyMember, updateFamilyMember as updatePhase1FamilyMember, deleteFamilyMember as deletePhase1FamilyMember } from './profileService';

// Helper to create the initial 'Self' profile for a new user
const createInitialSelfProfile = async (userId: string, userName: string): Promise<FamilyMember> => {
    const selfProfile = {
        user_id: userId,
        name: userName,
        date_of_birth: '1990-01-01', // Placeholder
        relationship: 'other',
        is_active: true
    };

    const { data, error } = await supabase
        .from('family_members')
        .insert(selfProfile)
        .select()
        .single();

    if (error) {
        console.error("Error creating initial self profile:", sanitizeForLog(error));
        throw error;
    }
    return data as FamilyMember;
};

export const getFamilyMembers = async (userId: string, userNameIfNew?: string): Promise<FamilyMember[]> => {
    try {
        // Use Phase 1 service with fallback to legacy behavior
        const members = await getPhase1FamilyMembers(userId);
        
        // If no members exist and userNameIfNew provided, create initial profile
        if (members.length === 0 && userNameIfNew) {
            const initialProfile = await createInitialSelfProfile(userId, userNameIfNew);
            return [initialProfile];
        }
        
        return members;
    } catch (error) {
        console.error('Error fetching family members:', sanitizeForLog(error));
        throw error;
    }
};

export const addFamilyMember = async (userId: string, newMemberData: Omit<FamilyMember, 'id'|'user_id'|'created_at'|'updated_at'>): Promise<FamilyMember> => {
    try {
        // Map legacy fields to Phase 1 schema
        const phase1Data = {
            name: newMemberData.name,
            relationship: mapLegacyRelationship(newMemberData.relationshipToUser || 'other'),
            date_of_birth: newMemberData.dateOfBirth || newMemberData.date_of_birth,
            gender: mapLegacyGender(newMemberData.gender),
            blood_type: newMemberData.bloodType || newMemberData.blood_type,
            height_cm: newMemberData.heightCm || newMemberData.height_cm,
            medical_notes: newMemberData.emergencyNotes || newMemberData.medical_notes,
            is_active: true
        };
        
        return await addPhase1FamilyMember(userId, phase1Data);
    } catch (error) {
        console.error('Error adding family member:', sanitizeForLog(error));
        throw error;
    }
};

export const updateFamilyMember = async (userId: string, updatedMember: FamilyMember): Promise<FamilyMember> => {
    try {
        const { id, ...memberData } = updatedMember;
        
        // Map legacy fields to Phase 1 schema
        const phase1Data = {
            name: memberData.name,
            relationship: mapLegacyRelationship(memberData.relationshipToUser || 'other'),
            date_of_birth: memberData.dateOfBirth || memberData.date_of_birth,
            gender: mapLegacyGender(memberData.gender),
            blood_type: memberData.bloodType || memberData.blood_type,
            height_cm: memberData.heightCm || memberData.height_cm,
            medical_notes: memberData.emergencyNotes || memberData.medical_notes
        };
        
        return await updatePhase1FamilyMember(userId, id, phase1Data);
    } catch (error) {
        console.error('Error updating family member:', sanitizeForLog(error));
        throw error;
    }
};

export const deleteFamilyMember = async (userId: string, memberId: string): Promise<void> => {
    try {
        await deletePhase1FamilyMember(userId, memberId);
    } catch (error) {
        console.error('Error deleting family member:', sanitizeForLog(error));
        throw error;
    }
};

// Helper functions to map legacy data to Phase 1 schema
function mapLegacyRelationship(legacy: string): 'child' | 'spouse' | 'parent' | 'sibling' | 'other' {
    const mapping: Record<string, 'child' | 'spouse' | 'parent' | 'sibling' | 'other'> = {
        'Child': 'child',
        'Spouse': 'spouse', 
        'Parent': 'parent',
        'Sibling': 'sibling',
        'Self': 'other',
        'Grandparent': 'other'
    };
    return mapping[legacy] || 'other';
}

function mapLegacyGender(legacy: any): 'male' | 'female' | 'other' | undefined {
    if (typeof legacy === 'string') {
        const mapping: Record<string, 'male' | 'female' | 'other'> = {
            'Male': 'male',
            'Female': 'female',
            'Other': 'other',
            'Prefer Not to Say': 'other'
        };
        return mapping[legacy];
    }
    return undefined;
}