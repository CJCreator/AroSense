import { Document } from '../types';
import { supabase } from '../src/integrations/supabase/client';
import { validateUserId, validateId, sanitizeForLog } from '../utils/securityUtils';
import { Document as Phase1Document } from '../types/phase1Types';

const uploadFileToStorage = async (file: File, userId: string): Promise<string> => {
    try {
        const validatedUserId = validateUserId(userId);
        const fileExt = file.name.split('.').pop();
        const fileName = `${validatedUserId}/${crypto.randomUUID()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
            .from('documents')
            .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(fileName);
        
        return publicUrl;
    } catch (error) {
        console.error('File upload failed:', sanitizeForLog(error));
        throw new Error('File upload failed');
    }
};

export const getDocuments = async (userId: string): Promise<Document[]> => {
    if (!validateUserId(userId)) return [];
    
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('upload_date', { ascending: false });
    
    if (error) throw error;
    
    // Map Phase 1 data to legacy format
    return (data || []).map((item: Phase1Document) => ({
        id: item.id,
        user_id: item.user_id,
        name: item.title,
        type: item.document_type,
        uploadDate: item.upload_date,
        fileUrl: item.file_path,
        familyMemberId: item.family_member_id,
        version: 1
    }));
};

export const addDocument = async (userId: string, docData: { name: string; type: string; familyMemberId: string }, file: File): Promise<Document> => {
    if (!validateUserId(userId)) throw new Error("Invalid user ID");
    
    const fileUrl = await uploadFileToStorage(file, userId);
    
    // Map to Phase 1 schema
    const newDoc = {
        user_id: userId,
        title: docData.name,
        document_type: docData.type,
        family_member_id: docData.familyMemberId === '0' ? null : docData.familyMemberId,
        file_path: fileUrl,
        file_size: file.size,
        mime_type: file.type,
        tags: [],
        is_encrypted: false
    };

    const { data, error } = await supabase
        .from('documents')
        .insert(newDoc)
        .select()
        .single();
    
    if (error) throw error;
    
    // Map back to legacy format
    return {
        id: data.id,
        user_id: data.user_id,
        name: data.title,
        type: data.document_type,
        uploadDate: data.upload_date,
        fileUrl: data.file_path,
        familyMemberId: data.family_member_id,
        version: 1
    };
};

interface DocumentUpdateData {
    name: string;
    type: string;
    family_member_id: string | null;
    file_url?: string;
    version?: any;
}

export const updateDocument = async (userId: string, docId: string, docData: { name:string; type:string; familyMemberId:string }, file?: File): Promise<Document> => {
    try {
        const validatedUserId = validateUserId(userId);
        const validatedDocId = validateId(docId);
        
        // Map to Phase 1 schema
        let updateData: any = {
            title: docData.name,
            document_type: docData.type,
            family_member_id: docData.familyMemberId === '0' ? null : docData.familyMemberId
        };
        
        if (file) {
            updateData.file_path = await uploadFileToStorage(file, validatedUserId);
            updateData.file_size = file.size;
            updateData.mime_type = file.type;
        }
        
        const { data, error } = await supabase
            .from('documents')
            .update(updateData)
            .eq('id', validatedDocId)
            .eq('user_id', validatedUserId)
            .select()
            .single();
        
        if (error) throw error;
        
        // Map back to legacy format
        return {
            id: data.id,
            user_id: data.user_id,
            name: data.title,
            type: data.document_type,
            uploadDate: data.upload_date,
            fileUrl: data.file_path,
            familyMemberId: data.family_member_id,
            version: 1
        };
    } catch (error) {
        console.error('Document update failed:', sanitizeForLog(error));
        throw new Error('Document update failed');
    }
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