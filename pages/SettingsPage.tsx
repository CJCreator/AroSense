import React from 'react';
import SettingsIcon from '../components/icons/SettingsIcon.tsx';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-textPrimary">Settings</h2>
      </div>
      <div className="bg-surface p-8 rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
            <SettingsIcon className="w-10 h-10 text-primary mr-4" />
            <h3 className="text-xl font-semibold text-textPrimary">Application Settings</h3>
        </div>
        
        <div className="space-y-8">
            {/* Account Settings */}
            <section>
                <h4 className="text-lg font-medium text-textPrimary border-b pb-2 mb-4">Account</h4>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-textSecondary">Username</label>
                        <input type="text" id="username" defaultValue="current_user" className="mt-1 block w-full md:w-1/2 p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-textSecondary">Email Address</label>
                        <input type="email" id="email" defaultValue="user@example.com" className="mt-1 block w-full md:w-1/2 p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white" />
                    </div>
                     <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Update Account</button>
                </div>
            </section>

            {/* Security Settings */}
            <section>
                <h4 className="text-lg font-medium text-textPrimary border-b pb-2 mb-4">Security</h4>
                 <div className="space-y-4">
                    <p className="text-textSecondary">Multi-Factor Authentication, Biometric Lock, and other security settings will be available here.</p>
                    <button className="px-4 py-2 bg-secondary text-textPrimary rounded-md hover:bg-secondary-dark">Configure Security</button>
                 </div>
            </section>

            {/* Notification Settings */}
            <section>
                <h4 className="text-lg font-medium text-textPrimary border-b pb-2 mb-4">Notifications</h4>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <input id="emailNotifications" type="checkbox" className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary" defaultChecked />
                        <label htmlFor="emailNotifications" className="ml-2 block text-sm text-textPrimary">Email Notifications</label>
                    </div>
                    <div className="flex items-center">
                        <input id="pushNotifications" type="checkbox" className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary" />
                        <label htmlFor="pushNotifications" className="ml-2 block text-sm text-textPrimary">Push Notifications (Mobile App)</label>
                    </div>
                </div>
            </section>
             <p className="text-textSecondary pt-4 border-t border-slate-200">More settings for data export, privacy controls, and theme customization will appear here as features are developed.</p>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
