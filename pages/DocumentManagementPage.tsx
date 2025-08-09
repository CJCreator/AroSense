import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Document, FamilyMember } from '../types.ts';
import UploadIcon from '../components/icons/UploadIcon.tsx';
import CameraIcon from '../components/icons/CameraIcon.tsx';
import SearchIcon from '../components/icons/SearchIcon.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import ChevronDownIcon from '../components/icons/ChevronDownIcon.tsx';
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | undefined>(undefined);
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
        const [docs, members, allTagsResult] = await Promise.all([
            documentService.getDocuments(currentUser.id),
            familyMemberService.getFamilyMembers(currentUser.id, currentUser.user_metadata.name || 'User'),
            documentService.getAllTags(currentUser.id),
        ]);
        setDocuments(docs);
        const memberOptions = members.map(({ id, name }) => ({ id, name }));
        setFamilyMembers([{ id: '0', name: 'General Family Document' }, ...memberOptions]);
        setAllTags(allTagsResult);
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
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setCurrentFiles(fileArray);

      const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      };

      Promise.all(fileArray.map(fileToDataUrl)).then(previews => {
        setFilePreviews(previews);
      });
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
    setCurrentFiles([]);
    setFilePreviews(doc?.fileUrl && doc.fileUrl !== '#' ? [doc.fileUrl] : []);
    setTags(doc?.tags?.join(', ') || '');
    setIsModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsModalOpen(false);
    setEditingDocument(undefined);
    setCurrentFiles([]);
    setFilePreviews([]);
    setTags('');
    setTagSuggestions([]);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTags(inputValue);

    const tagParts = inputValue.split(',').map(t => t.trim());
    const currentTag = tagParts[tagParts.length - 1];

    if (currentTag) {
        const suggestions = allTags.filter(t =>
            t.toLowerCase().startsWith(currentTag.toLowerCase()) &&
            !tagParts.slice(0, -1).some(p => p.toLowerCase() === t.toLowerCase())
        );
        setTagSuggestions(suggestions);
    } else {
        setTagSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
      const tagParts = tags.split(',').map(t => t.trim());
      tagParts[tagParts.length - 1] = suggestion;
      setTags(tagParts.join(', ') + ', ');
      setTagSuggestions([]);
  };

  const handleTagFilterChange = (tag: string) => {
    setSelectedTags(prev =>
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;

    const formData = new FormData(e.currentTarget);
    const docName = formData.get('docName') as string;
    const docType = formData.get('docType') as string;
    const familyMemberId = formData.get('familyMemberId') as string;
    const tagsArray = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean);

    if (currentFiles.length === 0 && !editingDocument) {
      alert("Please select at least one file to upload.");
      return;
    }
    if (!editingDocument && !docType) {
      alert("Document Type is required for all uploads.");
      return;
    }

    setIsLoading(true);
    try {
      if (editingDocument) {
        if (!docName || !docType) {
          alert("Document Name and Type are required when editing.");
          setIsLoading(false);
          return;
        }
        const fileToUpdate = currentFiles.length > 0 ? currentFiles[0] : undefined;
        if (!fileToUpdate && !editingDocument.fileUrl) {
            alert("Please select a file for the document.");
            setIsLoading(false);
            return;
        }
        const updatedDocData = { name: docName, type: docType, familyMemberId, tags: tagsArray };
        const updatedDoc = await documentService.updateDocument(currentUser.id, editingDocument.id, updatedDocData, fileToUpdate);
        setDocuments(docs => docs.map(d => d.id === editingDocument.id ? updatedDoc : d));
      } else {
        const uploadPromises = currentFiles.map(file => {
          const newDocData = {
            name: currentFiles.length > 1 ? file.name : docName || file.name,
            type: docType,
            familyMemberId,
            tags: tagsArray,
          };
          return documentService.addDocument(currentUser.id, newDocData, file);
        });

        const newDocs = await Promise.all(uploadPromises);
        setDocuments(docs => [...docs, ...newDocs].sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
      }
      closeUploadModal();
    } catch (err) {
      console.error("Failed to save document(s):", err);
      alert(`Error saving document(s): ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!currentUser) return;
    if (window.confirm("Are you sure you want to delete this document? This cannot be undone.")) {
      try {
        await documentService.deleteDocument(currentUser.id, docId);
        setDocuments(docs => docs.filter(d => d.id !== docId));
      } catch (err) {
        console.error("Failed to delete document:", err);
        alert(`Error deleting document: ${(err as Error).message}`);
      }
    }
  };

  const handleRemoveTag = async (doc: Document, tagToRemove: string) => {
    if (!currentUser) return;

    const updatedTags = doc.tags?.filter(t => t !== tagToRemove) || [];

    const updatedDocData = {
        name: doc.name,
        type: doc.type,
        familyMemberId: doc.familyMemberId || '0',
        tags: updatedTags,
    };

    try {
        const updatedDoc = await documentService.updateDocument(currentUser.id, doc.id, updatedDocData);
        setDocuments(docs => docs.map(d => d.id === doc.id ? updatedDoc : d));
    } catch (error) {
        console.error('Failed to remove tag:', error);
        alert('Failed to remove tag. Please try again.');
    }
  };


  const filteredDocuments = documents.filter(doc => {
    const familyMemberName = familyMembers.find(fm => fm.id === doc.familyMemberId)?.name.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearchTerm = searchTermLower === '' ||
        doc.name.toLowerCase().includes(searchTermLower) ||
        familyMemberName.includes(searchTermLower) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTermLower)));

    const matchesType = !filterType || doc.type === filterType;
    const matchesFamilyMember = !filterFamilyMember || doc.familyMemberId === filterFamilyMember;
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => doc.tags?.includes(tag));

    const docDate = new Date(doc.uploadDate);
    const matchesStartDate = !startDate || docDate >= new Date(startDate);
    const matchesEndDate = !endDate || docDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999));

    return matchesSearchTerm && matchesType && matchesFamilyMember && matchesTags && matchesStartDate && matchesEndDate;
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

      <div className="p-4 bg-surface rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              value={filterFamilyMember}
              onChange={e => setFilterFamilyMember(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"
          >
            <option value="">All Family Members</option>
            {familyMembers.map(fm => <option key={fm.id} value={fm.id}>{fm.name}</option>)}
          </select>

          <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"
          >
            <option value="">Filter by Type</option>
            {documentTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>

          <div className="relative">
            <button
              onClick={() => setIsTagFilterOpen(!isTagFilterOpen)}
              className="w-full p-2.5 border border-slate-300 rounded-md bg-white text-left flex justify-between items-center"
            >
              <span>{selectedTags.length > 0 ? `${selectedTags.length} tags selected` : "Filter by Tags"}</span>
              <ChevronDownIcon className={`h-5 w-5 text-textSecondary transition-transform ${isTagFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isTagFilterOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {allTags.map(tag => (
                  <label key={tag} className="flex items-center px-4 py-2 text-sm text-textPrimary hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagFilterChange(tag)}
                    />
                    <span className="ml-3">{tag}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-textSecondary mb-1">Upload Date From</label>
                <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white" />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-textSecondary mb-1">Upload Date To</label>
                <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white" />
            </div>
        </div>
      </div>

      {filteredDocuments.length > 0 ? (
        <div className="overflow-x-auto bg-surface shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Document Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Family Member</th>
                <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Type</th>
                <th scope="col" className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Tags</th>
                <th scope="col" className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Upload Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredDocuments.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-textPrimary">{doc.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{familyMembers.find(fm => fm.id === doc.familyMemberId)?.name || 'N/A'}</td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{doc.type}</td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags?.map(tag => (
                        <span key={tag} className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium pl-2.5 pr-1 py-0.5 rounded-full">
                          {tag}
                          <button
                              onClick={() => handleRemoveTag(doc, tag)}
                              className="ml-1.5 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-600 hover:bg-blue-200 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              aria-label={`Remove tag ${tag}`}
                          >
                            <span className="sr-only">Remove {tag}</span>
                            <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                              <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark p-1 inline-block" title="View Document"><EyeIcon className="w-5 h-5"/></a>
                    <button onClick={() => openUploadModal(doc)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit Document"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => handleDeleteDocument(doc.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete Document"><TrashIcon className="w-5 h-5"/></button>
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
            
            <div className={`mb-4 ${!editingDocument && currentFiles.length > 1 ? 'hidden' : ''}`}>
              <label htmlFor="docName" className="block text-sm font-medium text-textSecondary mb-1">Document Name</label>
              <input type="text" name="docName" id="docName" defaultValue={editingDocument?.name || (currentFiles.length === 1 ? currentFiles[0].name : '')} required={editingDocument || currentFiles.length <= 1} className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
              { !editingDocument && currentFiles.length > 1 && <p className="text-xs text-textSecondary mt-1">Document names will be generated from filenames.</p> }
            </div>
            <div className="mb-4">
              <label htmlFor="docType" className="block text-sm font-medium text-textSecondary mb-1">Document Type</label>
              <input type="text" name="docType" id="docType" defaultValue={editingDocument?.type || ''} list="commonDocTypes" placeholder="e.g., Lab Report" required className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
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
            <div className="mb-4 relative">
              <label htmlFor="tags" className="block text-sm font-medium text-textSecondary mb-1">Tags (comma-separated)</label>
              <input type="text" name="tags" id="tags" value={tags} onChange={handleTagInputChange} placeholder="e.g., annual checkup, blood test" className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white" autoComplete="off" />
              {tagSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-slate-300 rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
                  {tagSuggestions.map(suggestion => (
                    <li key={suggestion} onClick={() => handleSuggestionClick(suggestion)} className="px-4 py-2 cursor-pointer hover:bg-slate-100">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-textSecondary mb-1">File(s) {editingDocument ? '(Leave empty to keep existing)' : ''}</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                <div className="space-y-1 text-center w-full">
                  {filePreviews.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filePreviews.map((preview, index) => {
                        const fileName = currentFiles[index]?.name || editingDocument?.name || 'File';
                        const isImage = preview.startsWith('data:image') || preview.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                        const isPdf = currentFiles[index]?.type === 'application/pdf' || (currentFiles.length === 0 && editingDocument?.fileUrl?.toLowerCase().endsWith('.pdf'));
                        const isPreviewable = preview.startsWith('data:application/pdf') || (editingDocument?.fileUrl?.toLowerCase().endsWith('.pdf'));

                        return (
                            <div key={index} className="relative group w-full h-24">
                                {isImage ? (
                                    <img src={preview} alt={`Preview ${index}`} className="mx-auto h-full object-contain rounded-md"/>
                                ) : isPdf && isPreviewable ? (
                                    <iframe src={preview} title={fileName} className="w-full h-full border-0 rounded-md" />
                                ) : (
                                    <div className="mx-auto h-full flex flex-col items-center justify-center bg-slate-100 rounded-md p-2">
                                        <DocumentIcon className="w-10 h-10 text-textSecondary"/>
                                        <p className="text-xs text-textSecondary mt-1 truncate w-full" title={fileName}>{fileName}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    </div>
                  ) : (
                    <UploadIcon className="mx-auto h-12 w-12 text-textSecondary" />
                  )}
                  <div className="flex text-sm text-slate-600 justify-center">
                    <button type="button" onClick={handleFileSelectClick} className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>{currentFiles.length > 0 ? 'Change files' : 'Upload file(s)'}</span>
                      <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx" multiple={!editingDocument} />
                    </button>
                    {currentFiles.length === 0 && <p className="pl-1">or drag and drop</p>}
                  </div>
                  <p className="text-xs text-textSecondary">Images, PDF, DOC, etc. Max 10MB.</p>
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