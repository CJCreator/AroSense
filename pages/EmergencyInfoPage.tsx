import React, { useState, useEffect } from 'react';
import { FamilyMember, Gender, EmergencyContact, BLOOD_TYPE_OPTIONS, RELATIONSHIP_OPTIONS } from '../types.ts';
import QrCodeIcon from '../components/icons/QrCodeIcon.tsx';
import EditIcon from '../components/icons/EditIcon.tsx';
import EyeIcon from '../components/icons/EyeIcon.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import TrashIcon from '../components/icons/TrashIcon.tsx';
import { DEFAULT_FAMILY_MEMBER_IMAGE } from '../constants.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import * as familyMemberService from '../services/familyMemberService.ts';

interface InfoRowProps {
    label: string;
    value?: string | string[] | null;
    editable?: boolean;
    name?: string;
    type?: string;
    isTextArea?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    options?: {value: string, label: string}[]; // For select
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, editable, name, type = 'text', isTextArea, onChange, options }) => {
    const displayValue = Array.isArray(value) ? value.join(', ') : (value || 'N/A');

    if (editable && name && onChange) {
      if (isTextArea) {
          return (
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-start">
              <dt className="text-sm font-medium text-textSecondary pt-2">{label}</dt>
              <dd className="mt-1 text-sm text-textPrimary sm:mt-0 sm:col-span-2">
                <textarea 
                  name={name} 
                  value={value as string || ''} 
                  onChange={onChange} 
                  rows={4}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary shadow-sm bg-white"
                />
              </dd>
            </div>
          );
      }
      if (type === 'select' && options) {
        return (
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
              <dt className="text-sm font-medium text-textSecondary">{label}</dt>
              <dd className="mt-1 text-sm text-textPrimary sm:mt-0 sm:col-span-2">
                 <select name={name} value={value as string || ''} onChange={onChange} className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white shadow-sm">
                    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                 </select>
              </dd>
            </div>
        );
      }
      return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
          <dt className="text-sm font-medium text-textSecondary">{label}</dt>
          <dd className="mt-1 text-sm text-textPrimary sm:mt-0 sm:col-span-2">
             <input 
              type={type} 
              name={name} 
              value={value as string || ''} 
              onChange={onChange} 
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary shadow-sm bg-white"
            />
          </dd>
        </div>
      );
    }
    return (
      <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-textSecondary">{label}</dt>
        <dd className="mt-1 text-sm text-textPrimary sm:mt-0 sm:col-span-2">{displayValue}</dd>
      </div>
    );
  };


const EmergencyInfoPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showIncompleteProfileBanner, setShowIncompleteProfileBanner] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
        setIsLoading(true);
        familyMemberService.getFamilyMembers(currentUser.id, currentUser.user_metadata.name || 'User')
            .then(members => {
                const selfProfile = members.find(m => m.relationshipToUser === 'Self');
                if (selfProfile) {
                    setUserData(selfProfile);
                    // Check if profile is incomplete
                    if (!selfProfile.bloodType || !selfProfile.emergencyContacts || selfProfile.emergencyContacts.length === 0) {
                        setIsEditing(true);
                        setShowIncompleteProfileBanner(true);
                    }
                } else {
                    setError("Could not find your personal profile. Please create one in 'Family Profiles'.");
                }
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load your information.");
            })
            .finally(() => setIsLoading(false));
    }
  }, [currentUser]);

  const qrDataContent = userData ? `
    BEGIN:VCARD
    VERSION:3.0
    N:${userData.name.split(' ').pop()};${userData.name.split(' ')[0]}
    FN:${userData.name}
    DOB:${userData.dateOfBirth}
    GENDER:${userData.gender}
    BLOODTYPE:${userData.bloodType || 'N/A'}
    TEL;TYPE=CELL:${userData.emergencyContacts?.[0]?.phone || 'N/A'}
    NOTE:Allergies: ${userData.allergies?.join(', ') || 'N/A'}. Conditions: ${userData.medicalConditions?.join(', ') || 'N/A'}. Meds: ${userData.medications?.join(', ') || 'N/A'}. Notes: ${userData.emergencyNotes || ''}
    END:VCARD
  `.trim().replace(/\n\s*/g, '%0A') : '';
  const mockQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataContent)}`;


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!userData) return;
    const { name, value } = e.target;
    
    if (name.startsWith('emergencyContacts')) {
        const [_, indexStr, field] = name.match(/emergencyContacts\[(\d+)\]\.(\w+)/) || [];
        const index = parseInt(indexStr, 10);
        if (field && !isNaN(index)) {
            setUserData(prev => {
                if (!prev) return null;
                const updatedContacts = [...(prev.emergencyContacts || [])];
                updatedContacts[index] = { ...updatedContacts[index], [field]: value };
                return { ...prev, emergencyContacts: updatedContacts };
            });
        }
    } else if (name === 'allergiesText' || name === 'medicalConditionsText' || name === 'medicationsText') {
        const fieldKey = name.replace('Text', '') as 'allergies' | 'medicalConditions' | 'medications';
        setUserData(prev => prev ? ({...prev, [fieldKey]: value.split(',').map(s=>s.trim()).filter(s=>s)}) : null);
    } else if (name === 'primaryCarePhysicianName') {
        setUserData(prev => prev ? ({...prev, primaryCarePhysician: {...(prev.primaryCarePhysician || {phone: ''}), name: value }}) : null);
    } else if (name === 'primaryCarePhysicianPhone') {
        setUserData(prev => prev ? ({...prev, primaryCarePhysician: {...(prev.primaryCarePhysician || {name: ''}), phone: value }}) : null);
    } else if (name === 'insuranceProvider') {
         setUserData(prev => prev ? ({...prev, insuranceInfo: {...(prev.insuranceInfo || {policyId: ''}), provider: value }}) : null);
    } else if (name === 'insurancePolicyId') {
         setUserData(prev => prev ? ({...prev, insuranceInfo: {...(prev.insuranceInfo || {provider: ''}), policyId: value }}) : null);
    }
    else {
        setUserData(prev => prev ? ({ ...prev, [name]: value }) : null);
    }
  };
  
    const handleAddContact = () => {
        if (!userData) return;
        setUserData(prev => {
            if (!prev) return null;
            const newContact: EmergencyContact = {
                id: `new_${Date.now()}`,
                name: '',
                relationship: RELATIONSHIP_OPTIONS.filter(r => r !== 'Self')[0],
                phone: '',
            };
            const updatedContacts = [...(prev.emergencyContacts || []), newContact];
            return { ...prev, emergencyContacts: updatedContacts };
        });
    };

    const handleRemoveContact = (contactIdToRemove: string) => {
        if (!userData) return;
        setUserData(prev => {
            if (!prev) return null;
            const updatedContacts = (prev.emergencyContacts || []).filter(c => c.id !== contactIdToRemove);
            return { ...prev, emergencyContacts: updatedContacts };
        });
    };

  const handleSaveChanges = async () => {
      if (!currentUser || !userData) {
          alert("No user data to save.");
          return;
      }
      try {
        await familyMemberService.updateFamilyMember(currentUser.id, userData);
        setIsEditing(false);
        setShowIncompleteProfileBanner(false);
        alert("Emergency information saved successfully!");
      } catch (err: any) { // Explicitly type err as any to allow access to message
        console.error(err);
        alert("Failed to save changes. Please try again.");
      }
  };

  const genderOptions = Object.values(Gender).map((g: string) => ({ value: g, label: g }));
  const bloodTypeOptions = BLOOD_TYPE_OPTIONS.map(bt => ({ value: bt, label: bt }));
  const relationshipOptions = RELATIONSHIP_OPTIONS.filter(r => r !== 'Self').map(r => ({ value: r, label: r }));
  
  if (isLoading) return <div className="text-center p-8">Loading your information...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!userData) return <div className="text-center p-8">Could not load your emergency profile.</div>;


  return (
    <div className="max-w-4xl mx-auto print-friendly-content">
      {showIncompleteProfileBanner && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
            <p className="font-bold">Complete Your Profile</p>
            <p>Please fill in your essential emergency information to stay prepared.</p>
        </div>
      )}
      <div className="bg-surface shadow-xl rounded-lg p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-6 border-b border-slate-200">
          <div className="flex items-center mb-4 sm:mb-0">
            <img 
              src={userData.profileImageUrl || DEFAULT_FAMILY_MEMBER_IMAGE} 
              alt={userData.name} 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-red-500 mr-4"
            />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-red-600">EMERGENCY INFORMATION</h2>
              <p className="text-lg sm:text-xl font-semibold text-textPrimary">{userData.name}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button 
                onClick={isEditing ? handleSaveChanges : () => setIsEditing(true)}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition ${
                    isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
            >
                <EditIcon className="w-5 h-5" />
                <span>{isEditing ? 'Save Changes' : 'Edit Information'}</span>
            </button>
            <button 
              onClick={() => setShowQrCode(!showQrCode)}
              className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center justify-center space-x-2 transition"
            >
              {showQrCode ? <EyeIcon className="w-5 h-5"/> : <QrCodeIcon className="w-5 h-5" />}
              <span>{showQrCode ? 'Hide' : 'Show'} QR Code</span>
            </button>
          </div>
        </div>

        {showQrCode && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-textPrimary mb-2">Emergency QR Code</h3>
            <p className="text-sm text-textSecondary mb-4">Scan for VCard. Consider printing this screen or generating a wallet card.</p>
            <img src={mockQrCodeUrl} alt="Emergency QR Code" className="mx-auto w-48 h-48 border border-slate-300 p-1 bg-white" />
            <button 
              onClick={() => { navigator.clipboard.writeText(qrDataContent).then(() => alert('VCard data copied to clipboard!')).catch(err => alert('Failed to copy QR data.')); }}
              className="mt-4 bg-accent text-white px-3 py-1.5 rounded-md text-sm hover:bg-pink-500"
            >
              Copy VCard Data
            </button>
          </div>
        )}

        <dl className="divide-y divide-slate-200">
          <InfoRow label="Full Name" value={userData.name} editable={isEditing} name="name" onChange={handleInputChange}/>
          <InfoRow label="Date of Birth" value={userData.dateOfBirth} editable={isEditing} name="dateOfBirth" type="date" onChange={handleInputChange}/>
          <InfoRow label="Gender" value={userData.gender} editable={isEditing} name="gender" type="select" options={genderOptions} onChange={handleInputChange}/>
          <InfoRow label="Blood Type" value={userData.bloodType} editable={isEditing} name="bloodType" type="select" options={bloodTypeOptions} onChange={handleInputChange}/>
          <InfoRow label="Allergies (comma-sep)" value={isEditing ? userData.allergies?.join(', ') : userData.allergies} editable={isEditing} name="allergiesText" onChange={handleInputChange}/>
          <InfoRow label="Medical Conditions (comma-sep)" value={isEditing ? userData.medicalConditions?.join(', ') : userData.medicalConditions} editable={isEditing} name="medicalConditionsText" onChange={handleInputChange}/>
          <InfoRow label="Current Medications (comma-sep)" value={isEditing ? userData.medications?.join('; ') : userData.medications} editable={isEditing} name="medicationsText" onChange={handleInputChange}/>
          
          <div className="pt-4 mt-4 border-t border-dashed border-slate-300">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-semibold text-textPrimary">Emergency Contacts</h4>
                {isEditing && (
                    <button type="button" onClick={handleAddContact} className="text-sm bg-blue-500 text-white hover:bg-blue-600 px-2 py-1 rounded-md flex items-center space-x-1">
                        <PlusIcon className="w-4 h-4"/>
                        <span>Add Contact</span>
                    </button>
                )}
            </div>
             {userData.emergencyContacts?.map((contact, index) => (
                 <div key={contact.id} className="mb-3 pl-4 border-l-2 border-red-500 relative py-2">
                    <InfoRow label={`Contact ${index+1} Name`} value={contact.name} editable={isEditing} name={`emergencyContacts[${index}].name`} onChange={handleInputChange}/>
                    <InfoRow label={`Relationship`} value={contact.relationship} editable={isEditing} name={`emergencyContacts[${index}].relationship`} type="select" options={relationshipOptions} onChange={handleInputChange}/>
                    <InfoRow label={`Phone`} value={contact.phone} editable={isEditing} name={`emergencyContacts[${index}].phone`} type="tel" onChange={handleInputChange}/>
                    {isEditing && (
                        <button 
                            type="button" 
                            onClick={() => handleRemoveContact(contact.id)}
                            className="absolute top-1 right-1 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                            aria-label="Remove Contact"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                 </div>
             ))}
             {(!userData.emergencyContacts || userData.emergencyContacts.length === 0) && (
                <p className="text-sm text-textSecondary">{isEditing ? 'Click "Add Contact" to add one.' : 'No contacts added.'}</p>
             )}
          </div>

           <div className="pt-4 mt-4 border-t border-dashed border-slate-300">
             <h4 className="text-md font-semibold text-textPrimary mb-2">Physician & Insurance</h4>
            <InfoRow label="Primary Care Physician" value={userData.primaryCarePhysician?.name} editable={isEditing} name="primaryCarePhysicianName" onChange={handleInputChange}/>
            <InfoRow label="Physician Phone" value={userData.primaryCarePhysician?.phone} editable={isEditing} name="primaryCarePhysicianPhone" type="tel" onChange={handleInputChange}/>
            <InfoRow label="Insurance Provider" value={userData.insuranceInfo?.provider} editable={isEditing} name="insuranceProvider" onChange={handleInputChange}/>
            <InfoRow label="Policy ID" value={userData.insuranceInfo?.policyId} editable={isEditing} name="insurancePolicyId" onChange={handleInputChange}/>
          </div>
          
          <InfoRow label="Important Emergency Notes" value={userData.emergencyNotes} editable={isEditing} name="emergencyNotes" isTextArea={true} onChange={handleInputChange}/>
        </dl>
        
        {isEditing && (
            <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleSaveChanges}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2 transition"
                >
                    <span>Save All Changes</span>
                </button>
            </div>
        )}
      </div>
      <p className="text-center mt-6 text-sm text-textSecondary print:hidden">
        This information should be kept up-to-date. In an emergency, first responders may use this.
        <br/> Consider lock screen accessibility options on your device, or print this page.
      </p>
    </div>
  );
};

export default EmergencyInfoPage;