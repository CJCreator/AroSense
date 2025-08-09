import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './ui/Card';
import Button from './ui/Button';
import { Input } from './ui/Input';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: currentUser?.user_metadata?.name || '',
    age: '',
    height: '',
    weight: '',
    goals: [] as string[]
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to AroSense!',
      description: 'Let\'s set up your health profile in just a few steps.',
      component: (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-white">👋</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to AroSense!</h2>
          <p className="text-gray-600 mb-6">Your comprehensive family health management platform</p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">👥</span>
              </div>
              <p className="text-sm text-gray-600">Family Profiles</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">📊</span>
              </div>
              <p className="text-sm text-gray-600">Health Tracking</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">🚨</span>
              </div>
              <p className="text-sm text-gray-600">Emergency Info</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'profile',
      title: 'Basic Information',
      description: 'Tell us a bit about yourself to personalize your experience.',
      component: (
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={userData.name}
            onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your full name"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Age"
              type="number"
              value={userData.age}
              onChange={(e) => setUserData(prev => ({ ...prev, age: e.target.value }))}
              placeholder="Age"
            />
            <Input
              label="Height (ft)"
              value={userData.height}
              onChange={(e) => setUserData(prev => ({ ...prev, height: e.target.value }))}
              placeholder="5'8\""
            />
          </div>
          <Input
            label="Weight (lbs)"
            type="number"
            value={userData.weight}
            onChange={(e) => setUserData(prev => ({ ...prev, weight: e.target.value }))}
            placeholder="Enter weight"
          />
        </div>
      )
    },
    {
      id: 'goals',
      title: 'Health Goals',
      description: 'What would you like to focus on? (Select all that apply)',
      component: (
        <div className="space-y-3">
          {[
            'Lose weight',
            'Gain muscle',
            'Improve cardiovascular health',
            'Better sleep',
            'Reduce stress',
            'Track family health',
            'Manage medications',
            'Emergency preparedness'
          ].map(goal => (
            <label key={goal} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={userData.goals.includes(goal)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setUserData(prev => ({ ...prev, goals: [...prev.goals, goal] }));
                  } else {
                    setUserData(prev => ({ ...prev, goals: prev.goals.filter(g => g !== goal) }));
                  }
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">{goal}</span>
            </label>
          ))}
        </div>
      )
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Your AroSense profile is ready. Let\'s explore your dashboard.',
      component: (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome aboard!</h2>
          <p className="text-gray-600 mb-6">Your health journey starts now. Here's what you can do next:</p>
          <div className="space-y-3 text-left max-w-sm mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs">1</span>
              </div>
              <span className="text-sm text-gray-700">Add family members</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs">2</span>
              </div>
              <span className="text-sm text-gray-700">Set up emergency information</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs">3</span>
              </div>
              <span className="text-sm text-gray-700">Start tracking your health metrics</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Save onboarding data
      localStorage.setItem('arosense_onboarding_complete', 'true');
      localStorage.setItem('arosense_user_profile', JSON.stringify(userData));
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{currentStepData.title}</h1>
            <p className="text-gray-600 mb-6">{currentStepData.description}</p>
            {currentStepData.component}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};