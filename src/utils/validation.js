// Generic validation utility functions

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  // Simple phone validation - at least 10 digits
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

export const validateDate = (date, fieldName) => {
  if (!date) return null;
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `Please enter a valid ${fieldName}`;
  }
  return null;
};

export const validateNumber = (value, fieldName, min = 0) => {
  if (value === '' || value === undefined || value === null) return null;
  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  if (num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  return null;
};

export const validateLength = (value, fieldName, minLength, maxLength) => {
  if (!value) return null;
  const length = value.toString().length;
  if (length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  if (maxLength && length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }
  return null;
};

// Generic validation function
export const validateField = (value, rules, fieldName) => {
  for (const rule of rules) {
    let error = null;
    
    switch (rule.type) {
      case 'required':
        error = validateRequired(value, fieldName);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'date':
        error = validateDate(value, fieldName);
        break;
      case 'number':
        error = validateNumber(value, fieldName, rule.min);
        break;
      case 'length':
        error = validateLength(value, fieldName, rule.minLength, rule.maxLength);
        break;
      default:
        break;
    }
    
    if (error) {
      return error;
    }
  }
  
  return null;
};

// Validate entire form
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const fieldValue = formData[fieldName];
    const fieldLabel = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');
    const error = validateField(fieldValue, rules, fieldLabel);
    
    if (error) {
      errors[fieldName] = error;
    }
  }
  
  return errors;
};

// Validation rules for admission form
export const admissionFormValidationRules = {
  firstName: [
    { type: 'required' },
    { type: 'length', minLength: 2, maxLength: 50 }
  ],
  lastName: [
    { type: 'required' },
    { type: 'length', minLength: 2, maxLength: 50 }
  ],
  email: [
    { type: 'required' },
    { type: 'email' }
  ],
  phone: [
    { type: 'required' },
    { type: 'phone' }
  ],
  dateOfBirth: [
    { type: 'required' },
    { type: 'date' }
  ],
  admissionDate: [
    { type: 'required' },
    { type: 'date' }
  ],
  class: [
    { type: 'required' }
  ],
  section: [
    { type: 'required' }
  ],
  admissionFees: [
    { type: 'required' },
    { type: 'number', min: 0 }
  ],
  monthlyFees: [
    { type: 'required' },
    { type: 'number', min: 0 }
  ],
  totalFees: [
    { type: 'required' },
    { type: 'number', min: 0 }
  ]
};