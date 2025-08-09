import React from 'react';
import { Outlet } from 'react-router-dom';
import { APP_NAME } from '../constants.tsx';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary">{APP_NAME}</h1>
        <p className="text-textSecondary mt-1">Your Family Medical Hub</p>
      </div>
      <div className="w-full max-w-md bg-surface p-8 rounded-xl shadow-2xl">
        <Outlet /> 
      </div>
       <p className="text-center text-sm text-textSecondary mt-8">
        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </p>
    </div>
  );
};

export default AuthLayout;
