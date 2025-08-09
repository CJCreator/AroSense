import type React from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
  PreferNotToSay = 'Prefer Not to Say',
}

// Added for dropdowns in the FamilyMemberForm
export const RELATIONSHIP_OPTIONS = [ 'Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Other' ] as const;
export const BLOOD_TYPE_OPTIONS = [ 'Unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-' ] as const;


export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  relationship: 'child' | 'spouse' | 'parent' | 'sibling' | 'other';
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  height_cm?: number;
  medical_notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Legacy fields for backward compatibility
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  emergencyContacts?: EmergencyContact[];
  profileImageUrl?: string;
  relationshipToUser?: string;
  primaryCarePhysician?: { name: string; phone: string };
  insuranceInfo?: { provider: string; policyId: string };
  emergencyNotes?: string;
  birthWeightKg?: number;
  birthHeightCm?: number;
  birthHeadCircumferenceCm?: number;
  isPremature?: boolean;
  gestationalAgeWeeks?: number;
}

export interface Document {
  id: string;
  user_id?: string;
  name: string;
  type: string; 
  uploadDate: string;
  fileUrl: string; 
  familyMemberId?: string; 
  version?: number;
  tags?: string[];
}

export interface Prescription {
  id: string;
  user_id?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribingDoctor: string;
  pharmacy?: string;
  refillDate?: string;
  familyMemberId: string;
}

export interface InsurancePolicy {
  id: string;
  user_id?: string;
  providerName: string;
  policyNumber: string;
  groupNumber?: string;
  memberId: string;
  coverageStartDate: string;
  coverageEndDate?: string;
  digitalCardUrl?: string;
  familyMemberId: string;
}

export interface MedicalBill {
  id: string;
  user_id?: string;
  providerName: string;
  serviceDate: string;
  amountDue: number;
  dueDate?: string;
  status: 'Paid' | 'Unpaid' | 'Pending';
  documentUrl?: string; 
  familyMemberId: string;
}

// NavItem used in constants.tsx and Sidebar.tsx
export interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isFeature?: boolean;
  isNew?: boolean;
}

// Women's Care Module Types
export interface PeriodEntry {
  id: string;
  user_id?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  notes?: string;
}

export interface SymptomLogEntry {
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  symptoms: string[]; 
  moods?: string[]; 
  customSymptom?: string;
  severity?: 'Mild' | 'Moderate' | 'Severe';
  notes?: string;
}

export const COMMON_SYMPTOMS = [
  'Cramps', 'Bloating', 'Headache', 'Mood Swings', 
  'Fatigue', 'Tender Breasts', 'Acne', 'Nausea', 'Dizziness',
  'Backache', 'Food Cravings', 'Irritability', 'Skin Changes', 'Sleep Issues'
];

export const MOOD_OPTIONS = [
    'Happy', 'Sad', 'Anxious', 'Irritable', 'Calm', 'Energetic', 'Stressed', 'Overwhelmed', 'Content', 'Frustrated'
];

export const SCREENING_TYPES = [
  'Pap Smear', 'Mammogram', 'HPV Test', 'Bone Density Scan (DEXA)',
  'Pelvic Exam', 'Breast Exam', 'Colonoscopy', 'Well-Woman Visit', 'Thyroid Check', 'Blood Sugar Test'
];

export interface ScreeningReminderEntry {
  id: string;
  user_id?: string;
  screeningType: string;
  lastScreeningDate?: string; // YYYY-MM-DD
  frequencyYears?: number; 
  reminderDate?: string; 
  nextDueDate?: string; // YYYY-MM-DD, calculated or set
  notes?: string;
  isCompleted?: boolean;
}

export interface EducationalArticle {
  id: string;
  title: string;
  category: string; 
  summary: string;
  contentUrl?: string; 
  tags?: string[];
  isNew?: boolean; // Optional flag for new articles
}

// Pregnancy Tracking Module Types
export interface PregnancyProfile {
  id: string; 
  user_id?: string;
  lmp?: string; 
  edd?: string; 
  conceptionDate?: string; 
}

export const PREGNANCY_COMMON_SYMPTOMS = [
  'Nausea', 'Vomiting', 'Fatigue', 'Breast Tenderness', 'Frequent Urination', 
  'Food Cravings', 'Food Aversions', 'Mood Swings', 'Heartburn', 'Constipation',
  'Dizziness', 'Backache', 'Leg Cramps', 'Swelling (Edema)', 'Shortness of Breath', 'Insomnia'
];

export interface PregnancySymptomEntry extends Omit<SymptomLogEntry, 'symptoms' | 'user_id'> {
  symptoms: string[]; // Pregnancy-specific symptoms
  user_id?: string;
}

export interface WeightLogEntry { // Used for general weight & pregnancy
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  weight: number;
  unit: 'kg' | 'lbs';
  notes?: string;
  familyMemberId?: string; // Optional: if tracking for family members
}

export interface BloodPressureLogEntry { // Used for general vitals & pregnancy
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  systolic: number;
  diastolic: number;
  pulse?: number; 
  notes?: string;
  familyMemberId?: string;
}

export interface GlucoseLogEntry { // Used for general vitals & pregnancy
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  readingTime: 'Fasting' | 'Post-Meal' | 'Random' | 'Before Meal' | 'After Meal';
  level: number; 
  unit: 'mg/dL' | 'mmol/L';
  notes?: string;
  familyMemberId?: string;
}

export interface KickCountSession {
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  kickCount: number;
  durationMinutes?: number; 
  notes?: string;
}

export interface ContractionEntry {
    id: string;
    timestamp: string; 
    durationSeconds: number;
}
export interface ContractionSession {
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM for the session
  entries: ContractionEntry[];
  notes?: string;
}

export interface PrenatalAppointment {
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  doctorOrClinic?: string;
  purpose?: string;
  questionsToAsk?: string;
  summaryOrNotes?: string;
  weightKg?: number;
  bloodPressure?: string; 
  fundalHeightCm?: number;
  fetalHeartRateBpm?: number;
  testsRecommended?: string[];
  nextAppointmentDate?: string;
}

// Postnatal Care Module Types
export const POSTPARTUM_COMMON_SYMPTOMS = [
    'Perineal Pain', 'Bleeding (Lochia)', 'Breast Engorgement', 'Nipple Soreness', 'Fatigue',
    'Constipation', 'Hemorrhoids', 'Night Sweats', 'Hair Loss', 'Incontinence'
];
export interface PostpartumRecoveryLogEntry {
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  physicalSymptoms: string[]; 
  customPhysicalSymptom?: string;
  bleedingLevel?: 'Heavy' | 'Moderate' | 'Light' | 'Spotting';
  painLevel?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; 
  notes?: string;
}

export interface MentalWellnessCheckinEntry {
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  moods: string[]; 
  energyLevel?: 1 | 2 | 3 | 4 | 5; 
  sleepQuality?: 1 | 2 | 3 | 4 | 5; 
  supportSystemRating?: 1 | 2 | 3 | 4 | 5; 
  notes?: string; 
}


// Wellness Tools Module Types

export interface VitalSignBase {
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM Optional
  notes?: string;
  familyMemberId?: string; // Assuming these can be logged for family members too
}

export interface BloodPressureReading extends VitalSignBase {
  type: 'BloodPressure';
  systolic: number;
  diastolic: number;
  pulse?: number; // Beats per minute
}

export interface HeartRateReading extends VitalSignBase {
  type: 'HeartRate';
  value: number; // Beats per minute
}

export interface BloodGlucoseReading extends VitalSignBase {
  type: 'BloodGlucose';
  level: number;
  unit: 'mg/dL' | 'mmol/L';
  readingContext: 'Fasting' | 'Post-Meal' | 'Random' | 'Before Meal' | 'After Meal';
}

export interface TemperatureReading extends VitalSignBase {
  type: 'Temperature';
  value: number;
  unit: 'Celsius' | 'Fahrenheit';
}

export interface OxygenSaturationReading extends VitalSignBase {
  type: 'OxygenSaturation';
  value: number; // Percentage
}

export type VitalLog = BloodPressureReading | HeartRateReading | BloodGlucoseReading | TemperatureReading | OxygenSaturationReading;

export interface BMIRecord { // Re-using/enhancing existing
  id: string;
  user_id?: string;
  date: string;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  height: number; // Assuming height is relatively stable, stored in cm
  heightUnit: 'cm' | 'inches';
  bmi: number;
  familyMemberId?: string;
}

export interface WeightGoal {
  user_id?: string;
  targetWeight?: number;
  targetWeightUnit?: 'kg' | 'lbs';
  currentHeightForBMI?: number; // cm, to ensure BMI calculations are consistent
  heightUnitForBMI?: 'cm' | 'inches';
}

export const ACTIVITY_TYPES = ['Walking', 'Running', 'Cycling', 'Swimming', 'Gym Workout', 'Yoga', 'Dancing', 'Sports', 'Other'];
export const ACTIVITY_EFFORT_LEVELS = ['Light', 'Moderate', 'Intense'];

export interface ActivityLog extends VitalSignBase { // VitalSignBase for date/time/notes
  activityType: string;
  customActivityType?: string; // If 'Other' is selected
  durationMinutes: number;
  effortLevel?: typeof ACTIVITY_EFFORT_LEVELS[number];
  steps?: number;
  distance?: number;
  distanceUnit?: 'km' | 'miles';
}

export interface ActivityGoal {
  user_id?: string;
  steps?: number;
  durationMinutes?: number;
  type?: 'daily' | 'weekly';
}

export const SLEEP_QUALITY_RATINGS = ['Excellent', 'Good', 'Fair', 'Poor', 'Restless'];

export interface SleepLog extends VitalSignBase {
  bedTime: string; // HH:MM
  wakeTime: string; // HH:MM
  durationHours?: number; // Calculated
  quality?: typeof SLEEP_QUALITY_RATINGS[number];
}

export interface HydrationLog extends VitalSignBase {
  amount: number;
  unit: 'ml' | 'oz' | 'glasses';
}

export interface HydrationGoal {
  user_id?: string;
  targetAmount: number;
  targetUnit: 'ml' | 'oz' | 'glasses';
}

export const MOOD_RATING_OPTIONS = [
    { value: 5, label: 'Excellent' },
    { value: 4, label: 'Good' },
    { value: 3, label: 'Okay' },
    { value: 2, label: 'Bad' },
    { value: 1, label: 'Awful' },
];

export interface MoodLog extends VitalSignBase {
  moodRating?: number; // Could be a 1-5 scale
  selectedMoods?: string[]; // Or from MOOD_OPTIONS
  journal?: string;
}

export interface WellnessResource extends EducationalArticle {} // Can reuse structure for now

// For Wellness Dashboard summaries
export interface WellnessSummary {
    lastBP?: BloodPressureReading;
    currentWeight?: WeightLogEntry; // Use WeightLogEntry which is more flexible than BMIRecord for latest weight
    currentBMI?: number;
    weightGoal?: WeightGoal;
    todayActivityProgress?: { logged: number, goal?: number, unit: 'steps' | 'minutes' };
    todayHydrationProgress?: { logged: number, goal?: number, unit: 'ml' | 'oz' | 'glasses' };
    lastMood?: MoodLog;
}

// Baby Care Module Specific types
export const BABY_AGE_THRESHOLD_YEARS = 5; // Children under this age are eligible for Baby Care module

export const FEED_TYPES = ['Breast Milk (Direct)', 'Breast Milk (Bottle)', 'Formula', 'Solid Food'] as const;
export type FeedType = typeof FEED_TYPES[number];

export interface FeedingLogEntry {
  id: string;
  user_id: string;
  childId: string;
  timestamp: string; // ISO string for date and time
  feedType: FeedType;
  amountMl?: number; // For bottle/formula
  durationMinutes?: number; // For breastfeeding
  breastSide?: 'Left' | 'Right' | 'Both'; // For breastfeeding
  foodDetails?: string; // For solid food: name, reaction
  notes?: string;
}

export const DIAPER_TYPES = ['Wet', 'Soiled', 'Mixed (Wet & Soiled)'] as const;
export type DiaperType = typeof DIAPER_TYPES[number];

export interface DiaperLogEntry {
  id: string;
  user_id: string;
  childId: string;
  timestamp: string; // ISO string for date and time
  diaperType: DiaperType;
  consistency?: 'Normal' | 'Loose' | 'Hard'; // Optional for soiled
  color?: string; // Optional for soiled
  notes?: string;
}

export interface BabySleepLogEntry {
  id: string;
  user_id: string;
  childId: string;
  startTime: string; // ISO string for date and time
  endTime: string;   // ISO string for date and time
  durationHours?: number; // Calculated from start/end, store in hours for easier display
  location?: string; // e.g., Crib, Bassinet, Parent's Bed
  notes?: string;
}

export interface GrowthRecordEntry {
  id: string;
  user_id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  weightKg?: number;
  heightCm?: number;
  headCircumferenceCm?: number;
  notes?: string;
}

export const MILESTONE_CATEGORIES = ['Motor', 'Cognitive', 'Speech & Language', 'Social & Emotional', 'Sensory'] as const;
export type MilestoneCategory = typeof MILESTONE_CATEGORIES[number];

export interface MilestoneEntry {
  id: string;
  user_id: string;
  childId: string;
  milestoneName: string;
  category: MilestoneCategory;
  achievedDate?: string; // YYYY-MM-DD
  isAchieved: boolean;
  expectedDateRange?: { start: string, end: string }; // Optional: for display
  tips?: string; // Optional: short tips for encouraging this milestone
  notes?: string;
  photoUrl?: string; // Placeholder for media
  videoUrl?: string; // Placeholder for media
}

export interface VaccineInfo {
  name: string;
  description?: string;
  ageDue: string; // e.g., "Birth", "6 Weeks", "10 Weeks"
  dosesInSeries?: number;
  protectsAgainst?: string[];
}

export const MOCK_VACCINE_SCHEDULE: VaccineInfo[] = [
  { name: 'BCG (Bacillus Calmette-Guérin)', ageDue: 'At Birth', dosesInSeries: 1, protectsAgainst: ['Tuberculosis (severe forms in children)'] },
  { name: 'Hepatitis B - Birth dose', ageDue: 'At Birth', dosesInSeries: 1, protectsAgainst: ['Hepatitis B'] },
  { name: 'OPV-0 (Oral Polio Vaccine - Birth dose)', ageDue: 'At Birth', dosesInSeries: 1, protectsAgainst: ['Polio'] },
  { name: 'DTwP/DTaP - 1 (Diphtheria, Tetanus, Pertussis)', ageDue: '6 Weeks', dosesInSeries: 3, protectsAgainst: ['Diphtheria', 'Tetanus', 'Pertussis'] },
  { name: 'IPV - 1 (Inactivated Polio Vaccine)', ageDue: '6 Weeks', dosesInSeries: 2, protectsAgainst: ['Polio'] },
  { name: 'Hepatitis B - 1', ageDue: '6 Weeks', dosesInSeries: 3, protectsAgainst: ['Hepatitis B'] },
  { name: 'Hib - 1 (Haemophilus influenzae type b)', ageDue: '6 Weeks', dosesInSeries: 3, protectsAgainst: ['Meningitis', 'Pneumonia'] },
  { name: 'Rotavirus - 1', ageDue: '6 Weeks', dosesInSeries: 3, protectsAgainst: ['Rotaviral Diarrhea'] },
  { name: 'PCV - 1 (Pneumococcal Conjugate Vaccine)', ageDue: '6 Weeks', dosesInSeries: 3, protectsAgainst: ['Pneumonia', 'Meningitis'] },
  // Add more based on IAP schedule
  { name: 'MMR - 1 (Measles, Mumps, Rubella)', ageDue: '9 Months', dosesInSeries: 2, protectsAgainst: ['Measles', 'Mumps', 'Rubella'] },
];

export interface VaccinationEntry {
  id: string;
  user_id: string;
  childId: string;
  vaccineName: string;
  doseNumber?: number; // e.g., 1st, 2nd, Booster
  administeredDate: string; // YYYY-MM-DD
  administeredBy?: string; // Doctor/Clinic Name
  brandAndBatchNumber?: string;
  notes?: string;
}

export interface BabyMedicationLog {
  id: string;
  user_id: string;
  childId: string;
  medicationName: string;
  dosage: string;
  timeAdministered: string; // ISO string for date and time
  reason?: string;
  notes?: string;
}

export interface BabyTemperatureLog {
  id: string;
  user_id: string;
  childId: string;
  timestamp: string; // ISO string for date and time
  temperatureCelsius: number;
  measurementSite?: 'Oral' | 'Rectal' | 'Axillary' | 'Tympanic' | 'Forehead';
  notes?: string;
}

export const COMMON_BABY_SYMPTOMS = ['Fever', 'Cough', 'Runny Nose', 'Rash', 'Vomiting', 'Diarrhea', 'Constipation', 'Colic', 'Teething Pain', 'Irritability', 'Poor Feeding', 'Lethargy'] as const;
export type BabySymptom = typeof COMMON_BABY_SYMPTOMS[number];

export interface BabySymptomLog {
  id: string;
  user_id: string;
  childId: string;
  timestamp: string; // ISO string for date and time
  symptoms: BabySymptom[];
  customSymptom?: string;
  severity?: 'Mild' | 'Moderate' | 'Severe';
  durationHours?: number;
  notes?: string;
  linkedDoctorVisitId?: string; // Placeholder
}

export interface FirstsJournalEntry {
  id: string;
  user_id: string;
  childId: string;
  title: string; // e.g., "First Smile", "First Steps"
  date: string; // YYYY-MM-DD
  description: string;
  photoUrl?: string;
  videoUrl?: string;
}

export interface BabyCareResource extends EducationalArticle {} // Re-use for now

export const MOCK_MILESTONES_CHECKLIST: Omit<MilestoneEntry, 'id'|'childId'|'achievedDate'|'isAchieved'|'notes'|'photoUrl'|'videoUrl'|'user_id'>[] = [
    { milestoneName: 'Smiles socially', category: 'Social & Emotional', expectedDateRange: { start: '1M', end: '3M' } },
    { milestoneName: 'Coos, makes gurgling sounds', category: 'Speech & Language', expectedDateRange: { start: '1M', end: '3M' } },
    { milestoneName: 'Follows things with eyes', category: 'Sensory', expectedDateRange: { start: '1M', end: '3M' } },
    { milestoneName: 'Holds head up', category: 'Motor', expectedDateRange: { start: '2M', end: '4M' } },
    { milestoneName: 'Rolls over (tummy to back)', category: 'Motor', expectedDateRange: { start: '4M', end: '6M' } },
    { milestoneName: 'Sits without support', category: 'Motor', expectedDateRange: { start: '6M', end: '8M' } },
    { milestoneName: 'Crawls', category: 'Motor', expectedDateRange: { start: '7M', end: '10M' } },
    { milestoneName: 'Says "mama" or "dada"', category: 'Speech & Language', expectedDateRange: { start: '9M', end: '12M' } },
    { milestoneName: 'Walks alone', category: 'Motor', expectedDateRange: { start: '12M', end: '18M' } },
];


// --- Baby Nutrition Feature Types ---
export interface FoodItem {
  id: string;
  name:string; 
  category?: string; 
  caloriesPerServing?: number; 
  servingSize?: string; 
}

export interface LoggedFoodItem {
  foodItemId?: string; 
  customFoodName?: string; 
  quantity: number;
  unit: 'g' | 'ml' | 'tbsp' | 'tsp' | 'piece' | 'slice' | 'cup' | 'oz' | string;
  calories?: number; 
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'SnackAM' | 'SnackPM' | 'Other';

export interface FoodLogEntry {
  id: string;
  user_id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  mealType: MealType;
  items: LoggedFoodItem[];
  notes?: string;
  isNewFoodIntroduction?: boolean; 
  newFoodReaction?: 'None' | 'Mild' | 'Moderate' | 'Severe';
  newFoodReactionNotes?: string;
}

export interface MealPlanItem {
  foodDescription: string; 
  category?: string; 
}
export interface SampleMeal {
  breakfast: MealPlanItem[];
  midMorningSnack?: MealPlanItem[];
  lunch: MealPlanItem[];
  afternoonSnack?: MealPlanItem[];
  dinner: MealPlanItem[];
}
export interface AgeGroupedSampleMealPlan {
  id: string;
  ageRange: '6-8m' | '9-11m' | '12-18m' | '18-24m' | '2-3y';
  title: string; 
  plan: SampleMeal;
  notes?: string;
}

export interface BabyRecipe {
  id: string;
  title: string;
  ageAppropriate: '6m+' | '8m+' | '10m+' | '12m+';
  category: 'Puree' | 'Porridge' | 'FingerFood' | 'Meal' | 'Snack';
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: string;
  ingredients: { name: string, quantity: string }[];
  instructions: string[]; 
  notes?: string;
  imageUrl?: string; 
  tags?: string[];
}

export interface NutritionArticle extends EducationalArticle {
  nutritionCategory: 'Breastfeeding' | 'Formula' | 'Weaning' | 'ToddlerDiet' | 'Allergies' | 'FussyEating' | 'FoodSafety';
}

export const COMMON_INDIAN_FIRST_FOODS = [
    { name: 'Rice Cereal (Homemade)', category: 'Grain' },
    { name: 'Ragi Porridge (Finger Millet)', category: 'Grain' },
    { name: 'Moong Dal Soup (Yellow Lentil Soup, strained)', category: 'Protein' },
    { name: 'Mashed Banana', category: 'Fruit' },
    { name: 'Steamed & Mashed Carrot', category: 'Vegetable' },
    { name: 'Steamed & Mashed Sweet Potato', category: 'Vegetable' },
    { name: 'Steamed & Mashed Pumpkin', category: 'Vegetable' },
    { name: 'Apple Puree (Steamed)', category: 'Fruit' },
    { name: 'Pear Puree (Steamed)', category: 'Fruit' },
    { name: 'Suजी Kheer (Semolina Porridge, thin)', category: 'Grain'},
];

export const COMMON_FOOD_ALLERGENS = [
    'Cow\'s Milk', 'Eggs', 'Peanuts', 'Tree Nuts (e.g., Almonds, Walnuts)', 
    'Soy', 'Wheat', 'Fish', 'Shellfish'
];


// --- Gamification Types ---
export interface UserPoints {
  user_id: string;
  totalPoints: number;
  lastDailyLoginAwardDate?: string; // YYYY-MM-DD
}

export enum ActivityTypeForGamification {
  DAILY_APP_LAUNCH = 'DAILY_APP_LAUNCH',
  LOG_VITALS_WELLNESS = 'LOG_VITALS_WELLNESS',
  LOG_WATER_WELLNESS = 'LOG_WATER_WELLNESS',
  LOG_BABY_MILESTONE = 'LOG_BABY_MILESTONE',
  // Add more as features are integrated
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or simple text/SVG path for now
  criteriaType: 'FIRST_TIME_ACTION' | 'LOG_COUNT' | 'POINTS_THRESHOLD' | 'SPECIAL_WELCOME';
  criteriaValue?: ActivityTypeForGamification | number; // For FIRST_TIME_ACTION (activity), LOG_COUNT (count threshold), POINTS_THRESHOLD (points threshold)
  criteriaTargetActivity?: ActivityTypeForGamification; // For LOG_COUNT: which activity's count to check
  rewardMessage?: string; // For meaningful reward popups/info
  pointsRequired?: number; // Kept for legacy if needed, prefer criteriaValue for POINTS_THRESHOLD
}


export interface EarnedBadge {
  user_id: string;
  badgeId: string;
  earnedDate: string; // YYYY-MM-DD
}

export interface ActivityStreak {
  user_id: string;
  activityType: ActivityTypeForGamification; // e.g., LOG_WATER_WELLNESS for daily water streak
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string; // YYYY-MM-DD, to check for consecutive days
}

export interface LogCount {
    user_id: string;
    activityType: ActivityTypeForGamification;
    count: number;
}


// --- Authentication Types ---
export interface AppUser extends SupabaseUser {
    // This allows us to use Supabase's user object directly
    // And if we need to add custom app-specific properties, we can add them here
    // For now, we'll get the name from user_metadata

    // Explicitly defining properties used in the app to fix type errors.
    // This suggests the base 'SupabaseUser' type might not be fully resolved in the environment.
    id: string;
    user_metadata: {
      name?: string;
      [key: string]: any;
    };
}

export interface AuthContextType {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, passwordPlainText: string) => Promise<{ success: boolean; error: string | null }>;
  register: (name: string, email: string, passwordPlainText: string) => Promise<{ success: boolean; error: string | null }>;
  logout: () => Promise<void>;
}