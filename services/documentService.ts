import { Document } from '../types';
import { supabase } from '../src/integrations/supabase/client';
import { validateUserId } from '../utils/securityUtils';

const uploadFileToStorage = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
    
    return publicUrl;
};

export const getDocuments = async (userId: string): Promise<Document[]> => {
    if (!validateUserId(userId)) return [];
    
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('upload_date', { ascending: false });
    
    if (error) throw error;
    return data as Document[];
};

export const addDocument = async (userId: string, docData: { name: string; type: string; familyMemberId: string }, file: File): Promise<Document> => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const fileUrl = await uploadFileToStorage(file, userId);
    
    const newDoc = {
        user_id: userId,
        name: docData.name,
        type: docData.type,
        family_member_id: docData.familyMemberId === '0' ? null : docData.familyMemberId,
        file_url: fileUrl,
        version: 1
    };

    const { data, error } = await supabase
        .from('documents')
        .insert(newDoc)
        .select()
        .single();
    
    if (error) throw error;
    return data as Document;
};

export const updateDocument = async (userId: string, docId: string, docData: { name:string; type:string; familyMemberId:string }, file?: File): Promise<Document> => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    let updateData: any = {
        name: docData.name,
        type: docData.type,
        family_member_id: docData.familyMemberId === '0' ? null : docData.familyMemberId
    };
    
    if (file) {
        updateData.file_url = await uploadFileToStorage(file, userId);
        updateData.version = supabase.raw('version + 1');
    }
    
    const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', docId)
        .eq('user_id', userId)
        .select()
        .single();
    
    if (error) throw error;
    return data as Document;
};

export const deleteDocument = async (userId: string, docId: string): Promise<void> => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId)
        .eq('user_id', userId);
    
    if (error) throw error;
};