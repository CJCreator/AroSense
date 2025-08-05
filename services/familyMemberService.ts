import { FamilyMember } from '../types';
import { supabase } from '../src/integrations/supabase/client';
import { DEFAULT_USER_PROFILE_IMAGE } from '../constants';
import { sanitizeForLog, validateUserId, validateId } from '../utils/securityUtils';

// Helper to create the initial 'Self' profile for a new user
const createInitialSelfProfile = async (userId: string, userName: string): Promise<FamilyMember> => {
    const selfProfile: Omit<FamilyMember, 'id'> = {
        user_id: userId,
        name: userName,
        dateOfBirth: '1990-01-01', // Placeholder
        gender: 'Prefer Not to Say' as any,
        relationshipToUser: 'Self',
        profileImageUrl: DEFAULT_USER_PROFILE_IMAGE,
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

export const getFamilyMembers = async (userId: string, userNameIfNew: string): Promise<FamilyMember[]> => {
    if (!validateUserId(userId)) return [];

    const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching family members:", sanitizeForLog(error));
        throw error;
    }

    // If no members exist for the user, create the initial 'Self' profile
    if (data.length === 0) {
        const initialProfile = await createInitialSelfProfile(userId, userNameIfNew);
        return [initialProfile];
    }

    return data as FamilyMember[];
};

export const addFamilyMember = async (userId: string, newMemberData: Omit<FamilyMember, 'id'|'user_id'>): Promise<FamilyMember> => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID.");

    const memberToInsert = { ...newMemberData, user_id: userId };

    const { data, error } = await supabase
        .from('family_members')
        .insert(memberToInsert)
        .select()
        .single();

    if (error) {
        console.error("Error adding family member:", sanitizeForLog(error));
        throw error;
    }
    return data as FamilyMember;
};

export const updateFamilyMember = async (userId: string, updatedMember: FamilyMember): Promise<FamilyMember> => {
    if (!validateUserId(userId) || !validateId(updatedMember.id)) throw new Error("Invalid user ID or member ID.");

    const { id, ...memberToUpdate } = updatedMember;

    const { data, error } = await supabase
        .from('family_members')
        .update(memberToUpdate)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error("Error updating family member:", sanitizeForLog(error));
        throw error;
    }
    return data as FamilyMember;
};

export const deleteFamilyMember = async (userId: string, memberId: string): Promise<void> => {
    if (!validateUserId(userId) || !validateId(memberId)) throw new Error("Invalid user ID or member ID.");

    const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId)
        .eq('user_id', userId);

    if (error) {
        console.error("Error deleting family member:", sanitizeForLog(error));
        throw error;
    }
};