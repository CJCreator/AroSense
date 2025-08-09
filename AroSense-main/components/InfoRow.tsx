import React from 'react';

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, className = '' }) => (
  <div className={`flex flex-col p-3 bg-slate-50 rounded-md ${className}`}>
    <span className="text-sm font-medium">{label}</span>
    <span className="text-xs">{value}</span>
  </div>
);

export default InfoRow;
