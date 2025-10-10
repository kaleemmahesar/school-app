import React from 'react';
import { FaUserGraduate, FaIdCard, FaPhone, FaEnvelope, FaCalendar, FaSchool, FaMoneyBillWave } from 'react-icons/fa';

const PrintableAdmissionForm = ({ formData, photoPreview }) => {
  const today = new Date().toLocaleDateString();
  
  // Helper function to format dates
  const formatDate = (date) => {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    // If it's already a string, return as is
    return date;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
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
        .form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #333;
          padding-bottom: 15px;
        }
        .header h1 {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin: 0 0 5px 0;
        }
        .header p {
          font-size: 16px;
          color: #666;
          margin: 0;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 15px;
          color: #333;
          border-bottom: 1px solid #999;
          padding-bottom: 5px;
        }
        .form-row {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -10px 15px -10px;
        }
        .form-group {
          flex: 1 0 45%;
          min-width: 250px;
          padding: 0 10px;
          margin-bottom: 15px;
        }
        .form-label {
          font-weight: 600;
          margin-bottom: 5px;
          font-size: 12px;
          color: #555;
        }
        .form-value {
          border-bottom: 1px solid #333;
          min-height: 30px;
          padding: 5px 0;
          font-size: 14px;
        }
        .full-width {
          flex: 1 0 100%;
        }
        .declaration {
          border: 1px solid #333;
          padding: 20px;
          margin-top: 30px;
        }
        .declaration-text {
          font-size: 12px;
          line-height: 1.5;
          margin-bottom: 20px;
          color: #555;
        }
        .signature-row {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
        }
        .signature-group {
          flex: 1;
          padding: 0 10px;
        }
        .signature-line {
          border-top: 1px solid #333;
          height: 1px;
          margin-top: 40px;
        }
        .signature-label {
          font-size: 12px;
          color: #555;
          margin-top: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 10px;
          color: #777;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        .photo-container {
          width: 120px;
          height: 120px;
          border: 1px solid #333;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .photo-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
        }
        .photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f0f0f0;
        }
        @media screen {
          .form-container {
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            background: white;
            margin: 20px;
          }
        }
      `}</style>

      <div className="form-container">
        {/* School Header */}
        <div className="header">
          <h1>SCHOOL MANAGEMENT SYSTEM</h1>
          <p>Student Admission Form</p>
        </div>

        {/* Student Information Section */}
        <div className="section">
          <div className="section-title">Student Information</div>
          <div className="form-row">
            {/* Photo Section */}
            <div className="form-group">
              <div className="form-label">Student Photo</div>
              <div className="photo-container">
                {photoPreview ? (
                  <img src={photoPreview} alt="Student" />
                ) : (
                  <div className="photo-placeholder">
                    <span>No Photo</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <div className="form-label">First Name</div>
              <div className="form-value">{formData.firstName || ''}</div>
            </div>
            
            <div className="form-group">
              <div className="form-label">Last Name</div>
              <div className="form-value">{formData.lastName || ''}</div>
            </div>
            
            <div className="form-group">
              <div className="form-label">Email Address</div>
              <div className="form-value">{formData.email || ''}</div>
            </div>
            
            <div className="form-group">
              <div className="form-label">Phone Number</div>
              <div className="form-value">{formData.phone || ''}</div>
            </div>
            
            <div className="form-group">
              <div className="form-label">Date of Birth (YYYY-MM-DD)</div>
              <div className="form-value">{formatDate(formData.dateOfBirth) || ''}</div>
            </div>
            
            <div className="form-group">
              <div className="form-label">Admission Date (YYYY-MM-DD)</div>
              <div className="form-value">{formatDate(formData.admissionDate) || ''}</div>
            </div>
          </div>
        </div>
        
        {/* Academic Information Section */}
        <div className="section">
          <div className="section-title">Academic Information</div>
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">Class</div>
              <div className="form-value">{formData.class || ''}</div>
            </div>
            
            <div className="form-group">
              <div className="form-label">Section</div>
              <div className="form-value">{formData.section || ''}</div>
            </div>
          </div>
        </div>
        
        {/* Family Relationship Section */}
        <div className="section">
          <div className="section-title">Family Relationship</div>
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">Family ID</div>
              <div className="form-value">{formData.familyId || ''}</div>
            </div>
            
            <div className="form-group">
              <div className="form-label">Relationship</div>
              <div className="form-value">{formData.relationship || ''}</div>
            </div>
            
            <div className="form-group">
              <div className="form-label">Parent/Guardian ID</div>
              <div className="form-value">{formData.parentId || ''}</div>
            </div>
          </div>
        </div>
        
        {/* Fee Details Section */}
        <div className="section">
          <div className="section-title">Fee Details</div>
          <div className="form-row">
            <div className="form-group">
              <div className="form-label">Admission Fees (Rs)</div>
              <div className="form-value">{formData.admissionFees || ''}</div>
            </div>
            
            <div className="form-group">
              <div className="form-label">Monthly Fees (Rs)</div>
              <div className="form-value">{formData.monthlyFees || ''}</div>
            </div>
            
            <div className="form-group">
              <div className="form-label">Total Fees (Rs)</div>
              <div className="form-value">{formData.totalFees || ''}</div>
            </div>
            
            <div className="form-group">
              <div className="form-label">Fees Paid (Rs)</div>
              <div className="form-value">{formData.feesPaid || ''}</div>
            </div>
          </div>
        </div>
        
        {/* Declaration */}
        <div className="declaration">
          <div className="section-title">Declaration</div>
          <div className="declaration-text">
            I hereby declare that the information provided above is true and correct to the best of my knowledge.
            I understand that providing false information may lead to cancellation of admission.
          </div>
          <div className="signature-row">
            <div className="signature-group">
              <div className="signature-line"></div>
              <div className="signature-label">Parent/Guardian Signature</div>
            </div>
            <div className="signature-group">
              <div className="signature-line"></div>
              <div className="signature-label">Date: {today}</div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="footer">
          <p>Form Generated on: {today} | This is an official document of School Management System</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableAdmissionForm;