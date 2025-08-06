import React, { useState, useEffect, useCallback } from 'react';
import { FamilyMember, Gender, RELATIONSHIP_OPTIONS, BLOOD_TYPE_OPTIONS } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import * as familyMemberService from '../services/familyMemberService.ts';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import EditIcon from '../components/icons/EditIcon.tsx';
import TrashIcon from '../components/icons/TrashIcon.tsx';
import UsersIcon from '../components/icons/UsersIcon.tsx';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { EmptyStateCard } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingSpinner';
import AppModal from '../components/AppModal';
import { FilterPanel } from '../components/ui/FilterPanel';
import { useSearch } from '../hooks/useSearch';

const FamilyProfilesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    relationshipToUser: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    allergies: [] as string[],
    emergencyNotes: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const { results: filteredMembers } = useSearch(
    familyMembers,
    searchQuery,
    { keys: ['name', 'relationship', 'blood_type'] }
  );

  const loadFamilyMembers = useCallback(async () => {
    if (currentUser) {
      setIsLoading(true);
      try {
        const members = await familyMemberService.getFamilyMembers(currentUser.id, currentUser.user_metadata.name || 'User');
        setFamilyMembers(members);
      } catch (error) {
        console.error('Failed to load family members:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    loadFamilyMembers();
  }, [loadFamilyMembers]);

  const resetForm = () => {
    setFormData({
      name: '',
      relationshipToUser: '',
      dateOfBirth: '',
      gender: '',
      bloodType: '',
      allergies: [],
      emergencyNotes: ''
    });
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      relationshipToUser: member.relationship || member.relationshipToUser || '',
      dateOfBirth: member.date_of_birth || member.dateOfBirth || '',
      gender: member.gender || '',
      bloodType: member.blood_type || member.bloodType || '',
      allergies: member.allergies || [],
      emergencyNotes: member.medical_notes || member.emergencyNotes || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteMember = async (id: string) => {
    if (currentUser && window.confirm('Are you sure you want to delete this family member?')) {
      try {
        await familyMemberService.deleteFamilyMember(currentUser.id, id);
        setFamilyMembers(prev => prev.filter(m => m.id !== id));
      } catch (error) {
        console.error('Failed to delete family member:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      if (editingMember) {
        const updatedMember = await familyMemberService.updateFamilyMember(currentUser.id, {
          ...editingMember,
          name: formData.name,
          relationship: formData.relationshipToUser,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender as any,
          blood_type: formData.bloodType,
          medical_notes: formData.emergencyNotes
        });
        setFamilyMembers(prev => prev.map(m => m.id === editingMember.id ? updatedMember : m));
        setShowEditModal(false);
      } else {
        const newMember = await familyMemberService.addFamilyMember(currentUser.id, {
          name: formData.name,
          relationship: formData.relationshipToUser,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender as any,
          blood_type: formData.bloodType,
          medical_notes: formData.emergencyNotes
        });
        setFamilyMembers(prev => [...prev, newMember]);
        setShowAddModal(false);
      }
      resetForm();
      setEditingMember(null);
    } catch (error) {
      console.error('Failed to save family member:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-inclusive-orange-50 to-yellow-50">
        <Card className="text-center p-8">
          <UsersIcon className="w-16 h-16 text-inclusive-orange-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Please log in to access family profiles.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-inclusive-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState title="Loading family members..." subtitle="Please wait while we fetch your family profiles" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-inclusive-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-inclusive-orange-500 to-inclusive-orange-600 rounded-2xl flex items-center justify-center">
                <UsersIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Family Profiles</h1>
                <p className="text-gray-600 mt-1">Manage health information for your family members</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<PlusIcon className="w-5 h-5" />}
              onClick={() => setShowAddModal(true)}
              className="shadow-lg hover:shadow-xl"
            >
              Add Member
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        {familyMembers.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search family members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-inclusive-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <FilterPanel
              filters={[
                {
                  id: 'relationship',
                  label: 'Relationship',
                  type: 'select',
                  options: RELATIONSHIP_OPTIONS.map(r => ({ id: r, label: r, value: r }))
                },
                {
                  id: 'bloodType',
                  label: 'Blood Type',
                  type: 'select',
                  options: BLOOD_TYPE_OPTIONS.map(b => ({ id: b, label: b, value: b }))
                }
              ]}
              values={filters}
              onChange={(filterId, value) => setFilters(prev => ({ ...prev, [filterId]: value }))}
              onReset={() => setFilters({})}
            />
          </div>
        )}

        {/* Content */}
        {familyMembers.length === 0 ? (
          <EmptyStateCard
            icon={<UsersIcon className="w-16 h-16" />}
            title="No Family Members Yet"
            description="Add family members to start tracking their health information and medical records."
            action={{
              label: "Add Your First Member",
              onClick: () => setShowAddModal(true)
            }}
            gradient="from-inclusive-orange-50 to-yellow-50"
            className="max-w-2xl mx-auto"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(member => (
              <Card key={member.id} variant="elevated" className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardContent>
                  {/* Member Header */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-inclusive-orange-500 to-inclusive-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{member.relationship || 'Family Member'}</p>
                      {member.date_of_birth && (
                        <p className="text-xs text-gray-500 mt-1">
                          Born: {new Date(member.date_of_birth).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Member Details */}
                  <div className="space-y-3 mb-6">
                    {member.blood_type && (
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                        <span className="text-sm font-medium text-gray-700">Blood Type</span>
                        <span className="text-sm font-bold text-red-600">{member.blood_type}</span>
                      </div>
                    )}
                    
                    {member.allergies && member.allergies.length > 0 && (
                      <div className="p-3 bg-yellow-50 rounded-xl">
                        <span className="text-sm font-medium text-gray-700 block mb-2">Allergies</span>
                        <div className="flex flex-wrap gap-1">
                          {member.allergies.map((allergy, index) => (
                            <span key={index} className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {member.medical_notes && (
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <span className="text-sm font-medium text-gray-700 block mb-1">Medical Notes</span>
                        <p className="text-sm text-gray-600">{member.medical_notes}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<EditIcon className="w-4 h-4" />}
                      onClick={() => handleEditMember(member)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="error"
                      size="sm"
                      onClick={() => handleDeleteMember(member.id)}
                      className="px-3"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <AppModal 
          isOpen={showAddModal || showEditModal} 
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setEditingMember(null);
            resetForm();
          }}
          title={editingMember ? 'Edit Family Member' : 'Add Family Member'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Enter full name"
              />
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship to You *</label>
                <select
                  value={formData.relationshipToUser}
                  onChange={(e) => setFormData({...formData, relationshipToUser: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-inclusive-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select relationship</option>
                  {RELATIONSHIP_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              />
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-inclusive-orange-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  {Object.values(Gender).map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Type</label>
              <select
                value={formData.bloodType}
                onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-inclusive-orange-500 focus:border-transparent"
              >
                <option value="">Select blood type</option>
                {BLOOD_TYPE_OPTIONS.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <Input
              label="Allergies"
              value={formData.allergies.join(', ')}
              onChange={(e) => setFormData({...formData, allergies: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
              placeholder="Enter allergies separated by commas"
              helperText="Separate multiple allergies with commas"
            />
            
            <Textarea
              label="Emergency Notes"
              value={formData.emergencyNotes}
              onChange={(e) => setFormData({...formData, emergencyNotes: e.target.value})}
              placeholder="Any important medical information for emergencies"
              rows={3}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                {editingMember ? 'Update Member' : 'Add Member'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingMember(null);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </AppModal>
      </div>
    </div>
  );
};

export default FamilyProfilesPage;