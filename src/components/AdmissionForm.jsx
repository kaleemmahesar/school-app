import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addStudent, updateStudent, deleteStudent } from '../store/studentsSlice';
import { fetchClasses } from '../store/classesSlice';
import { FaUserGraduate, FaIdCard, FaPhone, FaEnvelope, FaCalendar, FaSchool, FaMoneyBillWave, FaCamera, FaTrash, FaInfoCircle, FaHandHoldingUsd } from 'react-icons/fa';
import PrintableAdmissionForm from './PrintableAdmissionForm';
import ConfirmationDialog from './common/ConfirmationDialog';
import { useSchoolFunding } from '../hooks/useSchoolFunding';
import NGOFundingInfo from './common/NGOFundingInfo';

const AdmissionForm = ({ onClose, studentData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { classes } = useSelector(state => state.classes);
  const { isNGOSchool } = useSchoolFunding();
  const fileInputRef = useRef(null);
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
    // Fields for students coming from another school
    isTransferStudent: false, // New field to track if student is a transfer
    dateOfLeaving: '',
    classInWhichLeft: '',
    reasonOfLeaving: '',
    // Religion field
    religion: 'Islam' // Default to Islam as requested
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEditMode = !!studentData;

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    if (studentData) {
      // Determine if this is a transfer student based on whether transfer fields have values
      const isTransferStudent = !!(studentData.dateOfLeaving || studentData.classInWhichLeft || studentData.reasonOfLeaving);
      
      setFormData({
        ...studentData,
        isTransferStudent,
        // Set default religion if not present in studentData
        religion: studentData.religion || 'Islam'
      });
      // If student has a photo, set the preview
      if (studentData.photo) {
        setPhotoPreview(studentData.photo);
      }
    }
  }, [studentData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for the isTransferStudent field
    if (name === 'isTransferStudent') {
      setFormData({
        ...formData,
        [name]: value
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Auto-populate monthly fees when class is selected (only for traditional schools)
    if (name === 'class' && !isNGOSchool) {
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

    // Auto-calculate total fees when admission fees or monthly fees change (only for traditional schools)
    if ((name === 'admissionFees' || name === 'monthlyFees') && !isNGOSchool) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If this is a transfer student, validate the transfer fields
    if (formData.isTransferStudent) {
      if (!formData.dateOfLeaving || !formData.classInWhichLeft || !formData.reasonOfLeaving) {
        alert('Please fill all transfer student information fields');
        return;
      }
    }
    
    // Create form data to send to the backend
    const submissionData = { ...formData };
    
    // If there's a photo file, we would typically upload it to a server here
    // For now, we'll just store the preview data URL
    if (photoPreview) {
      submissionData.photo = photoPreview;
    }
    
    // If not a transfer student, clear transfer fields
    if (!formData.isTransferStudent) {
      submissionData.dateOfLeaving = '';
      submissionData.classInWhichLeft = '';
      submissionData.reasonOfLeaving = '';
    }
    
    // For NGO schools, clear fee fields
    if (isNGOSchool) {
      submissionData.monthlyFees = '';
      submissionData.admissionFees = '';
      submissionData.feesPaid = '';
      submissionData.totalFees = '';
    }
    
    if (isEditMode) {
      // For editing, we need to preserve the original ID and other important fields
      dispatch(updateStudent({ 
        id: studentData.id,  // Preserve the original ID
        ...studentData,      // Include all original data
        ...submissionData    // Override with updated data
      }));
    } else {
      dispatch(addStudent(submissionData));
    }
    // Close the form
    if (onClose) onClose();
  };

  const handleDelete = () => {
    if (isEditMode && studentData) {
      dispatch(deleteStudent(studentData.id));
      if (onClose) onClose();
    }
  };

  const handlePrint = () => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditMode ? 'Edit Student' : 'Student Admission Form'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="py-4 px-6">
          <div id="admission-form" className="bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Information Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-md font-medium text-gray-900 mb-3">Student Information</h2>
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
                            id="photo-upload"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            aria-describedby="photo-upload-help"
                          >
                            <FaCamera className="mr-1.5 h-4 w-4" />
                            {photoPreview ? 'Change Photo' : 'Upload Photo'}
                          </button>
                          <p id="photo-upload-help" className="text-xs text-gray-500 mt-1">JPEG, PNG up to 5MB</p>
                        </div>
                        {photoPreview && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter first name"
                      required
                      aria-required="true"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter last name"
                      required
                      aria-required="true"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="student@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="admissionDate"
                        name="admissionDate"
                        value={formData.admissionDate}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="class"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                      aria-required="true"
                    >
                      <option value="">Select Class</option>
                      {uniqueClasses.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="section"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                      aria-required="true"
                      disabled={!formData.class}
                    >
                      <option value="">Select Section</option>
                      {classSections.map((section) => (
                        <option key={section.name} value={section.name}>{section.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Religion Field */}
                  <div>
                    <label htmlFor="religion" className="block text-sm font-medium text-gray-700 mb-1">
                      Religion <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="religion"
                      name="religion"
                      value={formData.religion}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                      aria-required="true"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Christianity">Christianity</option>
                      <option value="Hinduism">Hinduism</option>
                      <option value="Sikhism">Sikhism</option>
                      <option value="Buddhism">Buddhism</option>
                      <option value="Judaism">Judaism</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* NGO Funding Information Section (Only for NGO schools) */}
              {isNGOSchool && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <NGOFundingInfo />
                </div>
              )}
              
              {/* Fee Details Section (Only for traditional schools) */}
              {!isNGOSchool && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-md font-medium text-gray-900 mb-3">Fee Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label htmlFor="admissionFees" className="block text-sm font-medium text-gray-700 mb-1">
                        Admission Fees <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">Rs</span>
                        </div>
                        <input
                          type="number"
                          id="admissionFees"
                          name="admissionFees"
                          value={formData.admissionFees}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="5000"
                          required
                          aria-required="true"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="monthlyFees" className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Fees <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">Rs</span>
                        </div>
                        <input
                          type="number"
                          id="monthlyFees"
                          name="monthlyFees"
                          value={formData.monthlyFees}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="4000"
                          required
                          aria-required="true"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="totalFees" className="block text-sm font-medium text-gray-700 mb-1">
                        Total Fees <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">Rs</span>
                        </div>
                        <input
                          type="number"
                          id="totalFees"
                          name="totalFees"
                          value={formData.totalFees}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                          placeholder="9000"
                          required
                          aria-required="true"
                          readOnly
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="feesPaid" className="block text-sm font-medium text-gray-700 mb-1">Fees Paid</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">Rs</span>
                        </div>
                        <input
                          type="number"
                          id="feesPaid"
                          name="feesPaid"
                          value={formData.feesPaid}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Transfer Student Information Toggle */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isTransferStudent"
                    name="isTransferStudent"
                    checked={formData.isTransferStudent}
                    onChange={(e) => setFormData({...formData, isTransferStudent: e.target.checked})}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isTransferStudent" className="ml-2 block text-sm font-medium text-gray-700">
                    Student is transferring from another school
                  </label>
                  <FaInfoCircle className="ml-2 h-4 w-4 text-blue-500" title="Check this box if the student is coming from another school" />
                </div>
              </div>

              {/* Transfer Student Information (Only shown when isTransferStudent is true) */}
              {formData.isTransferStudent && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h2 className="text-md font-medium text-blue-900 mb-3">Transfer Student Information</h2>
                  <p className="text-sm text-blue-700 mb-3">These fields are required for students transferring from another school</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="dateOfLeaving" className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Removal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="dateOfLeaving"
                        name="dateOfLeaving"
                        value={formData.dateOfLeaving}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required={formData.isTransferStudent}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="classInWhichLeft" className="block text-sm font-medium text-gray-700 mb-1">
                        Class at the time of removal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="classInWhichLeft"
                        name="classInWhichLeft"
                        value={formData.classInWhichLeft}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Class 9"
                        required={formData.isTransferStudent}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="reasonOfLeaving" className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for leaving <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="reasonOfLeaving"
                        name="reasonOfLeaving"
                        value={formData.reasonOfLeaving}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Relocation, School closure"
                        required={formData.isTransferStudent}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FaTrash className="mr-2 -ml-1 h-4 w-4" />
                    Delete Student
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isEditMode ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default AdmissionForm;