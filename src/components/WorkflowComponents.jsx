import React from 'react';

/**
 * WorkflowProgress - Visual progress indicator for multi-step workflows
 * Based on the multi-step flows shown in the diagrams
 */
export function WorkflowProgress({ currentStep, totalSteps, steps }) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-6 shadow-inner">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              {/* Circle Indicator */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                  transition-all duration-300 transform
                  ${isCompleted ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg scale-110' : ''}
                  ${isCurrent ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-4 ring-blue-200 shadow-xl scale-110 animate-pulse' : ''}
                  ${isUpcoming ? 'bg-gray-200 text-gray-500 hover:bg-gray-300' : ''}
                `}
              >
                {isCompleted ? '✓' : index + 1}
              </div>

              {/* Step Label */}
              <div
                className={`
                  mt-2 text-xs font-medium text-center
                  ${isCurrent ? 'text-blue-600' : ''}
                  ${isCompleted ? 'text-green-600' : ''}
                  ${isUpcoming ? 'text-gray-400' : ''}
                `}
              >
                {step}
              </div>

              {/* Connector Line */}
              {index < totalSteps - 1 && (
                <div className="hidden sm:block absolute h-0.5 bg-gray-300" style={{ width: 'calc(100% / ${totalSteps})' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Text */}
      <div className="text-center mt-4 text-sm text-gray-600">
        Step {currentStep + 1} of {totalSteps}
      </div>
    </div>
  );
}

/**
 * WorkflowNavigation - Navigation buttons for multi-step workflows
 */
export function WorkflowNavigation({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrevious, 
  onSubmit,
  canProceed = true,
  nextLabel = 'Next',
  previousLabel = 'Back',
  submitLabel = 'Submit'
}) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex gap-3 pt-6 border-t">
      {/* Back Button */}
      {!isFirstStep && (
        <button
          type="button"
          onClick={onPrevious}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all transform hover:scale-105 border-2 border-gray-300 hover:border-gray-400"
        >
          ← {previousLabel}
        </button>
      )}

      {/* Next/Submit Button */}
      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canProceed}
          className={`
            flex-1 py-3 rounded-lg font-semibold transition-all transform
            ${canProceed
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {canProceed ? `${submitLabel} ✓` : '⏳ Complete required fields'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`
            flex-1 py-3 rounded-lg font-semibold transition-all transform
            ${canProceed
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {canProceed ? `${nextLabel} →` : '⏳ Fill required fields'}
        </button>
      )}
    </div>
  );
}

/**
 * WorkflowContainer - Wrapper for multi-step workflow forms
 */
export function WorkflowContainer({ title, children, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

/**
 * ConfirmationStep - Standard confirmation step for workflows
 */
export function ConfirmationStep({ data, labels }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-blue-800 font-medium">
          📋 Please review your information before submitting
        </p>
      </div>

      <div className="bg-white border rounded-lg divide-y">
        {Object.entries(data).map(([key, value]) => {
          // Skip internal fields
          if (key.startsWith('_')) return null;
          
          const label = labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          const displayValue = Array.isArray(value) ? value.join(', ') : value;

          return (
            <div key={key} className="p-4 flex justify-between items-center">
              <span className="font-medium text-gray-700">{label}:</span>
              <span className="text-gray-900">{displayValue || 'N/A'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * FormField - Reusable form field component
 */
export function FormField({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error = null,
  options = null,
  disabled = false
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          required={required}
          disabled={disabled}
        >
          <option value="">Select {label}</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          rows={4}
          required={required}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border-2 rounded-lg transition-all focus:ring-4 focus:ring-blue-200 focus:border-blue-500 ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}`}
          required={required}
          disabled={disabled}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
