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
            margin: 0.2in;
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
            font-size: 9pt;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.2;
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
            max-width: 100%;
          }
          /* Fix for print overflow issues */
          html, body {
            height: auto;
            overflow: visible;
          }
          /* Ensure content fits on page */
          .form-container {
            page-break-inside: avoid;
          }
          .section {
            page-break-inside: avoid;
            margin-bottom: 15px;
          }
          .form-row {
            page-break-inside: avoid;
            display: flex;
            flex-wrap: wrap;
            margin: 0 -6px 10px -6px;
          }
          .form-group {
            flex: 1 0 30%;
            min-width: 160px;
            padding: 0 6px;
            margin-bottom: 10px;
          }
          .form-label {
            font-weight: 600;
            margin-bottom: 3px;
            font-size: 8pt;
            color: #555;
          }
          .form-value {
            border-bottom: 1px solid #333;
            min-height: 20px;
            padding: 3px 0;
            font-size: 9pt;
          }
          .full-width {
            flex: 1 0 100%;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #333;
            padding-bottom: 8px;
          }
          .header h1 {
            font-size: 16pt;
            font-weight: bold;
            color: #333;
            margin: 0 0 2px 0;
          }
          .header p {
            font-size: 11pt;
            color: #666;
            margin: 0;
          }
          .section-title {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 10px;
            color: #333;
            border-bottom: 1px solid #999;
            padding-bottom: 3px;
          }
          .declaration {
            border: 1px solid #333;
            padding: 12px;
            margin-top: 20px;
          }
          .declaration-text {
            font-size: 8pt;
            line-height: 1.3;
            margin-bottom: 12px;
            color: #555;
          }
          .signature-row {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
          }
          .signature-group {
            flex: 1;
            padding: 0 6px;
          }
          .signature-line {
            border-top: 1px solid #333;
            height: 1px;
            margin-top: 25px;
          }
          .signature-label {
            font-size: 8pt;
            color: #555;
            margin-top: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 25px;
            font-size: 7pt;
            color: #777;
            border-top: 1px solid #ccc;
            padding-top: 6px;
          }
          .photo-container {
            width: 80px;
            height: 80px;
            border: 1px solid #333;
            margin-bottom: 10px;
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
            font-size: 7pt;
          }
          /* Better space utilization */
          .student-info-row {
            display: flex;
            flex-wrap: wrap;
          }
          .photo-section {
            flex: 0 0 80px;
            margin-right: 15px;
          }
          .student-details {
            flex: 1;
          }
          .compact-row {
            display: flex;
            flex-wrap: wrap;
          }
          .compact-group {
            flex: 1 0 30%;
            min-width: 150px;
            padding: 0 5px;
            margin-bottom: 8px;
          }
        }
        .form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
          flex: 1 0 30%;
          min-width: 200px;
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
          <div className="student-info-row">
            {/* Photo Section */}
            <div className="photo-section">
              <div className="form-label">Photo</div>
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
            
            {/* Student Details */}
            <div className="student-details">
              <div className="compact-row">
                <div className="compact-group">
                  <div className="form-label">GR Number</div>
                  <div className="form-value">{formData.grNo || ''}</div>
                </div>
                
                <div className="compact-group">
                  <div className="form-label">Name of Student</div>
                  <div className="form-value">{formData.firstName || ''} {formData.lastName || ''}</div>
                </div>
                
                <div className="compact-group">
                  <div className="form-label">Father's Name</div>
                  <div className="form-value">{formData.fatherName || ''}</div>
                </div>
              </div>
              
              <div className="compact-row">
                <div className="compact-group">
                  <div className="form-label">Religion</div>
                  <div className="form-value">{formData.religion || ''}</div>
                </div>
                
                <div className="compact-group">
                  <div className="form-label">Date of Birth</div>
                  <div className="form-value">{formatDate(formData.dateOfBirth) || ''}</div>
                </div>
                
                <div className="compact-group">
                  <div className="form-label">Place of Birth</div>
                  <div className="form-value">{formData.birthPlace || ''}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Address field */}
          <div className="form-group full-width">
            <div className="form-label">Address</div>
            <div className="form-value">{formData.address || ''}</div>
          </div>
          
          <div className="compact-row">
            <div className="compact-group">
              <div className="form-label">Last Attended School</div>
              <div className="form-value">{formData.lastSchoolAttended || ''}</div>
            </div>
            
            <div className="compact-group">
              <div className="form-label">Date of Admission</div>
              <div className="form-value">{formatDate(formData.dateOfAdmission) || ''}</div>
            </div>
            
            <div className="compact-group">
              <div className="form-label">Class in which admitted</div>
              <div className="form-value">{formData.class || ''}</div>
            </div>
            
            <div className="compact-group">
              <div className="form-label">Section</div>
              <div className="form-value">{formData.section || ''}</div>
            </div>
            
            {/* Transfer Student Information (Only shown when applicable) */}
            {formData.isTransferStudent && (
              <>
                <div className="compact-group">
                  <div className="form-label">Date of Removal</div>
                  <div className="form-value">{formatDate(formData.dateOfLeaving) || ''}</div>
                </div>
                
                <div className="compact-group">
                  <div className="form-label">Class at removal</div>
                  <div className="form-value">{formData.classInWhichLeft || ''}</div>
                </div>
              </>
            )}
          </div>
          
          {/* Transfer Student Reason and Remarks */}
          {formData.isTransferStudent && (
            <div className="form-group full-width">
              <div className="form-label">Reason for leaving</div>
              <div className="form-value">{formData.reasonOfLeaving || ''}</div>
            </div>
          )}
          
          <div className="form-group full-width">
            <div className="form-label">Remarks</div>
            <div className="form-value">{formData.remarks || ''}</div>
          </div>
        </div>
        
        {/* NGO Funding Information Section (Instead of Fee Details) */}
        <div className="section">
          <div className="section-title">Funding Information</div>
          <div className="form-row">
            <div className="form-group full-width">
              <div className="form-label">Funding Status</div>
              <div className="form-value">This school is funded by quarterly NGO subsidies. No fees are charged to students.</div>
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