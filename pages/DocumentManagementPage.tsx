

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, FamilyMember } from '../types.ts';
import UploadIcon from '../components/icons/UploadIcon.tsx';
import CameraIcon from '../components/icons/CameraIcon.tsx';
import SearchIcon from '../components/icons/SearchIcon.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import EditIcon from '../components/icons/EditIcon.tsx';
import TrashIcon from '../components/icons/TrashIcon.tsx';
import EyeIcon from '../components/icons/EyeIcon.tsx';
import DocumentIcon from '../components/icons/DocumentIcon.tsx'; // Main page icon
import { useAuth } from '../contexts/AuthContext.tsx';
import * as documentService from '../services/documentService.ts';
import * as familyMemberService from '../services/familyMemberService.ts';

const DocumentManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [familyMembers, setFamilyMembers] = useState<Pick<FamilyMember, 'id' | 'name'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterFamilyMember, setFilterFamilyMember] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | undefined>(undefined);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
        const [docs, members] = await Promise.all([
            documentService.getDocuments(currentUser.id),
            familyMemberService.getFamilyMembers(currentUser.id, currentUser.user_metadata.name),
        ]);
        setDocuments(docs);
        const memberOptions = members.map(({ id, name }) => ({ id, name }));
        setFamilyMembers([{ id: '0', name: 'General Family Document' }, ...memberOptions]);
    } catch (err: any) {
        console.error("Failed to load documents or family members:", err);
        setError("Could not load data. Please refresh the page.");
    } finally {
        setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);
  
  const handleFileSelectClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const openUploadModal = (doc?: Document) => {
    setEditingDocument(doc);
    setCurrentFile(null);
    setFilePreview(doc?.fileUrl && doc.fileUrl !== '#' ? doc.fileUrl : null);
    setIsModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsModalOpen(false);
    setEditingDocument(undefined);
    setCurrentFile(null);
    setFilePreview(null);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const formData = new FormData(e.currentTarget);
    const docName = formData.get('docName') as string;
    const docType = formData.get('docType') as string;
    const familyMemberId = formData.get('familyMemberId') as string;

    if (!docName || !docType) {
        alert("Document Name and Type are required.");
        return;
    }
    
    try {
        if (editingDocument) {
            if (!currentFile && !editingDocument.fileUrl) {
                alert("Please select a file to upload for the new document.");
                return;
            }
            const updatedDoc = await documentService.updateDocument(currentUser.id, editingDocument.id, { name: docName, type: docType, familyMemberId }, currentFile || undefined);
            setDocuments(docs => docs.map(d => d.id === editingDocument.id ? updatedDoc : d));
        } else {
            if (!currentFile) {
                alert("Please select a file to upload.");
                return;
            }
            const newDoc = await documentService.addDocument(currentUser.id, { name: docName, type: docType, familyMemberId }, currentFile);
            setDocuments(docs => [...docs, newDoc]);
        }
        closeUploadModal();
    } catch(err) {
        console.error("Failed to save document:", err);
        alert(`Error saving document: ${(err as Error).message}`);
    }
  };
  
  const handleDeleteDocument = async (docToDelete: Document) => {
    if (!currentUser) return;
    if (window.confirm("Are you sure you want to delete this document? This cannot be undone.")) {
        try {
            await documentService.deleteDocument(currentUser.id, docToDelete);
            setDocuments(docs => docs.filter(d => d.id !== docToDelete.id));
        } catch (err) {
            console.error("Failed to delete document:", err);
            alert(`Error deleting document: ${(err as Error).message}`);
        }
    }
  };


  const filteredDocuments = documents.filter(doc => {
    const familyMemberName = familyMembers.find(fm => fm.id === doc.familyMemberId)?.name.toLowerCase() || '';
    return (
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      familyMemberName.includes(searchTerm.toLowerCase())
    ) &&
    (filterType ? doc.type === filterType : true) &&
    (filterFamilyMember ? doc.familyMemberId === filterFamilyMember : true);
  });

  const documentTypes = [...new Set(documents.map(d => d.type).concat(['Lab Report', 'Prescription', 'Insurance Card', 'Bill/Receipt', 'Referral Letter', 'Vaccination Record', 'Legal Document']))].sort();
  
  if (isLoading) return <div className="text-center p-8">Loading documents...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-3xl font-bold text-textPrimary">Document Management</h2>
        <button 
          onClick={() => openUploadModal()}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition self-start md:self-auto"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-surface rounded-lg shadow">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-textSecondary" />
          </div>
          <input
            type="text"
            placeholder="Search documents or members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"
          />
        </div>
        <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"
        >
          <option value="">All Types</option>
          {documentTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <select 
            value={filterFamilyMember} 
            onChange={e => setFilterFamilyMember(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"
        >
          <option value="">All Family Members</option>
          {familyMembers.map(fm => <option key={fm.id} value={fm.id}>{fm.name}</option>)}
        </select>
      </div>

      {filteredDocuments.length > 0 ? (
        <div className="overflow-x-auto bg-surface shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Document Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Type</th>
                <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Family Member</th>
                <th scope="col" className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Upload Date</th>
                <th scope="col" className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Version</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredDocuments.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-textPrimary">{doc.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{doc.type}</td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{familyMembers.find(fm => fm.id === doc.familyMemberId)?.name || 'N/A'}</td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{doc.version}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark p-1 inline-block" title="View Document"><EyeIcon className="w-5 h-5"/></a>
                    <button onClick={() => openUploadModal(doc)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit Document"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => handleDeleteDocument(doc)} className="text-red-600 hover:text-red-800 p-1" title="Delete Document"><TrashIcon className="w-5 h-5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
         <div className="text-center py-12 bg-surface rounded-lg shadow">
            <DocumentIcon className="w-24 h-24 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-textPrimary mb-2">No Documents Found</h3>
            <p className="text-textSecondary mb-4">{documents.length === 0 ? "Upload your first document to get started." : "Try adjusting your filters."}</p>
         </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleFormSubmit} className="bg-surface p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-6 text-textPrimary">{editingDocument ? 'Edit' : 'Upload New'} Document</h2>
            
            <div className="mb-4">
              <label htmlFor="docName" className="block text-sm font-medium text-textSecondary mb-1">Document Name</label>
              <input type="text" name="docName" id="docName" defaultValue={editingDocument?.name || currentFile?.name || ''} required className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
            </div>
            <div className="mb-4">
              <label htmlFor="docType" className="block text-sm font-medium text-textSecondary mb-1">Document Type</label>
              <input type="text" name="docType" id="docType" defaultValue={editingDocument?.type} list="commonDocTypes" placeholder="e.g., Lab Report" required className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
              <datalist id="commonDocTypes">
                {documentTypes.map(type => <option key={type} value={type} />)}
              </datalist>
            </div>
             <div className="mb-4">
                <label htmlFor="familyMemberId" className="block text-sm font-medium text-textSecondary mb-1">Family Member</label>
                <select name="familyMemberId" id="familyMemberId" defaultValue={editingDocument?.familyMemberId || '0'} className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white">
                    {familyMembers.map(fm => <option key={fm.id} value={fm.id}>{fm.name}</option>)}
                </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-textSecondary mb-1">File {editingDocument ? '(Leave empty to keep existing)' : ''}</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {filePreview ? (
                     (filePreview.startsWith('data:image') || filePreview.match(/\.(jpeg|jpg|gif|png)$/) != null) ?
                      <img src={filePreview} alt="Preview" className="mx-auto h-32 object-contain mb-2"/> :
                      <div className="mx-auto h-32 flex flex-col items-center justify-center mb-2">
                        <DocumentIcon className="w-16 h-16 text-textSecondary"/>
                        <p className="text-sm text-textSecondary mt-1">{currentFile?.name || editingDocument?.name || 'File Selected'}</p>
                      </div>
                  ) : (
                    <UploadIcon className="mx-auto h-12 w-12 text-textSecondary" />
                  )}
                  <div className="flex text-sm text-slate-600 justify-center">
                    <button type="button" onClick={handleFileSelectClick} className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>{currentFile ? 'Change file' : 'Upload a file'}</span>
                      <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"/>
                    </button>
                    {!currentFile && <p className="pl-1">or drag and drop</p>}
                  </div>
                  <p className="text-xs text-textSecondary">Images, PDF, DOC, TXT, CSV, XLS. Max 10MB.</p>
                  <button type="button" onClick={handleCameraCapture} className="mt-2 text-sm text-primary hover:text-primary-dark flex items-center mx-auto">
                    <CameraIcon className="w-4 h-4 mr-1"/> Use Camera
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleFileChange} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <button type="button" onClick={closeUploadModal} className="px-4 py-2 text-sm font-medium text-textPrimary bg-slate-100 rounded-md hover:bg-slate-200 transition">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition">{editingDocument ? 'Save Changes' : 'Upload Document'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DocumentManagementPage;