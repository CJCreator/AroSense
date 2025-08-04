

import React, { useState, useEffect, useCallback } from 'react';
import { FamilyMember, Gender, RELATIONSHIP_OPTIONS, BLOOD_TYPE_OPTIONS } from '../types.ts';
import { DEFAULT_FAMILY_MEMBER_IMAGE } from '../constants.tsx'; 
import PlusIcon from '../components/icons/PlusIcon.tsx';
import EditIcon from '../components/icons/EditIcon.tsx';
import TrashIcon from '../components/icons/TrashIcon.tsx';
import UserCircleIcon from '../components/icons/UserCircleIcon.tsx';
import { useAuth } from '../contexts/AuthContext.tsx'; 
import * as familyMemberService from '../services/familyMemberService.ts'; // Import the service

const FamilyMemberCard: React.FC<{ member: FamilyMember; onEdit: (member: FamilyMember) => void; onDelete: (id: string) => void }> = ({ member, onEdit, onDelete }) => {
  return (
    <div className="bg-surface p-6 rounded-xl shadow-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl">
      <img
        src={member.profileImageUrl || DEFAULT_FAMILY_MEMBER_IMAGE}
        alt={member.name}
        className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-primary"
      />
      <h3 className="text-xl font-semibold text-textPrimary">{member.name}</h3>
      <p className="text-sm text-textSecondary">{member.relationshipToUser}</p>
      <p className="text-sm text-textSecondary">DOB: {member.dateOfBirth}</p>
      <p className="text-sm text-textSecondary">Gender: {member.gender}</p>
      {member.bloodType && <p className="text-sm text-textSecondary">Blood Type: {member.bloodType}</p>}
      <div className="mt-4 flex space-x-2">
        <button onClick={() => onEdit(member)} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition" aria-label={`Edit ${member.name}`}>
          <EditIcon className="w-5 h-5" />
        </button>
        <button onClick={() => onDelete(member.id)} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition" aria-label={`Delete ${member.name}`}>
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};


const FamilyMemberForm: React.FC<{ member?: FamilyMember; onSubmit: (member: FamilyMember) => void; onCancel: () => void }> = ({ member, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<FamilyMember>>(
    member || { 
        name: '', 
        dateOfBirth: '', 
        gender: Gender.PreferNotToSay, 
        relationshipToUser: RELATIONSHIP_OPTIONS[0], // Default to 'Self'
        bloodType: BLOOD_TYPE_OPTIONS[0], // Default to 'Unknown'
        allergies: [], 
        medicalConditions: [] 
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || undefined }));
    }
    else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleCommaSeparatedChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'allergies' | 'medicalConditions' | 'medications') => {
    setFormData(prev => ({ ...prev, [fieldName]: e.target.value.split(',').map(s => s.trim()).filter(s => s) }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dateOfBirth || !formData.relationshipToUser) {
        alert("Please fill in Name, Date of Birth, and Relationship.");
        return;
    }
    onSubmit({ ...formData, id: member?.id || Date.now().toString() } as FamilyMember);
  };

  const isChild = formData.relationshipToUser?.toLowerCase() === 'child' || formData.relationshipToUser?.toLowerCase() === 'son' || formData.relationshipToUser?.toLowerCase() === 'daughter';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6 text-textPrimary">{member ? 'Edit' : 'Add New'} Family Member</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-textSecondary mb-1">Full Name</label>
            <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
          </div>
          <div>
            <label htmlFor="relationshipToUser" className="block text-sm font-medium text-textSecondary mb-1">Relationship to You</label>
            <select name="relationshipToUser" id="relationshipToUser" value={formData.relationshipToUser || ''} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white">
                {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-textSecondary mb-1">Date of Birth</label>
            <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-textSecondary mb-1">Gender</label>
            <select name="gender" id="gender" value={formData.gender || Gender.PreferNotToSay} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white">
              {Object.values(Gender).map((g: string) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="bloodType" className="block text-sm font-medium text-textSecondary mb-1">Blood Type</label>
                <select name="bloodType" id="bloodType" value={formData.bloodType || 'Unknown'} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white">
                    {BLOOD_TYPE_OPTIONS.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="profileImageUrl" className="block text-sm font-medium text-textSecondary mb-1">Profile Image URL</label>
                <input type="url" name="profileImageUrl" id="profileImageUrl" value={formData.profileImageUrl || ''} onChange={handleChange} placeholder="https://picsum.photos/seed/new/200" className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
            </div>
        </div>

        {isChild && (
            <div className="p-4 border border-primary-light rounded-md mb-4 bg-primary-light/10">
                <h3 className="text-md font-semibold text-primary mb-3">Baby/Child Specific Details (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                        <label htmlFor="birthWeightKg" className="block text-xs font-medium text-textSecondary mb-1">Birth Weight (kg)</label>
                        <input type="number" step="0.01" name="birthWeightKg" id="birthWeightKg" value={formData.birthWeightKg || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white text-sm"/>
                    </div>
                     <div>
                        <label htmlFor="birthHeightCm" className="block text-xs font-medium text-textSecondary mb-1">Birth Height (cm)</label>
                        <input type="number" step="0.1" name="birthHeightCm" id="birthHeightCm" value={formData.birthHeightCm || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white text-sm"/>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                     <div>
                        <label htmlFor="birthHeadCircumferenceCm" className="block text-xs font-medium text-textSecondary mb-1">Birth Head Circum. (cm)</label>
                        <input type="number" step="0.1" name="birthHeadCircumferenceCm" id="birthHeadCircumferenceCm" value={formData.birthHeadCircumferenceCm || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white text-sm"/>
                    </div>
                    <div>
                        <label htmlFor="gestationalAgeWeeks" className="block text-xs font-medium text-textSecondary mb-1">Gestational Age (weeks, if premature)</label>
                        <input type="number" step="1" name="gestationalAgeWeeks" id="gestationalAgeWeeks" value={formData.gestationalAgeWeeks || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white text-sm"/>
                    </div>
                </div>
                 <div className="flex items-center mt-2">
                    <input type="checkbox" name="isPremature" id="isPremature" checked={formData.isPremature || false} onChange={handleChange} className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary"/>
                    <label htmlFor="isPremature" className="ml-2 block text-sm text-textPrimary">Born Prematurely</label>
                </div>
            </div>
        )}

        <div className="mb-4">
          <label htmlFor="allergies" className="block text-sm font-medium text-textSecondary mb-1">Allergies (comma-separated)</label>
          <input type="text" name="allergies" id="allergies" value={formData.allergies?.join(', ') || ''} onChange={(e) => handleCommaSeparatedChange(e, 'allergies')} className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
        </div>
        <div className="mb-4">
          <label htmlFor="medicalConditions" className="block text-sm font-medium text-textSecondary mb-1">Medical Conditions (comma-separated)</label>
          <input type="text" name="medicalConditions" id="medicalConditions" value={formData.medicalConditions?.join(', ') || ''} onChange={(e) => handleCommaSeparatedChange(e, 'medicalConditions')} className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
        </div>
         <div className="mb-6">
          <label htmlFor="medications" className="block text-sm font-medium text-textSecondary mb-1">Current Medications (comma-separated)</label>
          <input type="text" name="medications" id="medications" value={formData.medications?.join(', ') || ''} onChange={(e) => handleCommaSeparatedChange(e, 'medications')} className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-textPrimary bg-slate-100 rounded-md hover:bg-slate-200 transition">Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition">{member ? 'Save Changes' : 'Add Member'}</button>
        </div>
      </form>
    </div>
  );
};


const FamilyProfilesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>(undefined);

  const loadFamilyMembers = useCallback(async () => {
    if (currentUser) {
      setIsLoading(true);
      setError(null);
      try {
        const members = await familyMemberService.getFamilyMembers(currentUser.id, currentUser.user_metadata.name || 'User');
        setFamilyMembers(members);
      } catch (err) {
        console.error("Failed to load family members:", err);
        setError("Could not load family members. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setFamilyMembers([]); // Clear members if no user
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadFamilyMembers();
  }, [loadFamilyMembers]);


  const handleAddMember = () => {
    setEditingMember(undefined);
    setIsModalOpen(true);
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleDeleteMember = async (id: string) => {
    if (currentUser && window.confirm("Are you sure you want to delete this family member? This action cannot be undone.")) {
        try {
            await familyMemberService.deleteFamilyMember(currentUser.id, id);
            setFamilyMembers(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            console.error("Failed to delete family member:", err);
            alert("Failed to delete member. Please try again.");
        }
    }
  };

  const handleFormSubmit = async (memberData: FamilyMember) => {
    if (!currentUser) return;
    try {
        if (editingMember) {
            const updatedMember = await familyMemberService.updateFamilyMember(currentUser.id, {...memberData, id: editingMember.id});
            setFamilyMembers(prev => prev.map(m => m.id === editingMember.id ? updatedMember : m));
        } else {
            const newMember = await familyMemberService.addFamilyMember(currentUser.id, memberData);
            setFamilyMembers(prev => [...prev, newMember]);
        }
        setIsModalOpen(false);
        setEditingMember(undefined);
    } catch (err) {
        console.error("Failed to save family member:", err);
        alert("Failed to save member. Please try again.");
    }
  };

  if (!currentUser) {
    return (
        <div className="text-center py-12">
            <p className="text-textSecondary">Please log in to manage family profiles.</p>
        </div>
    );
  }

  if (isLoading) {
    return (
        <div className="text-center py-12">
            <p className="text-textPrimary">Loading family profiles...</p>
            {/* Consider adding a spinner icon */}
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-12 text-red-600 bg-red-50 p-4 rounded-md">
            <p>{error}</p>
            <button onClick={loadFamilyMembers} className="mt-2 px-3 py-1.5 text-sm bg-primary text-white rounded-md">Try Again</button>
        </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-textPrimary">Family Profiles</h2>
        <button 
          onClick={handleAddMember}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition self-start sm:self-auto"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Member</span>
        </button>
      </div>

      {familyMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {familyMembers.map(member => (
            <FamilyMemberCard key={member.id} member={member} onEdit={handleEditMember} onDelete={handleDeleteMember} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface rounded-xl shadow-lg">
            <UserCircleIcon className="w-24 h-24 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-textPrimary mb-2">No Family Members Yet</h3>
          <p className="text-textSecondary mb-4">Add your family members to start managing their health records.</p>
          <button 
            onClick={handleAddMember}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark flex items-center space-x-2 mx-auto transition"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add First Member</span>
          </button>
        </div>
      )}
      {isModalOpen && <FamilyMemberForm member={editingMember} onSubmit={handleFormSubmit} onCancel={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default FamilyProfilesPage;