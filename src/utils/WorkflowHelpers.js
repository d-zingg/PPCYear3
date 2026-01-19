/**
 * Workflow State Management
 * Implements multi-step workflow logic from the flow diagrams
 */

/**
 * Registration workflow states
 * Based on the user registration flow diagram
 */
export const REGISTRATION_STEPS = {
  BASIC_INFO: 0,
  DATE_OF_BIRTH: 1,
  CONFIRMATION: 2
};

/**
 * Class creation workflow states
 * Based on the class management flow diagram
 */
export const CLASS_CREATION_STEPS = {
  BASIC_INFO: 0,
  TEACHER_ASSIGNMENT: 1,
  STUDENT_ENROLLMENT: 2,
  REVIEW: 3
};

/**
 * Post creation workflow states
 * Based on the post management flow diagram
 */
export const POST_CREATION_STEPS = {
  CONTENT: 0,
  MEDIA: 1,
  SETTINGS: 2,
  PREVIEW: 3
};

/**
 * Assignment workflow states
 * Based on the assignment flow diagram
 */
export const ASSIGNMENT_WORKFLOW = {
  CREATE: 0,
  ASSIGN_CLASS: 1,
  SET_DEADLINE: 2,
  PUBLISH: 3
};

/**
 * Generic workflow state manager
 */
export class WorkflowManager {
  constructor(totalSteps) {
    this.totalSteps = totalSteps;
    this.currentStep = 0;
    this.data = {};
  }

  nextStep() {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      return true;
    }
    return false;
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      return true;
    }
    return false;
  }

  canProceed(validationFn) {
    return validationFn(this.data, this.currentStep);
  }

  setStepData(data) {
    this.data = { ...this.data, ...data };
  }

  getStepData() {
    return this.data;
  }

  reset() {
    this.currentStep = 0;
    this.data = {};
  }

  isFirstStep() {
    return this.currentStep === 0;
  }

  isLastStep() {
    return this.currentStep === this.totalSteps - 1;
  }

  getProgress() {
    return ((this.currentStep + 1) / this.totalSteps) * 100;
  }
}

/**
 * Validation helpers for workflows
 */
export const ValidationRules = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  
  password: (password) => password && password.length >= 6,
  
  required: (value) => value && value.toString().trim() !== '',
  
  phone: (phone) => /^\+?[\d\s\-()]+$/.test(phone),
  
  dateOfBirth: (day, month, year) => {
    return day && month && year && 
           parseInt(day) >= 1 && parseInt(day) <= 31 &&
           parseInt(month) >= 1 && parseInt(month) <= 12 &&
           parseInt(year) >= 1900 && parseInt(year) <= new Date().getFullYear();
  },
  
  passwordMatch: (password, confirmPassword) => password === confirmPassword
};

/**
 * Form state management helper
 */
export function createFormState(initialState = {}) {
  return {
    values: initialState,
    errors: {},
    touched: {},
    
    setValue(field, value) {
      this.values[field] = value;
      if (this.touched[field]) {
        delete this.errors[field];
      }
    },
    
    setError(field, error) {
      this.errors[field] = error;
    },
    
    setTouched(field) {
      this.touched[field] = true;
    },
    
    validate(rules) {
      const errors = {};
      for (const [field, rule] of Object.entries(rules)) {
        if (!rule(this.values[field], this.values)) {
          errors[field] = `Invalid ${field}`;
        }
      }
      this.errors = errors;
      return Object.keys(errors).length === 0;
    },
    
    reset() {
      this.values = initialState;
      this.errors = {};
      this.touched = {};
    }
  };
}
