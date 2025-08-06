import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as emergencyService from '../services/emergencyServicePhase1';
import * as familyMemberService from '../services/familyMemberService';
import { FamilyMember } from '../types';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyStateCard } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingSpinner';
import QRCodeGenerator from '../components/QRCodeGenerator';
import PlusIcon from '../components/icons/PlusIcon';
import EditIcon from '../components/icons/EditIcon';
import AppModal from '../components/AppModal';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
}

const EmergencyInfoPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    relationship: '',
    is_primary: false
  });

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const [members, contacts] = await Promise.all([
        familyMemberService.getFamilyMembers(currentUser.id),
        emergencyService.getEmergencyContacts(currentUser.id)
      ]);
      setFamilyMembers(members);
      setEmergencyContacts(contacts);
    } catch (error) {
      console.error('Failed to load emergency data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetContactForm = () => {
    setContactForm({
      name: '',
      phone: '',
      relationship: '',
      is_primary: false
    });
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      is_primary: contact.is_primary
    });
    setShowContactModal(true);
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      if (editingContact) {
        await emergencyService.updateEmergencyContact(editingContact.id, contactForm);
      } else {
        await emergencyService.createEmergencyContact({
          user_id: currentUser.id,
          ...contactForm
        });
      }
      await loadData();
      setShowContactModal(false);
      setEditingContact(null);
      resetContactForm();
    } catch (error) {
      console.error('Failed to save emergency contact:', error);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!currentUser || !window.confirm('Are you sure you want to delete this emergency contact?')) return;

    try {
      await emergencyService.deleteEmergencyContact(id);
      setEmergencyContacts(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete emergency contact:', error);
    }
  };

  const generateEmergencyData = () => {
    const primaryContact = emergencyContacts.find(c => c.is_primary);
    const userProfile = familyMembers.find(m => m.relationship === 'other'); // Self profile
    
    return {
      name: userProfile?.name || currentUser?.user_metadata?.name || 'User',
      bloodType: userProfile?.blood_type || 'Unknown',
      allergies: userProfile?.allergies || [],
      medicalConditions: userProfile?.medical_notes || '',
      emergencyContact: primaryContact ? {
        name: primaryContact.name,
        phone: primaryContact.phone,
        relationship: primaryContact.relationship
      } : null,
      lastUpdated: new Date().toISOString()
    };
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-urgent-red-50 to-red-50">
        <Card className="text-center p-8">
          <span className="text-6xl mb-4 block">🚨</span>
          <p className="text-gray-600 text-lg">Please log in to access emergency information.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-urgent-red-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState title="Loading emergency information..." subtitle="Please wait while we fetch your emergency data" />
        </div>
      </div>
    );
  }

  const emergencyData = generateEmergencyData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-urgent-red-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-urgent-red-500 to-urgent-red-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">🚨</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Emergency Information</h1>
              <p className="text-gray-600 mt-1">Critical medical information for first responders</p>
            </div>
          </div>
          
          {/* Alert Banner */}
          <div className="bg-urgent-red-100 border border-urgent-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <span className="text-urgent-red-600 text-xl">⚠️</span>
              <div>
                <p className="text-urgent-red-800 font-semibold">Keep this information updated</p>
                <p className="text-urgent-red-700 text-sm">Emergency responders rely on accurate medical information to provide proper care.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Code Section */}
          <div className="lg:col-span-1">
            <Card variant="elevated" className="text-center">
              <CardHeader title="Emergency QR Code" subtitle="Scan for instant access to medical info" />
              <CardContent>
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 mb-4">
                  <QRCodeGenerator data={emergencyData} />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  First responders can scan this code to access your critical medical information
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Print Emergency Card
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Medical Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Medical Info */}
            <Card variant="elevated">
              <CardHeader 
                title="Personal Medical Information" 
                subtitle="Critical health details"
                icon={<span className="text-2xl">🏥</span>}
              />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">Blood Type</h4>
                      <p className="text-2xl font-bold text-red-600">
                        {emergencyData.bloodType}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-2">Allergies</h4>
                      {emergencyData.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {emergencyData.allergies.map((allergy, index) => (
                            <span key={index} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-yellow-700">No known allergies</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Medical Conditions</h4>
                      <p className="text-blue-700">
                        {emergencyData.medicalConditions || 'No medical conditions listed'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card variant="elevated">
              <CardHeader 
                title="Emergency Contacts" 
                subtitle={`${emergencyContacts.length} contacts configured`}
                icon={<span className="text-2xl">📞</span>}
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<PlusIcon className="w-4 h-4" />}
                    onClick={() => setShowContactModal(true)}
                  >
                    Add Contact
                  </Button>
                }
              />
              <CardContent>
                {emergencyContacts.length === 0 ? (
                  <EmptyStateCard
                    icon={<span className="text-4xl">📞</span>}
                    title="No Emergency Contacts"
                    description="Add emergency contacts so first responders know who to call"
                    action={{
                      label: "Add First Contact",
                      onClick: () => setShowContactModal(true)
                    }}
                    gradient="from-red-50 to-orange-50"
                  />
                ) : (
                  <div className="space-y-3">
                    {emergencyContacts.map(contact => (
                      <div key={contact.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            contact.is_primary ? 'bg-urgent-red-100' : 'bg-gray-200'
                          }`}>
                            <span className="text-xl">
                              {contact.is_primary ? '⭐' : '👤'}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-800">{contact.name}</h4>
                              {contact.is_primary && (
                                <span className="bg-urgent-red-100 text-urgent-red-700 px-2 py-1 rounded-full text-xs font-medium">
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{contact.relationship}</p>
                            <p className="text-sm font-mono text-gray-700">{contact.phone}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditContact(contact)}
                          >
                            <EditIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="error"
                            size="sm"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emergency Contact Modal */}
        <AppModal
          isOpen={showContactModal}
          onClose={() => {
            setShowContactModal(false);
            setEditingContact(null);
            resetContactForm();
          }}
          title={editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
        >
          <form onSubmit={handleSubmitContact} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={contactForm.name}
                onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                required
                placeholder="Enter contact's full name"
              />
              
              <Input
                label="Phone Number"
                type="tel"
                value={contactForm.phone}
                onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                required
                placeholder="(555) 123-4567"
              />
            </div>
            
            <Input
              label="Relationship"
              value={contactForm.relationship}
              onChange={(e) => setContactForm({...contactForm, relationship: e.target.value})}
              required
              placeholder="e.g., Spouse, Parent, Sibling"
            />
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_primary"
                checked={contactForm.is_primary}
                onChange={(e) => setContactForm({...contactForm, is_primary: e.target.checked})}
                className="w-4 h-4 text-urgent-red-600 border-gray-300 rounded focus:ring-urgent-red-500"
              />
              <label htmlFor="is_primary" className="text-sm font-medium text-gray-700">
                Set as primary emergency contact
              </label>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                {editingContact ? 'Update Contact' : 'Add Contact'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowContactModal(false);
                  setEditingContact(null);
                  resetContactForm();
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

export default EmergencyInfoPage;