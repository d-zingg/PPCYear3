import React from 'react'

// Simple helper to advance a numeric step state
export function advanceStep(currentStep, setStep) {
	setStep(typeof currentStep === 'number' ? currentStep + 1 : 1)
}

// advanceStep: increments a numeric step value used by multi-step forms.
// - currentStep: the current numeric step value (number).
// - setStep: React state setter for the step (function).
// Behavior: if currentStep is numeric it increments by one, otherwise it sets step to 1.

// Reusable Next button component implemented without JSX
export function NextButton({ onNext, label = 'Next', disabled = false, className = '' }) {
	return React.createElement(
		'button',
		{
			type: 'button',
			onClick: onNext,
			disabled: disabled,
			className: 'w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 ' + className,
		},
		label
	)
}

// NextButton: a small reusable button used to advance form steps.
// Props:
// - onNext: callback invoked when the button is clicked.
// - label: visible text shown on the button (default: "Next").
// - disabled: when true the button is non-interactive and visually dimmed.
// - className: optional extra CSS classes.
// Implementation uses `React.createElement` so the file can remain a plain .js module.

export default NextButton
