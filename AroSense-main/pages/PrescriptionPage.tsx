import React, { useState, useEffect, useCallback } from 'react';
import PillIcon from '../components/icons/PillIcon.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import EditIcon from '../components/icons/EditIcon.tsx';
import TrashIcon from '../components/icons/TrashIcon.tsx';
import { Prescription, FamilyMember } from '../types.ts';
import AppModal from '../components/AppModal.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import * as prescriptionService from '../services/prescriptionService.ts';
import * as familyMemberService from '../services/familyMemberService.ts';

const PrescriptionPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | undefined>(undefined);
  
  const initialFormState: Partial<Prescription> = {
    medicationName: '',
    dosage: '',
    frequency: '',
    prescribingDoctor: '',
    familyMemberId: ''
  };
  const [formData, setFormData] = useState<Partial<Prescription>>(initialFormState);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const [prescriptionsData, familyMembersData] = await Promise.all([
        prescriptionService.getPrescriptions(currentUser.id),
        familyMemberService.getFamilyMembers(currentUser.id, currentUser.user_metadata.name || 'User')
      ]);
      setPrescriptions(prescriptionsData);
      setFamilyMembers(familyMembersData);
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Could not load prescriptions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (prescription?: Prescription) => {
    setEditingPrescription(prescription);
    const defaultFamilyMemberId = familyMembers.length > 0 ? familyMembers[0].id : '';
    setFormData(prescription || { ...initialFormState, familyMemberId: defaultFamilyMemberId });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPrescription(undefined);
    setFormData(initialFormState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async () => {
    if (!currentUser) return;
    if (!formData.medicationName || !formData.dosage || !formData.frequency || !formData.familyMemberId) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
      if (editingPrescription) {
        const updated = await prescriptionService.updatePrescription(currentUser.id, editingPrescription.id, formData);
        setPrescriptions(prescriptions.map(p => p.id === updated.id ? updated : p));
      } else {
        const newPrescription = await prescriptionService.addPrescription(currentUser.id, formData);
        setPrescriptions([newPrescription, ...prescriptions]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save prescription:", error);
      alert("Failed to save prescription. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    if (window.confirm("Are you sure you want to delete this prescription?")) {
      try {
        await prescriptionService.deletePrescription(currentUser.id, id);
        setPrescriptions(prescriptions.filter(p => p.id !== id));
      } catch (error) {
        console.error("Failed to delete prescription:", error);
        alert("Failed to delete prescription. Please try again.");
      }
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading prescriptions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-textPrimary">Prescriptions & Medications</h2>
         <button onClick={() => handleOpenModal()} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition self-start sm:self-auto">
            <PlusIcon className="w-5 h-5" />
            <span>Add Prescription</span>
        </button>
      </div>
      
      {prescriptions.length === 0 ? (
        <div className="bg-surface p-8 rounded-xl shadow-lg text-center">
            <PillIcon className="w-16 h-16 text-primary mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-textPrimary mb-3">Your Digital Medicine Cabinet is Empty</h3>
            <p className="text-textSecondary max-w-md mx-auto mb-6">Keep track of all your family's medications in one place. Add your first prescription to get started.</p>
            <button onClick={() => handleOpenModal()} className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark flex items-center space-x-2 mx-auto transition">
                <PlusIcon className="w-5 h-5" />
                <span>Add First Prescription</span>
            </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-surface shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Medication</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">For</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Dosage & Frequency</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Doctor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {prescriptions.map(p => {
                const member = familyMembers.find(fm => fm.id === p.familyMemberId);
                return (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-textPrimary">{p.medicationName}</div>
                      {p.refillDate && <div className="text-xs text-textSecondary">Refill by: {new Date(p.refillDate).toLocaleDateString()}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{member?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{p.dosage}, {p.frequency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{p.prescribingDoctor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit Prescription"><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete Prescription"><TrashIcon className="w-5 h-5"/></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <AppModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          title={editingPrescription ? 'Edit Prescription' : 'Add Prescription'}
          primaryActionText={editingPrescription ? 'Save Changes' : 'Add Prescription'}
          onPrimaryAction={handleSubmit}
      >
          <div className="space-y-4">
              <div>
                  <label htmlFor="familyMemberId" className="block text-sm font-medium text-textSecondary mb-1">For Family Member</label>
                  <select name="familyMemberId" id="familyMemberId" value={formData.familyMemberId || ''} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white">
                      <option value="" disabled>Select Member</option>
                      {familyMembers.map(fm => <option key={fm.id} value={fm.id}>{fm.name}</option>)}
                  </select>
              </div>
              <div>
                  <label htmlFor="medicationName" className="block text-sm font-medium text-textSecondary mb-1">Medication Name</label>
                  <input type="text" name="medicationName" id="medicationName" value={formData.medicationName || ''} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
              </div>
               <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="dosage" className="block text-sm font-medium text-textSecondary mb-1">Dosage</label>
                        <input type="text" name="dosage" id="dosage" value={formData.dosage || ''} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
                    </div>
                    <div>
                        <label htmlFor="frequency" className="block text-sm font-medium text-textSecondary mb-1">Frequency</label>
                        <input type="text" name="frequency" id="frequency" value={formData.frequency || ''} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
                    </div>
               </div>
               <div>
                   <label htmlFor="prescribingDoctor" className="block text-sm font-medium text-textSecondary mb-1">Prescribing Doctor</label>
                   <input type="text" name="prescribingDoctor" id="prescribingDoctor" value={formData.prescribingDoctor || ''} onChange={handleChange} required className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white"/>
               </div>
                {/* Optional fields can be added here, e.g., pharmacy, refillDate */}
          </div>
      </AppModal>
    </div>
  );
};

export default PrescriptionPage;