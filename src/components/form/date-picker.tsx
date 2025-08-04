import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Indonesian } from 'flatpickr/dist/l10n/id.js';
import Label from './Label';
import { CalenderIcon } from '../../icons';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  enableMonthYearSelector?: boolean;
  minDate?: DateOption;
  maxDate?: DateOption;
  disabled?: boolean;
  className?: string;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  enableMonthYearSelector = true,
  minDate,
  maxDate,
  disabled = false,
  className,
}: PropsType) {
  const flatpickrRef = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    // Cleanup instance sebelumnya jika ada
    if (flatpickrRef.current) {
      flatpickrRef.current.destroy();
      flatpickrRef.current = null;
    }
    
    // Pastikan element ada di DOM
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with id "${id}" not found`);
      return;
    }

    try {
      // Pastikan konfigurasi ini ada di useEffect
      flatpickrRef.current = flatpickr(element, {
        mode: mode || "single",
        dateFormat: "Y-m-d",
        locale: Indonesian,
        // PENTING: Ini yang memungkinkan dropdown bulan dan tahun
        monthSelectorType: enableMonthYearSelector ? "dropdown" : "static",
        showMonths: 1,
        enableTime: mode === "time",
        noCalendar: mode === "time",
        allowInput: true,
        clickOpens: !disabled,
        defaultDate: defaultDate,
        minDate: minDate,
        maxDate: maxDate,
        onChange: onChange,
        disableMobile: true,
        position: "auto",
        // Event handlers untuk memastikan dropdown terlihat
        onReady: function(selectedDates, dateStr, instance) {
          const monthDropdown = instance.monthsDropdownContainer;
          const yearInput = instance.yearElements[0];
          
          if (monthDropdown) {
            monthDropdown.style.display = 'block';
            monthDropdown.style.visibility = 'visible';
            monthDropdown.style.opacity = '1';
          }
          
          if (yearInput) {
            yearInput.style.display = 'block';
            yearInput.style.visibility = 'visible';
            yearInput.style.opacity = '1';
          }
        },
        onOpen: function(selectedDates, dateStr, instance) {
          // Pastikan dropdown terlihat saat calendar dibuka
          setTimeout(() => {
            const monthDropdown = instance.monthsDropdownContainer;
            const yearInput = instance.yearElements[0];
            
            if (monthDropdown) {
              monthDropdown.style.display = 'block';
              monthDropdown.style.visibility = 'visible';
              monthDropdown.style.opacity = '1';
              monthDropdown.style.pointerEvents = 'auto';
            }
            
            if (yearInput) {
              yearInput.style.display = 'block';
              yearInput.style.visibility = 'visible';
              yearInput.style.opacity = '1';
              yearInput.style.pointerEvents = 'auto';
            }
          }, 10);
        }
      });

      // Handle disabled state
      if (disabled && flatpickrRef.current) {
        flatpickrRef.current.input.disabled = true;
      }

    } catch (error) {
      console.error('Error initializing flatpickr:', error);
    }

    // Cleanup function
    return () => {
      if (flatpickrRef.current) {
        try {
          flatpickrRef.current.destroy();
          flatpickrRef.current = null;
        } catch (error) {
          console.error('Error destroying flatpickr:', error);
        }
      }
    };

  }, [mode, onChange, id, defaultDate, enableMonthYearSelector, minDate, maxDate, disabled]);

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </Label>
      )}

      <div className="relative group">
        <input
          id={id}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            h-12 w-full rounded-xl border-2 appearance-none px-4 py-3 text-sm font-medium
            shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 
            transition-all duration-200 cursor-pointer
            ${
              disabled
                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700'
                : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:hover:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400/20'
            }
          `}
          readOnly
        />

        <span className={`
          absolute -translate-y-1/2 pointer-events-none right-4 top-1/2 transition-colors duration-200
          ${
            disabled
              ? 'text-gray-400'
              : 'text-gray-500 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300'
          }
        `}>
          <CalenderIcon className="w-5 h-5" />
        </span>
      </div>
    </div>
  );
}