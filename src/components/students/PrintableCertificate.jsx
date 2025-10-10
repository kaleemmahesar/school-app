import React, { useEffect, useRef } from 'react';
import CertificateTemplate from './CertificateTemplate';

const PrintableCertificate = ({ 
  student, 
  certificateType, 
  issueDate, 
  reason, 
  characterDetails,
  onClose 
}) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate</title>
          <style>
            @media print {
              body { 
                margin: 0; 
                padding: 20px; 
                background: white;
              }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              background: white;
            }
            .certificate-container {
              max-width: 100%;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            ${printRef.current.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    // Don't auto-print immediately, let user click the print button
    // This is more reliable across different browsers
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div ref={printRef} className="p-8">
        <CertificateTemplate
          student={student}
          certificateType={certificateType}
          issueDate={issueDate}
          reason={reason}
          characterDetails={characterDetails}
        />
      </div>
      
      {/* Buttons for manual control */}
      <div className="fixed bottom-4 right-4 space-x-2 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Print Certificate
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PrintableCertificate;