import React from 'react';

interface DateTimeInputGroupProps {
  dateId: string;
  timeId: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  dateLabel?: string;
  timeLabel?: string;
  required?: boolean;
}

const DateTimeInputGroup: React.FC<DateTimeInputGroupProps> = ({
  dateId,
  timeId,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  dateLabel = "Date",
  timeLabel = "Time",
  required = false,
}) => {
  return (
    <>
      <div>
        <label htmlFor={dateId} className="form-label-wellness">{dateLabel}{required && <span className="text-red-500">*</span>}</label>
        <input 
          type="date" 
          id={dateId} 
          value={dateValue} 
          onChange={e => onDateChange(e.target.value)} 
          className="form-input-wellness"
          required={required}
        />
      </div>
      <div>
        <label htmlFor={timeId} className="form-label-wellness">{timeLabel}{required && <span className="text-red-500">*</span>}</label>
        <input 
          type="time" 
          id={timeId} 
          value={timeValue} 
          onChange={e => onTimeChange(e.target.value)} 
          className="form-input-wellness"
          required={required}
        />
      </div>
    </>
  );
};

export default DateTimeInputGroup;
