import React from 'react';
import VideoCameraIcon from '../components/icons/VideoCameraIcon.tsx';
import LinkToComingSoon from '../components/LinkToComingSoon.tsx'; // Import shared component

const TelehealthPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-textPrimary">Telehealth Appointments</h2>
      </div>
      <div className="bg-surface p-8 rounded-xl shadow-lg text-center">
        <VideoCameraIcon className="w-16 h-16 text-primary mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-textPrimary mb-3">Virtual Consultations</h3>
        <p className="text-textSecondary max-w-md mx-auto">Connect with healthcare providers virtually. This feature will allow you to schedule and attend telehealth appointments directly through AroSense. Coming soon!</p>
        <div className="mt-6">
            <LinkToComingSoon />
        </div>
      </div>
    </div>
  );
};

export default TelehealthPage;
