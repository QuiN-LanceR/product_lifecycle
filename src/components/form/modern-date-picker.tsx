"use client";
import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Label from './Label';
import { CalenderIcon } from '../../icons';

interface ModernDatePickerProps {
  id: string;
  label?: string;
  placeholder?: string;
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  dateFormat?: string;
  showMonthYearPicker?: boolean;
  showYearPicker?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  isClearable?: boolean;
  showTimeSelect?: boolean;
  className?: string;
}

// Custom input component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder, className }, ref) => (
  <div className="relative">
    <input
      ref={ref}
      value={value}
      onClick={onClick}
      placeholder={placeholder}
      readOnly
      className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:focus:border-brand-800 transition-all duration-200 cursor-pointer ${className}`}
    />
    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
      <CalenderIcon className="size-6" />
    </span>
  </div>
));

CustomInput.displayName = 'CustomInput';

export default function ModernDatePicker({
  id,
  label,
  placeholder = "Pilih tanggal",
  selected,
  onChange,
  dateFormat = "dd/MM/yyyy",
  showMonthYearPicker = false,
  showYearPicker = false,
  minDate,
  maxDate,
  disabled = false,
  isClearable = true,
  showTimeSelect = false,
  className
}: ModernDatePickerProps) {
  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      
      <DatePicker
        id={id}
        selected={selected}
        onChange={onChange}
        dateFormat={dateFormat}
        showMonthYearPicker={showMonthYearPicker}
        showYearPicker={showYearPicker}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        isClearable={isClearable}
        showTimeSelect={showTimeSelect}
        customInput={<CustomInput placeholder={placeholder} className={className} />}
        popperClassName="z-50"
        calendarClassName="shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg"
        dayClassName={() =>
          "hover:bg-brand-500 hover:text-white rounded transition-colors duration-200 cursor-pointer"
        }
        monthClassName={() => 
          "hover:bg-brand-500 hover:text-white rounded transition-colors duration-200 cursor-pointer m-1 p-2"
        }
        yearClassName={() => 
          "hover:bg-brand-500 hover:text-white rounded transition-colors duration-200 cursor-pointer m-1 p-2"
        }
        // Lokalisasi
        locale="id"
        showPopperArrow={false}
      />
    </div>
  );
}