import React from 'react';
import CreditCardIcon from '../components/icons/CreditCardIcon.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import LinkToComingSoon from '../components/LinkToComingSoon.tsx'; // Import shared component

const FinancialPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-textPrimary">Financial & Bill Management</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition self-start sm:self-auto">
            <PlusIcon className="w-5 h-5" />
            <span>Add Bill/Expense</span>
        </button>
      </div>
      <div className="bg-surface p-8 rounded-xl shadow-lg text-center">
        <CreditCardIcon className="w-16 h-16 text-primary mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-textPrimary mb-3">Medical Expense Tracker</h3>
        <p className="text-textSecondary max-w-md mx-auto">This module is under construction. It will soon help you store medical bills, track expenses, and generate reports for better financial clarity.</p>
        <div className="mt-6">
            <LinkToComingSoon />
        </div>
      </div>
    </div>
  );
};

export default FinancialPage;