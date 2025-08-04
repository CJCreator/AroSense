import React from 'react';
import { Link } from 'react-router-dom';
import { FamilyMember } from '../types';

interface ChildSelectorProps {
  familyMembers: FamilyMember[];
  selectedChildId: string | null;
  onSelectChild: (id: string) => void;
  isLoading: boolean;
  ageThresholdYears: number;
}

const ChildSelector: React.FC<ChildSelectorProps> = ({ familyMembers, selectedChildId, onSelectChild, isLoading, ageThresholdYears }) => {
  const eligibleChildren = familyMembers.filter(member => {
    if (!member.dateOfBirth) return false;
    const birthDate = new Date(member.dateOfBirth);
    const ageInMilliseconds = new Date().getTime() - birthDate.getTime();
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    return ageInYears < ageThresholdYears &&
      (member.relationshipToUser?.toLowerCase().includes('child') ||
        member.relationshipToUser?.toLowerCase().includes('son') ||
        member.relationshipToUser?.toLowerCase().includes('daughter'));
  });

  if (isLoading) {
    return <p className="text-sm text-textSecondary p-2">Loading children...</p>;
  }

  if (eligibleChildren.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md text-center">
        No children eligible for Baby Care module found (under {ageThresholdYears} years old and identified as child/son/daughter).
        Please <Link to="/family-profiles" className="font-semibold underline">add or update a child profile</Link> first.
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label htmlFor="childSelector" className="block text-sm font-medium text-textSecondary mb-1">Select Child Profile:</label>
      <select
        id="childSelector"
        value={selectedChildId || ''}
        onChange={(e) => onSelectChild(e.target.value)}
        className="w-full sm:w-auto p-2.5 border border-slate-300 rounded-md focus:ring-primary focus:border-primary bg-white shadow-sm"
        aria-label="Select child profile for baby care module"
      >
        <option value="" disabled>-- Select a Child --</option>
        {eligibleChildren.map(child => (
          <option key={child.id} value={child.id}>{child.name}</option>
        ))}
      </select>
    </div>
  );
};

export default ChildSelector;
