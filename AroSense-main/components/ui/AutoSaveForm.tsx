import React, { useState, useEffect } from 'react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { AutoSaveStatus } from './AutoSaveStatus';
import { Button } from './Button';

interface AutoSaveFormProps {
  formKey: string;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onAutoSave?: (data: any) => Promise<void>;
  children: (props: {
    data: any;
    updateData: (updates: any) => void;
    isSaving: boolean;
  }) => React.ReactNode;
  className?: string;
}

export const AutoSaveForm: React.FC<AutoSaveFormProps> = ({
  formKey,
  initialData = {},
  onSubmit,
  onAutoSave,
  children,
  className = ''
}) => {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isSaving, lastSaved, loadSavedData, clearSavedData } = useAutoSave(
    formData,
    {
      key: formKey,
      onSave: onAutoSave
    }
  );

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadSavedData();
    if (savedData && Object.keys(savedData).length > 0) {
      setFormData({ ...initialData, ...savedData });
    }
  }, []);

  const updateData = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      clearSavedData();
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children({ data: formData, updateData, isSaving })}
      
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <AutoSaveStatus isSaving={isSaving} lastSaved={lastSaved} />
        <Button 
          type="submit" 
          disabled={isSubmitting || isSaving}
          className="min-w-[100px]"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};