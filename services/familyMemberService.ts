import { FamilyMember } from '../types.ts';
import { supabase } from '../src/integrations/supabase/client.ts';
import { DEFAULT_USER_PROFILE_IMAGE } from '../constants.tsx';

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
        console.error("Error creating initial self profile:", error);
        throw error;
    }
    return data as FamilyMember;
};

export const getFamilyMembers = async (userId: string, userNameIfNew: string): Promise<FamilyMember[]> => {
    if (!userId) return [];

    const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching family members:", error);
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
    if (!userId) throw new Error("User ID is required.");

    const memberToInsert = { ...newMemberData, user_id: userId };

    const { data, error } = await supabase
        .from('family_members')
        .insert(memberToInsert)
        .select()
        .single();

    if (error) {
        console.error("Error adding family member:", error);
        throw error;
    }
    return data as FamilyMember;
};

export const updateFamilyMember = async (userId: string, updatedMember: FamilyMember): Promise<FamilyMember> => {
    if (!userId || !updatedMember.id) throw new Error("User ID and Member ID are required.");

    const { id, ...memberToUpdate } = updatedMember;

    const { data, error } = await supabase
        .from('family_members')
        .update(memberToUpdate)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error("Error updating family member:", error);
        throw error;
    }
    return data as FamilyMember;
};

export const deleteFamilyMember = async (userId: string, memberId: string): Promise<void> => {
    if (!userId || !memberId) throw new Error("User ID and Member ID are required.");

    const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId)
        .eq('user_id', userId);

    if (error) {
        console.error("Error deleting family member:", error);
        throw error;
    }
};