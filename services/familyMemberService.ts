import { FamilyMember, Gender } from '../types.ts';
import { DEFAULT_USER_PROFILE_IMAGE } from '../constants.tsx';

const initialFamilyMembersForNewUser = (userId: string, userName: string): FamilyMember => ({
    id: `self_${userId}`,
    user_id: userId,
    name: userName,
    dateOfBirth: '1990-01-01', // Placeholder date, user should update
    gender: Gender.PreferNotToSay,
    relationshipToUser: 'Self',
    profileImageUrl: DEFAULT_USER_PROFILE_IMAGE,
    allergies: [],
    medicalConditions: [],
    medications: [],
});

export const getFamilyMembers = async (userId: string, userNameIfNew: string): Promise<FamilyMember[]> => {
  if (!userId) return Promise.resolve([]);

  const key = `${userId}_family_members`;
  try {
    const storedMembers = localStorage.getItem(key);
    if (storedMembers) {
      const members = JSON.parse(storedMembers);
      // Ensure there's at least a 'Self' profile. This handles cases where local storage might be empty for an existing user.
      if (members.length > 0 && members.some((m: FamilyMember) => m.relationshipToUser === 'Self')) {
        return Promise.resolve(members);
      }
    }

    // If no members or no 'Self' profile, create one.
    const initialMember = initialFamilyMembersForNewUser(userId, userNameIfNew);
    localStorage.setItem(key, JSON.stringify([initialMember]));
    return Promise.resolve([initialMember]);
  } catch (error) {
    console.error("Error with localStorage in getFamilyMembers:", error);
    // On error, still provide a default self profile in memory for the session to work
    return Promise.resolve([initialFamilyMembersForNewUser(userId, userNameIfNew)]);
  }
};

export const addFamilyMember = async (userId: string, newMemberData: Omit<FamilyMember, 'id'|'user_id'>): Promise<FamilyMember> => {
  if (!userId) throw new Error("User ID is required to add a family member.");
  
  const key = `${userId}_family_members`;
  const members = await getFamilyMembers(userId, ''); // Get current members
  
  const newMember: FamilyMember = {
    ...newMemberData,
    id: Date.now().toString(),
    user_id: userId,
  };
  
  members.push(newMember);
  localStorage.setItem(key, JSON.stringify(members));
  return Promise.resolve(newMember);
};

export const updateFamilyMember = async (userId: string, updatedMember: FamilyMember): Promise<FamilyMember> => {
  if (!userId || !updatedMember.id) throw new Error("User ID and Member ID are required to update.");
  
  const key = `${userId}_family_members`;
  const members = await getFamilyMembers(userId, '');
  
  const memberIndex = members.findIndex(m => m.id === updatedMember.id);
  if (memberIndex === -1) {
    // If not found, add them. This can happen if the initial 'Self' profile ID changes.
    members.push(updatedMember);
  } else {
    members[memberIndex] = updatedMember;
  }
  
  localStorage.setItem(key, JSON.stringify(members));
  return Promise.resolve(updatedMember);
};

export const deleteFamilyMember = async (userId: string, memberId: string): Promise<void> => {
  if (!userId || !memberId) throw new Error("User ID and Member ID are required to delete.");

  const key = `${userId}_family_members`;
  let members = await getFamilyMembers(userId, '');
  
  // Prevent deleting the 'Self' profile
  const memberToDelete = members.find(m => m.id === memberId);
  if (memberToDelete && memberToDelete.relationshipToUser === 'Self') {
      alert("Cannot delete the primary 'Self' profile.");
      return Promise.resolve();
  }

  members = members.filter(m => m.id !== memberId);
  localStorage.setItem(key, JSON.stringify(members));
  return Promise.resolve();
};