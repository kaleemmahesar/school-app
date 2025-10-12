import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaFilePdf, FaPrint, FaDownload } from 'react-icons/fa';

const ExamSlipGenerator = () => {
  const dispatch = useDispatch();
  const { exams } = useSelector(state => state.exams);
  const { students } = useSelector(state => state.students);
  
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [generatedSlips, setGeneratedSlips] = useState([]);
  
  // Get unique classes from exams
  const examClasses = [...new Set(exams.map(exam => exam.class))];
  
  // Get sections for selected class
  const getSectionsForClass = (className) => {
    const exam = exams.find(e => e.class === className);
    return exam ? [...new Set(exams.filter(e => e.class === className).map(e => e.section))] : [];
  };
  
  // Get exams for selected class and section
  const getExamsForClassSection = (className, sectionName) => {
    return exams.filter(exam => 
      exam.class === className && 
      (sectionName ? exam.section === sectionName : true)
    );
  };
  
  // Get students for selected class and section
  const getStudentsForClassSection = (className, sectionName) => {
    return students.filter(student => 
      student.class === className && 
      (sectionName ? student.section === sectionName : true)
    );
  };
  
  const handleGenerateSlips = () => {
    if (!selectedExam || !selectedClass) return;
    
    const exam = exams.find(e => e.id === selectedExam);
    const studentsInClass = getStudentsForClassSection(selectedClass, selectedSection);
    
    const slips = studentsInClass.map(student => ({
      id: `${exam.id}-${student.id}`,
      examId: exam.id,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      className: student.class,
      sectionName: student.section,
      examName: exam.name,
      examType: exam.examType,
      examDate: exam.startDate,
      subjects: exam.subjects,
      rollNumber: student.id.padStart(3, '0')
    }));
    
    setGeneratedSlips(slips);
  };
  
  const handlePrintSlips = () => {
    window.print();
  };
  
  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    alert('PDF download functionality would be implemented here');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Exam Slip Generator</h2>
        <div className="flex space-x-2">
          {generatedSlips.length > 0 && (
            <>
              <button
                onClick={handlePrintSlips}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPrint className="mr-2" /> Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaDownload className="mr-2" /> Download PDF
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection('');
              setSelectedExam('');
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Class</option>
            {examClasses.map((cls, index) => (
              <option key={index} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setSelectedExam('');
            }}
            disabled={!selectedClass}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select Section</option>
            {selectedClass && getSectionsForClass(selectedClass).map((section, index) => (
              <option key={index} value={section}>{section}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Examination</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            disabled={!selectedClass}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select Examination</option>
            {selectedClass && getExamsForClassSection(selectedClass, selectedSection).map((exam) => (
              <option key={exam.id} value={exam.id}>{exam.name} ({exam.examType})</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={handleGenerateSlips}
            disabled={!selectedExam}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaFilePdf className="mr-2" /> Generate Slips
          </button>
        </div>
      </div>
      
      {generatedSlips.length > 0 && (
        <div className="print-area">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Generated Exam Slips ({generatedSlips.length} students)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedSlips.map((slip) => (
              <div key={slip.id} className="border border-gray-300 rounded-lg p-6 print:border print:p-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">SCHOOL EXAMINATION SLIP</h2>
                  <p className="text-gray-600">{slip.examName} - {slip.examType}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Student Name</p>
                    <p className="font-medium">{slip.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Roll Number</p>
                    <p className="font-medium">{slip.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-medium">{slip.className} - {slip.sectionName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Exam Date</p>
                    <p className="font-medium">{slip.examDate}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Exam Schedule</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Subject</th>
                        <th className="text-left py-1">Date</th>
                        <th className="text-left py-1">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slip.subjects.map((subject, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-1">{subject.name}</td>
                          <td className="py-1">{subject.date}</td>
                          <td className="py-1">{subject.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="text-xs text-gray-500 mt-4">
                  <p>Please bring your admit card and ID card to the examination hall.</p>
                  <p>Reporting time is 30 minutes before the scheduled exam time.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSlipGenerator;