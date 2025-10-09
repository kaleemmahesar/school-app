import React from 'react';
import { FaSchool, FaUser, FaClipboardList, FaCalendar, FaPrint, FaDownload } from 'react-icons/fa';

const BulkMarksheetPrintView = ({ 
  marksheetsData, 
  studentsData, 
  classesData,
  onPrint,
  onDownload
}) => {
  if (!marksheetsData || marksheetsData.length === 0) return null;

  // Format date
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Group marksheets by student
  const groupedMarksheets = marksheetsData.reduce((acc, marksheet) => {
    const studentId = marksheet.studentId;
    if (!acc[studentId]) {
      acc[studentId] = [];
    }
    acc[studentId].push(marksheet);
    return acc;
  }, {});

  return (
    <div className="w-full mx-auto bg-white font-sans">
      {/* Action Buttons (only shown in preview mode, not when printing) */}
      <div className="print:hidden flex justify-center space-x-4 mb-6">
        <button
          onClick={onPrint}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
        >
          <FaPrint className="mr-2" /> Print All Marksheets
        </button>
        <button
          onClick={onDownload}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
        >
          <FaDownload className="mr-2" /> Download All PDFs
        </button>
      </div>

      {/* Printable Marksheets */}
      <div className="print-container">
        {Object.entries(groupedMarksheets).map(([studentId, studentMarksheets], index) => {
          const studentData = studentsData?.find(s => s.id === studentId);
          const studentName = studentData 
            ? `${studentData.firstName} ${studentData.lastName}`
            : studentMarksheets[0]?.studentName || 'N/A';
            
          const className = studentMarksheets[0]?.class || 'N/A';
          const section = studentMarksheets[0]?.section || 'N/A';

          return (
            <div key={studentId} className={`student-marksheets ${index > 0 ? 'mt-8' : ''}`}>
              {/* School Header */}
              <div className="text-center border-b border-gray-300 pb-2 mb-3">
                <div className="flex items-center justify-center mb-1">
                  <FaSchool className="text-blue-600 text-lg mr-2" />
                  <h1 className="text-lg font-bold text-gray-800">School Management System</h1>
                </div>
                <p className="text-gray-600 text-xs mb-1">123 Education Street, Learning City</p>
                <p className="text-gray-600 text-xs">Phone: +1 (555) 123-4567</p>
              </div>

              {/* Student Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-800">Student Marksheets</h2>
                  <p className="text-gray-600 text-xs">Student ID: {studentId || 'N/A'}</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {className} - Section {section}
                </div>
              </div>

              {/* Student Information */}
              <div className="mb-3">
                <h3 className="font-bold text-gray-800 mb-2 text-xs flex items-center">
                  <FaUser className="mr-2 text-blue-600 text-xs" /> Student Information
                </h3>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <span className="font-medium col-span-1">Name:</span>
                    <span className="col-span-2">{studentName}</span>
                    
                    <span className="font-medium col-span-1">Class:</span>
                    <span className="col-span-2">{className} - Section {section}</span>
                    
                    <span className="font-medium col-span-1">Total Exams:</span>
                    <span className="col-span-2">{studentMarksheets.length}</span>
                  </div>
                </div>
              </div>

              {/* Individual Marksheets */}
              <div className="space-y-6">
                {studentMarksheets.map((marksheet, marksheetIndex) => (
                  <div key={`${studentId}-${marksheetIndex}`} className="marksheets-section">
                    {/* Exam Header */}
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-gray-800 text-xs flex items-center">
                        <FaClipboardList className="mr-2 text-blue-600 text-xs" /> 
                        {marksheet.examType} - {marksheet.year}
                      </h3>
                      <div className="text-xs text-gray-600">
                        Generated: {generatedDate}
                      </div>
                    </div>
                    
                    {/* Marks Table */}
                    <div className="mb-3">
                      <div className="border rounded">
                        <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 border-b text-xs font-medium">
                          <span className="col-span-1">Subject</span>
                          <span className="text-center">Obtained</span>
                          <span className="text-center">Total</span>
                          <span className="text-center">Grade</span>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {marksheet.marks && marksheet.marks.map((subject, index) => (
                            <div key={index} className="grid grid-cols-4 gap-1 p-2 text-xs">
                              <span className="col-span-1">{subject.subjectName}</span>
                              <span className="text-center">{subject.marksObtained}</span>
                              <span className="text-center">{subject.totalMarks}</span>
                              <span className="text-center">
                                <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs">
                                  {subject.grade}
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Obtained</h4>
                        <div className="bg-gray-50 p-2 rounded border text-xs text-center font-bold">
                          {marksheet.totalObtained}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Total</h4>
                        <div className="bg-gray-50 p-2 rounded border text-xs text-center font-bold">
                          {marksheet.totalMarks}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-1">%</h4>
                        <div className="bg-gray-50 p-2 rounded border text-xs text-center font-bold">
                          {marksheet.percentage}%
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Grade</h4>
                        <div className="bg-gray-50 p-2 rounded border text-xs text-center font-bold">
                          <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs">
                            {marksheet.overallGrade}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Page break after each student (except the last one) */}
              {index < Object.keys(groupedMarksheets).length - 1 && (
                <div className="page-break print:block hidden"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer for all pages */}
      <div className="border-t border-gray-300 pt-3 mt-4 text-center text-xs text-gray-500 print:hidden">
        <p>Generated on {generatedDate} - Official School Documents</p>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .print-container {
            padding: 10px;
            max-width: 100%;
          }
          
          .print-hidden {
            display: none !important;
          }
          
          .page-break {
            page-break-after: always;
          }
          
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          .bulk-marksheet-print-view {
            font-family: Arial, Helvetica, sans-serif;
          }
        }
      `}</style>
    </div>
  );
};

export default BulkMarksheetPrintView;