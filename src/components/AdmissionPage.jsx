import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { addStudent, updateStudent } from '../store/studentsSlice';
import { fetchClasses } from '../store/classesSlice';
import { FaUserGraduate, FaIdCard, FaPhone, FaEnvelope, FaCalendar, FaSchool, FaMoneyBillWave, FaCamera, FaArrowLeft, FaPrint, FaUser, FaHome, FaMapMarker, FaMoon, FaSun } from 'react-icons/fa';
import PrintableAdmissionForm from './PrintableAdmissionForm';
import { validateForm, admissionFormValidationRules } from '../utils/validation';
import 'react-datepicker/dist/react-datepicker.css';

const AdmissionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { classes } = useSelector(state => state.classes);
  const fileInputRef = useRef(null);
  
  // Check if we're editing an existing student
  const studentData = location.state?.studentData;
  const isEditMode = !!studentData;

  const [formData, setFormData] = useState({
    photo: '',
    firstName: '',
    lastName: '',
    grNo: '',
    class: '',
    section: '',
    fatherName: '',
    caste: '',
    address: '',
    dateOfBirth: null,
    parentContactNumber: '',
    birthPlace: '',
    gender: '',
    fatherCnic: '',
    dateOfLeaving: null,
    lastSchoolAttended: '',
    oldGrNo: '',
    dateOfAdmission: new Date(), // Default to today
    classInWhichLeft: '',
    lcIssuedDate: null,
    reasonOfLeaving: '',
    // Add fees-related fields
    monthlyFees: '',
    admissionFees: '',
    feesPaid: '',
    totalFees: ''
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
      setFormData({
        ...studentData,
        dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null,
        dateOfAdmission: studentData.dateOfAdmission ? new Date(studentData.dateOfAdmission) : new Date(),
        dateOfLeaving: studentData.dateOfLeaving ? new Date(studentData.dateOfLeaving) : null,
        lcIssuedDate: studentData.lcIssuedDate ? new Date(studentData.lcIssuedDate) : null
      });
      // If student has a photo, set the preview
      if (studentData.photo) {
        setPhotoPreview(studentData.photo);
      }
    }
  }, [studentData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue,
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });

    // Clear error for this field when user selects a date
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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
    const submissionData = { 
      ...formData,
      dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : '',
      dateOfAdmission: formData.dateOfAdmission ? formData.dateOfAdmission.toISOString().split('T')[0] : '',
      dateOfLeaving: formData.dateOfLeaving ? formData.dateOfLeaving.toISOString().split('T')[0] : '',
      lcIssuedDate: formData.lcIssuedDate ? formData.lcIssuedDate.toISOString().split('T')[0] : ''
    };
    
    // If there's a photo file, we would typically upload it to a server here
    // For now, we'll just store the preview data URL
    if (photoPreview) {
      submissionData.photo = photoPreview;
    }
    
    console.log('Submitting student data:', submissionData);
    
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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/students')}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          <FaArrowLeft className="mr-2" />
          Back to Students
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {isEditMode ? 'Edit Student' : 'Student Admission Form'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode ? 'Edit the student information below' : 'Fill in the student information to add a new student'}
          </p>
        </div>
        
        <div className="py-6 px-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Information Section */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h2 className="text-md font-medium text-gray-900 mb-4">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Photo Upload Section */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Photo</label>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Student Preview" 
                          className="h-24 w-24 rounded-lg object-cover border border-gray-300"
                        />
                      ) : (
                        <div className="bg-gray-200 border border-dashed border-gray-300 rounded-lg w-24 h-24 flex items-center justify-center">
                          <FaCamera className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
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
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                        >
                          <FaCamera className="mr-1.5 h-4 w-4" />
                          {photoPreview ? 'Change Photo' : 'Upload Photo'}
                        </button>
                        <p className="text-xs text-gray-500 mt-1">JPEG, PNG up to 5MB</p>
                      </div>
                      {photoPreview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Enter First Name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Enter Last Name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GR No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="grNo"
                    value={formData.grNo}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.grNo ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Enter GR No"
                  />
                  {errors.grNo && (
                    <p className="mt-1 text-sm text-red-600">{errors.grNo}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.class ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                  >
                    <option value="">Select Class</option>
                    {uniqueClasses.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  {errors.class && (
                    <p className="mt-1 text-sm text-red-600">{errors.class}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.section ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                    disabled={!formData.class}
                  >
                    <option value="">Select Section</option>
                    {classSections.map((section) => (
                      <option key={section.name} value={section.name}>{section.name}</option>
                    ))}
                  </select>
                  {errors.section && (
                    <p className="mt-1 text-sm text-red-600">{errors.section}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative rounded-md shadow-sm ${
                    errors.dateOfBirth ? 'border border-red-300 rounded-md' : ''
                  }`}>
                    <DatePicker
                      selected={formData.dateOfBirth}
                      onChange={(date) => handleDateChange(date, 'dateOfBirth')}
                      className={`block w-full px-3 py-2 border ${
                        errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:ring-blue-500 focus:border-blue-500 transition`}
                      placeholderText="Select Date of Birth"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FaCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Admission <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative rounded-md shadow-sm ${
                    errors.dateOfAdmission ? 'border border-red-300 rounded-md' : ''
                  }`}>
                    <DatePicker
                      selected={formData.dateOfAdmission}
                      onChange={(date) => handleDateChange(date, 'dateOfAdmission')}
                      className={`block w-full px-3 py-2 border ${
                        errors.dateOfAdmission ? 'border-red-300' : 'border-gray-300'
                      } rounded-md focus:ring-blue-500 focus:border-blue-500 transition`}
                      placeholderText="Select Date of Admission"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FaCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.dateOfAdmission && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfAdmission}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Male</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Female</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="other"
                        checked={formData.gender === 'other'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Other</span>
                    </label>
                  </div>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Parent/Guardian Information Section */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h2 className="text-md font-medium text-gray-900 mb-4">Parent/Guardian Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.fatherName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Enter Father's Name"
                  />
                  {errors.fatherName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fatherName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="parentContactNumber"
                    value={formData.parentContactNumber}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.parentContactNumber ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Enter Parent Contact Number"
                  />
                  {errors.parentContactNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.parentContactNumber}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's CNIC <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fatherCnic"
                    value={formData.fatherCnic}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.fatherCnic ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Enter Father's CNIC"
                  />
                  {errors.fatherCnic && (
                    <p className="mt-1 text-sm text-red-600">{errors.fatherCnic}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Address Information Section */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h2 className="text-md font-medium text-gray-900 mb-4">Address Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`block w-full px-3 py-2 border ${
                      errors.address ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Enter Full Address"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caste <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="caste"
                    value={formData.caste}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.caste ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Enter Caste"
                  />
                  {errors.caste && (
                    <p className="mt-1 text-sm text-red-600">{errors.caste}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Place <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border ${
                      errors.birthPlace ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Enter Birth Place"
                  />
                  {errors.birthPlace && (
                    <p className="mt-1 text-sm text-red-600">{errors.birthPlace}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Fee Details Section */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h2 className="text-md font-medium text-gray-900 mb-4">Fee Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fees</label>
                  <input
                    type="number"
                    name="monthlyFees"
                    value={formData.monthlyFees}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter Monthly Fees"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Fees</label>
                  <input
                    type="number"
                    name="admissionFees"
                    value={formData.admissionFees}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter Admission Fees"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fees Paid</label>
                  <input
                    type="number"
                    name="feesPaid"
                    value={formData.feesPaid}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter Fees Paid"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Fees</label>
                  <input
                    type="number"
                    name="totalFees"
                    value={formData.totalFees}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter Total Fees"
                  />
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

export default AdmissionPage;