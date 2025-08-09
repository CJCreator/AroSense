import React from 'react';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  primaryActionFormId?: string; // ID of the form to be submitted by the primary action button
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const AppModal: React.FC<AppModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  primaryActionText,
  onPrimaryAction,
  primaryActionFormId,
  size = 'lg'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 transition-opacity duration-300" role="dialog" aria-modal="true" aria-labelledby="app-modal-title">
      <div className={`bg-surface p-5 sm:p-6 rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
        <h3 id="app-modal-title" className="text-lg sm:text-xl font-semibold mb-4 text-textPrimary">{title}</h3>
        <div className="overflow-y-auto mb-6 flex-grow">
            {children}
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-textPrimary bg-slate-200 rounded-md hover:bg-slate-300 transition"
          >
            Cancel
          </button>
          {primaryActionText && (
            <button
              type={primaryActionFormId ? "submit" : "button"}
              form={primaryActionFormId || undefined}
              onClick={!primaryActionFormId ? onPrimaryAction : undefined} // onClick is only for non-form-submitting actions
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition"
            >
              {primaryActionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppModal;
