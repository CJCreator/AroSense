import { supabase } from '../src/integrations/supabase/client';
import { Profile, ProfileInput, FamilyMember, FamilyMemberInput } from '../types/phase1Types';
import { validateUserId, validateId, sanitizeForLog } from '../utils/securityUtils';

// =============================================
// PROFILE MANAGEMENT
// =============================================

export const getProfile = async (userId: string): Promise<Profile | null> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', validatedUserId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    } catch (error) {
        console.error('Failed to get profile:', sanitizeForLog(error));
        throw new Error('Failed to get profile');
    }
};

export const createProfile = async (userId: string, profileData: ProfileInput): Promise<Profile> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('profiles')
            .insert({ ...profileData, user_id: validatedUserId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to create profile:', sanitizeForLog(error));
        throw new Error('Failed to create profile');
    }
};

export const updateProfile = async (userId: string, profileData: Partial<ProfileInput>): Promise<Profile> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('user_id', validatedUserId)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) throw new Error('No profile found to update');
        return data;
    } catch (error) {
        console.error('Failed to update profile:', sanitizeForLog(error));
        throw new Error('Failed to update profile');
    }
};

// =============================================
// FAMILY MEMBER MANAGEMENT
// =============================================

export const getFamilyMembers = async (userId: string): Promise<FamilyMember[]> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('family_members')
            .select('*')
            .eq('user_id', validatedUserId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Failed to get family members:', sanitizeForLog(error));
        throw new Error('Failed to get family members');
    }
};

export const getFamilyMember = async (userId: string, memberId: string): Promise<FamilyMember | null> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedMemberId = validateId(memberId);
        
        const { data, error } = await supabase
            .from('family_members')
            .select('*')
            .eq('user_id', validatedUserId)
            .eq('id', validatedMemberId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    } catch (error) {
        console.error('Failed to get family member:', sanitizeForLog(error));
        throw new Error('Failed to get family member');
    }
};

export const addFamilyMember = async (userId: string, memberData: FamilyMemberInput): Promise<FamilyMember> => {
    try {
        const validatedUserId = validateUserId(userId);
        
        const { data, error } = await supabase
            .from('family_members')
            .insert({ ...memberData, user_id: validatedUserId })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Failed to add family member:', sanitizeForLog(error));
        throw new Error('Failed to add family member');
    }
};

export const updateFamilyMember = async (userId: string, memberId: string, memberData: Partial<FamilyMemberInput>): Promise<FamilyMember> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedMemberId = validateId(memberId);
        
        const { data, error } = await supabase
            .from('family_members')
            .update(memberData)
            .eq('user_id', validatedUserId)
            .eq('id', validatedMemberId)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) throw new Error('No family member found to update');
        return data;
    } catch (error) {
        console.error('Failed to update family member:', sanitizeForLog(error));
        throw new Error('Failed to update family member');
    }
};

export const deleteFamilyMember = async (userId: string, memberId: string): Promise<void> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedMemberId = validateId(memberId);
        
        // Soft delete by setting is_active to false
        const { error } = await supabase
            .from('family_members')
            .update({ is_active: false })
            .eq('user_id', validatedUserId)
            .eq('id', validatedMemberId);
        
        if (error) throw error;
    } catch (error) {
        console.error('Failed to delete family member:', sanitizeForLog(error));
        throw new Error('Failed to delete family member');
    }
};