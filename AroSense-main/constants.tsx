import { NavItem, BadgeDefinition, ActivityTypeForGamification } from './types';

import HomeIcon from './components/icons/HomeIcon';
import UsersIcon from './components/icons/UsersIcon';
// import EmergencyIcon from './components/icons/EmergencyIcon'; // Old icon
import PlusIcon from './components/icons/PlusIcon'; // New icon for Emergency Info (as Medical Cross)
// import DocumentIcon from './components/icons/DocumentIcon'; // Old icon
import FolderIcon from './components/icons/FolderIcon'; // New icon for Documents
import SettingsIcon from './components/icons/SettingsIcon';
import PillIcon from './components/icons/PillIcon';
import ShieldCheckIcon from './components/icons/ShieldCheckIcon';
import CreditCardIcon from './components/icons/CreditCardIcon';
import HeartbeatIcon from './components/icons/HeartbeatIcon';
import BabyIcon from './components/icons/BabyIcon';
import FemaleIcon from './components/icons/FemaleIcon';
import PregnantWomanIcon from './components/icons/PregnantWomanIcon';
// import SearchIcon from './components/icons/SearchIcon'; // Used in Header directly
// import PrinterIcon from './components/icons/PrinterIcon'; // Contextual, not in main nav
// import BookOpenIcon from './components/icons/BookOpenIcon'; // Contextual
import VideoCameraIcon from './components/icons/VideoCameraIcon';
import ChatBubbleLeftRightIcon from './components/icons/ChatBubbleLeftRightIcon';
import StarIcon from './components/icons/StarIcon'; // Added for Wellness Rewards


export const APP_NAME = "AroSense";

export const NAVIGATION_ITEMS: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon, isFeature: true },
  { name: 'Family Profiles', path: '/family-profiles', icon: UsersIcon, isFeature: true },
  { name: 'Emergency Info', path: '/emergency', icon: PlusIcon, isFeature: true }, // Updated icon
  { name: 'Documents', path: '/documents', icon: FolderIcon, isFeature: true }, // Updated icon
  { name: 'Prescriptions', path: '/prescriptions', icon: PillIcon, isFeature: true },
  { name: 'Insurance', path: '/insurance', icon: ShieldCheckIcon, isFeature: true },
  { name: 'Financial & Bills', path: '/financial', icon: CreditCardIcon, isFeature: true },
  { name: 'Wellness Tools', path: '/wellness', icon: HeartbeatIcon, isFeature: true },
  { name: 'Baby Care', path: '/baby-care', icon: BabyIcon, isFeature: true },
  { name: 'Women\'s Care', path: '/womens-care', icon: FemaleIcon, isFeature: true },
  { name: 'Pregnancy Tracker', path: '/pregnancy', icon: PregnantWomanIcon, isFeature: true },
  { name: 'Wellness Rewards', path: '/wellness-rewards', icon: StarIcon, isFeature: true, isNew: true },
  { name: 'Telehealth', path: '/telehealth', icon: VideoCameraIcon, isFeature: true, isNew: true },
  { name: 'Community Forum', path: '/community', icon: ChatBubbleLeftRightIcon, isFeature: true, isNew: true },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
];

export const FOOTER_LINKS = [
    { name: 'Privacy Policy', path: '/privacy'},
    { name: 'Terms of Service', path: '/terms'},
    { name: 'Contact Us', path: '/contact'},
];

export const DEFAULT_USER_PROFILE_IMAGE = 'https://picsum.photos/seed/defaultuser/200/200';
export const DEFAULT_FAMILY_MEMBER_IMAGE = 'https://picsum.photos/seed/familymember/100/100';

// --- Gamification Constants ---

export const POINTS_ALLOCATION = {
  [ActivityTypeForGamification.DAILY_APP_LAUNCH]: 5,
  [ActivityTypeForGamification.LOG_VITALS_WELLNESS]: 10,
  [ActivityTypeForGamification.LOG_WATER_WELLNESS]: 5,
  [ActivityTypeForGamification.LOG_BABY_MILESTONE]: 15, // Example points
};

export const INITIAL_BADGES: BadgeDefinition[] = [
  {
    id: 'badge_welcome_aboard',
    name: 'Welcome Aboard!',
    description: 'Awarded for your first engagement with AroSense wellness features.',
    icon: '🎉', 
    criteriaType: 'SPECIAL_WELCOME', // Handled by awardPointsForDailyLaunch
  },
  {
    id: 'badge_vital_spark',
    name: 'Vital Spark',
    description: 'Awarded for logging your first vital sign.',
    icon: '❤️', 
    criteriaType: 'FIRST_TIME_ACTION',
    criteriaValue: ActivityTypeForGamification.LOG_VITALS_WELLNESS,
  },
  {
    id: 'badge_aqua_initiate',
    name: 'Aqua Initiate',
    description: 'Awarded for logging water intake for the first time.',
    icon: '💧', 
    criteriaType: 'FIRST_TIME_ACTION',
    criteriaValue: ActivityTypeForGamification.LOG_WATER_WELLNESS,
  },
  {
    id: 'badge_wellness_insight_pro',
    name: 'Wellness Insight Pro',
    description: 'Unlock deeper insights by consistently tracking your vitals.',
    icon: '🧠',
    criteriaType: 'LOG_COUNT',
    criteriaTargetActivity: ActivityTypeForGamification.LOG_VITALS_WELLNESS,
    criteriaValue: 5, // Log 5 vital signs
    rewardMessage: 'Your consistent vital logging helps us understand your health patterns better. Keep it up for more personalized feedback!',
  },
  {
    id: 'badge_baby_development_explorer',
    name: 'Baby Development Explorer',
    description: "Unlock helpful tips as your baby achieves new milestones.",
    icon: '👶✨',
    criteriaType: 'LOG_COUNT',
    criteriaTargetActivity: ActivityTypeForGamification.LOG_BABY_MILESTONE,
    criteriaValue: 3, // Log 3 baby milestones
    rewardMessage: "Watching your baby grow is exciting! Here are some general tips for supporting development at this stage. (Full guide coming soon!)",
  },
];