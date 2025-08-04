import { Document } from '../types.ts';

const getDocumentsFromStorage = (userId: string): Document[] => {
    const data = localStorage.getItem(`${userId}_documents`);
    return data ? JSON.parse(data) : [];
};

const saveDocumentsToStorage = (userId: string, documents: Document[]) => {
    localStorage.setItem(`${userId}_documents`, JSON.stringify(documents));
};

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

export const getDocuments = async (userId: string): Promise<Document[]> => {
    return Promise.resolve(getDocumentsFromStorage(userId));
};

export const addDocument = async (userId: string, docData: { name: string; type: string; familyMemberId: string }, file: File): Promise<Document> => {
    const fileUrl = await fileToDataUrl(file);
    const allDocs = getDocumentsFromStorage(userId);
    
    const newDoc: Document = {
        id: Date.now().toString(),
        user_id: userId,
        name: docData.name,
        type: docData.type,
        familyMemberId: docData.familyMemberId === '0' ? undefined : docData.familyMemberId,
        fileUrl: fileUrl,
        version: 1,
        uploadDate: new Date().toISOString(),
    };

    allDocs.push(newDoc);
    saveDocumentsToStorage(userId, allDocs);
    return newDoc;
};

export const updateDocument = async (userId: string, docId: string, docData: { name:string; type:string; familyMemberId:string }, file?: File): Promise<Document> => {
    const allDocs = getDocumentsFromStorage(userId);
    const docIndex = allDocs.findIndex(doc => doc.id === docId);

    if (docIndex === -1) {
        throw new Error("Document not found.");
    }

    const currentDoc = allDocs[docIndex];
    const updatedDoc = { ...currentDoc, name: docData.name, type: docData.type, familyMemberId: docData.familyMemberId === '0' ? undefined : docData.familyMemberId };

    if (file) {
        updatedDoc.fileUrl = await fileToDataUrl(file);
        updatedDoc.version = (updatedDoc.version || 1) + 1;
        updatedDoc.uploadDate = new Date().toISOString();
    }
    
    allDocs[docIndex] = updatedDoc;
    saveDocumentsToStorage(userId, allDocs);
    return updatedDoc;
};

export const deleteDocument = async (userId: string, docToDelete: Document): Promise<void> => {
    let allDocs = getDocumentsFromStorage(userId);
    allDocs = allDocs.filter(doc => doc.id !== docToDelete.id);
    saveDocumentsToStorage(userId, allDocs);
    return Promise.resolve();
};