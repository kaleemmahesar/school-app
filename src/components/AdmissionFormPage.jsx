import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { addStudent, updateStudent } from '../store/studentsSlice';
import { fetchClasses } from '../store/classesSlice';
import { FaUserGraduate, FaIdCard, FaPhone, FaEnvelope, FaCalendar, FaSchool, FaMoneyBillWave, FaCamera, FaArrowLeft, FaPrint } from 'react-icons/fa';
import PrintableAdmissionForm from './PrintableAdmissionForm';
import { validateForm, admissionFormValidationRules } from '../utils/validation';

const AdmissionFormPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { classes } = useSelector(state => state.classes);
  const fileInputRef = useRef(null);
  
  // Check if we're editing an existing student
  const studentData = location.state?.studentData;
  const isEditMode = !!studentData;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    admissionDate: new Date().toISOString().split('T')[0], // Default to today
    class: '',
    section: '',
    monthlyFees: '',
    admissionFees: '',
    feesPaid: '',
    totalFees: '',
    familyId: '',
    relationship: '',
    parentId: '',
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    if (studentData) {
      setFormData(studentData);
      // If student has a photo, set the preview
      if (studentData.photo) {
        setPhotoPreview(studentData.photo);
      }
    }
  }, [studentData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Auto-populate monthly fees when class is selected
    if (name === 'class') {
      const selectedClass = classes.find(cls => cls.name === value);
      if (selectedClass) {
        setFormData(prev => ({
          ...prev,
          class: value,
          monthlyFees: selectedClass.monthlyFees || '',
          section: '', // Reset section when class changes
        }));
      }
    }

    // Auto-calculate total fees when admission fees or monthly fees change
    if (name === 'admissionFees' || name === 'monthlyFees') {
      const admissionFees = name === 'admissionFees' ? value : formData.admissionFees;
      const monthlyFees = name === 'monthlyFees' ? value : formData.monthlyFees;
      const total = (parseFloat(admissionFees) || 0) + (parseFloat(monthlyFees) || 0);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        totalFees: total.toString(),
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFormFields = () => {
    const formErrors = validateForm(formData, admissionFormValidationRules);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateFormFields()) {
      return;
    }
    
    // Create form data to send to the backend
    const submissionData = { ...formData };
    
    // If there's a photo file, we would typically upload it to a server here
    // For now, we'll just store the preview data URL
    if (photoPreview) {
      submissionData.photo = photoPreview;
    }
    
    if (isEditMode) {
      dispatch(updateStudent({ ...studentData, ...submissionData }));
    } else {
      dispatch(addStudent(submissionData));
    }
    
    // Navigate back to students page
    navigate('/students');
  };

  const handlePrint = () => {
    // Validate before printing
    if (!validateFormFields()) {
      alert('Please fix the validation errors before printing');
      return;
    }
    
    setShowPrintView(true);
  };

  const closePrintView = () => {
    setShowPrintView(false);
  };

  const handlePrintAction = () => {
    window.print();
  };

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(classes.map(cls => cls.name))];
  
  // Get sections for selected class
  const classSections = formData.class 
    ? classes.find(cls => cls.name === formData.class)?.sections || []
    : [];

  // Show print view if requested
  if (showPrintView) {
    return (
      <div className="fixed inset-0 bg-white z-50 p-0 m-0 overflow-hidden">
        {/* Print Header - Hidden during actual printing */}
        <div className="print-header sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center no-print">
          <h3 className="text-xl font-semibold text-gray-900">Print Admission Form</h3>
          <div className="print-actions flex space-x-2 no-print">
            <button
              onClick={handlePrintAction}
              className="print-button inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 no-print"
            >
              <FaPrint className="mr-2" />
              Print
            </button>
            <button 
              onClick={closePrintView}
              className="print-button text-gray-500 hover:text-gray-700 no-print"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Print Content - This is what will actually be printed */}
        <div className="py-6 px-6">
          <PrintableAdmissionForm formData={formData} photoPreview={photoPreview} />
        </div>
        
        {/* Print-specific styles */}
        <style>{`
          @media print {
            @page {
              margin: 0.5in;
              size: A4;
            }
            body {
              margin: 0;
              padding: 0;
              font-size: 12pt;
              font-family: Arial, Helvetica, sans-serif;
            }
            .no-print {
              display: none !important;
            }
            /* Hide all non-essential elements when printing */
            .print-header, .print-button, .print-actions {
              display: none !important;
            }
            /* Ensure clean print view */
            .form-container {
              box-shadow: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/students')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Back to Students
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {isEditMode ? 'Edit Student' : 'Student Admission'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update student information' : 'Register a new student'}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Student Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Upload Section */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Photo</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="flex-shrink-0">
                      {photoPreview ? (
                        <div className="relative">
                          <img 
                            src={photoPreview} 
                            alt="Student Preview" 
                            className="h-24 w-24 rounded-lg object-cover border-2 border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            title="Remove photo"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg w-24 h-24 flex items-center justify-center">
                          <FaCamera className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex flex-col">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handlePhotoChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FaCamera className="mr-1.5 h-4 w-4" />
                          {photoPreview ? 'Change' : 'Upload'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">JPEG, PNG up to 5MB</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date *</label>
                  <input
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.admissionDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.admissionDate && <p className="mt-1 text-sm text-red-600">{errors.admissionDate}</p>}
                </div>
              </div>
            </div>
            
            {/* Family Relationship Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Family Relationship</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Family ID</label>
                  <input
                    type="text"
                    name="familyId"
                    value={formData.familyId}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter family ID (optional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Select Relationship</option>
                    <option value="brother">Brother</option>
                    <option value="sister">Sister</option>
                    <option value="cousin">Cousin</option>
                    <option value="parent">Parent</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian ID</label>
                  <input
                    type="text"
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter parent/guardian ID (optional)"
                  />
                </div>
              </div>
            </div>
            
            {/* Academic Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Academic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.class ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Class</option>
                    {uniqueClasses.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  {errors.class && <p className="mt-1 text-sm text-red-600">{errors.class}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.section ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={!formData.class}
                  >
                    <option value="">Select Section</option>
                    {classSections.map((section) => (
                      <option key={section.name} value={section.name}>{section.name}</option>
                    ))}
                  </select>
                  {errors.section && <p className="mt-1 text-sm text-red-600">{errors.section}</p>}
                </div>
              </div>
            </div>
            
            {/* Fee Details Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Fee Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Fees *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">Rs</span>
                    </div>
                    <input
                      type="number"
                      name="admissionFees"
                      value={formData.admissionFees}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        errors.admissionFees ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="5000"
                    />
                  </div>
                  {errors.admissionFees && <p className="mt-1 text-sm text-red-600">{errors.admissionFees}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fees *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">Rs</span>
                    </div>
                    <input
                      type="number"
                      name="monthlyFees"
                      value={formData.monthlyFees}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                        errors.monthlyFees ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="4000"
                    />
                  </div>
                  {errors.monthlyFees && <p className="mt-1 text-sm text-red-600">{errors.monthlyFees}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Fees *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">Rs</span>
                    </div>
                    <input
                      type="number"
                      name="totalFees"
                      value={formData.totalFees}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-gray-50 ${
                        errors.totalFees ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="9000"
                      readOnly
                    />
                  </div>
                  {errors.totalFees && <p className="mt-1 text-sm text-red-600">{errors.totalFees}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fees Paid</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">Rs</span>
                    </div>
                    <input
                      type="number"
                      name="feesPaid"
                      value={formData.feesPaid}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/students')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
              >
                <FaPrint className="mr-2" />
                Print Form
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                {isEditMode ? 'Update Student' : 'Save Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdmissionFormPage;