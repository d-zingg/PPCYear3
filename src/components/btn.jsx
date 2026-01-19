import React from 'react'

// Simple helper to advance a numeric step state
export function advanceStep(currentStep, setStep) {
  setStep(typeof currentStep === 'number' ? currentStep + 1 : 1)
}

// Reusable Next button component
export function NextButton({ onNext, label = 'Next', disabled = false, className = '' }) {
  return (
    <button
      type="button"
      onClick={onNext}
      disabled={disabled}
      className={"w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 " + className}
    >
      {label}
    </button>
  )
}

export default NextButton
