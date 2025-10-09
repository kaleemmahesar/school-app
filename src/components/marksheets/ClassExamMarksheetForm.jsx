import React, { useState, useEffect } from 'react';
import { FaBook, FaGraduationCap, FaClipboardList, FaCheck } from 'react-icons/fa';
import BulkMarksheetPrintView from './BulkMarksheetPrintView';

const ClassExamMarksheetForm = ({ 
  classes, 
  students, 
  onSubmit, 
  onCancel 
}) => {
  const [step, setStep] = useState(1); // 1: Select class/exam, 2: Enter marks
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [examType, setExamType] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [subjectMarks, setSubjectMarks] = useState([]);
  const [studentMarks, setStudentMarks] = useState([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  // Get sections for selected class
  const classSections = selectedClass 
    ? classes.find(cls => cls.name === selectedClass)?.sections || []
    : [];
    
  // Get students for selected class and section
  const filteredStudents = students.filter(student => 
    student.class === selectedClass && student.section === selectedSection
  );
  
  // Get subjects for selected class
  const classSubjects = selectedClass 
    ? classes.find(cls => cls.name === selectedClass)?.subjects || []
    : [];

  // Initialize form when class is selected
  useEffect(() => {
    if (selectedClass && selectedSection) {
      // Get subjects for selected class
      const classData = classes.find(cls => cls.name === selectedClass);
      const subjects = classData?.subjects || [];
      
      // Initialize subject marks structure
      const initialSubjectMarks = subjects.map(subject => ({
        subjectId: subject.id,
        subjectName: subject.name,
        totalMarks: 100
      }));
      setSubjectMarks(initialSubjectMarks);
      
      // Get students for selected class and section
      const studentsInClass = students.filter(student => 
        student.class === selectedClass && student.section === selectedSection
      );
      
      // Initialize student marks structure
      const initialStudentMarks = studentsInClass.map(student => ({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        marks: initialSubjectMarks.map(subject => ({
          subjectId: subject.subjectId,
          subjectName: subject.subjectName,
          marksObtained: '',
          totalMarks: subject.totalMarks,
          grade: ''
        }))
      }));
      setStudentMarks(initialStudentMarks);
    }
  }, [selectedClass, selectedSection, classes, students]);

  // Handle marks change for a specific student and subject
  const handleMarksChange = (studentIndex, subjectIndex, value) => {
    const updatedStudentMarks = [...studentMarks];
    const obtained = parseInt(value) || 0;
    const total = updatedStudentMarks[studentIndex].marks[subjectIndex].totalMarks;
    const percentage = total > 0 ? (obtained / total) * 100 : 0;
    
    // Calculate grade
    let grade = '';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else grade = 'F';
    
    updatedStudentMarks[studentIndex].marks[subjectIndex].marksObtained = value;
    updatedStudentMarks[studentIndex].marks[subjectIndex].grade = grade;
    
    setStudentMarks(updatedStudentMarks);
  };

  // Calculate totals for a student
  const calculateStudentTotals = (studentMarks) => {
    const totalObtained = studentMarks.reduce((sum, mark) => sum + (parseInt(mark.marksObtained) || 0), 0);
    const totalMarks = studentMarks.reduce((sum, mark) => sum + (parseInt(mark.totalMarks) || 0), 0);
    const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : 0;
    
    // Calculate overall grade
    let overallGrade = '';
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B+';
    else if (percentage >= 60) overallGrade = 'B';
    else if (percentage >= 50) overallGrade = 'C';
    else overallGrade = 'F';
    
    return { totalObtained, totalMarks, percentage, overallGrade };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!selectedClass || !selectedSection || !examType || !year) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate that all marks are entered
    const allMarksEntered = studentMarks.every(student => 
      student.marks.every(mark => mark.marksObtained !== '' && mark.marksObtained !== null)
    );
    
    if (!allMarksEntered) {
      alert('Please enter marks for all students and subjects');
      return;
    }
    
    // Prepare data for submission
    const marksheetsData = studentMarks.map(student => {
      const totals = calculateStudentTotals(student.marks);
      return {
        id: Date.now().toString() + student.studentId,
        studentId: student.studentId,
        studentName: student.studentName,
        class: selectedClass,
        section: selectedSection,
        examType: examType,
        year: year,
        marks: student.marks,
        ...totals
      };
    });
    
    // Show print preview before saving
    setPreviewData(marksheetsData);
    setShowPrintPreview(true);
  };

  // Handle actual submission after print preview
  const handleFinalSubmit = (marksheetsData) => {
    onSubmit(marksheetsData);
    setShowPrintPreview(false);
    setPreviewData(null);
  };

  // Handle print action
  const handlePrint = () => {
    window.print();
  };

  // Handle download action (simplified for now)
  const handleDownload = () => {
    alert('In a full implementation, this would download the marksheets as PDFs');
  };

  if (showPrintPreview && previewData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Print Preview - Bulk Marksheets</h3>
            <button 
              onClick={() => setShowPrintPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="py-4 px-6">
            <BulkMarksheetPrintView
              marksheetsData={previewData}
              studentsData={students}
              classesData={classes}
              onPrint={handlePrint}
              onDownload={handleDownload}
            />
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back to Edit
              </button>
              <button
                onClick={() => handleFinalSubmit(previewData)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save All Marksheets
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Class Exam Marksheet Entry
      </h3>
      
      {/* Step 1: Select class, section, exam type */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBook className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection('');
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaGraduationCap className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!selectedClass}
                >
                  <option value="">Select Section</option>
                  {classSections.map(section => (
                    <option key={section.id} value={section.name}>{section.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaClipboardList className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Exam Type</option>
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          {selectedClass && selectedSection && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-2">
                Students in {selectedClass} - Section {selectedSection}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredStudents.map(student => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-gray-500">ID: {student.id}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredStudents.length === 0 && (
                <p className="text-sm text-gray-600 mt-2">No students found in this class and section</p>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedClass && selectedSection && examType && year) {
                  setStep(2);
                } else {
                  alert('Please fill in all required fields');
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={!selectedClass || !selectedSection || !examType || !year}
            >
              Next: Enter Marks
            </button>
          </div>
        </div>
      )}
      
      {/* Step 2: Enter marks for all students */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                Enter Marks for {selectedClass} - Section {selectedSection}
              </h4>
              <p className="text-sm text-gray-600">
                {examType} {year} - {filteredStudents.length} students
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
          
          {studentMarks.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                        Student
                      </th>
                      {subjectMarks.map((subject, index) => (
                        <th key={subject.subjectId} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div>{subject.subjectName}</div>
                          <div className="text-xs font-normal text-gray-500">({subject.totalMarks} marks)</div>
                        </th>
                      ))}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentMarks.map((student, studentIndex) => {
                      const totals = calculateStudentTotals(student.marks);
                      return (
                        <tr key={student.studentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                            <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                            <div className="text-xs text-gray-500">ID: {student.studentId}</div>
                          </td>
                          {student.marks.map((mark, subjectIndex) => (
                            <td key={mark.subjectId} className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                max={mark.totalMarks}
                                value={mark.marksObtained}
                                onChange={(e) => handleMarksChange(studentIndex, subjectIndex, e.target.value)}
                                className="block w-20 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              />
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {totals.totalObtained}/{totals.totalMarks}
                            </div>
                            <div className="text-xs text-gray-500">
                              {totals.percentage}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {totals.overallGrade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FaCheck className="mr-2" /> Save Marksheets for All Students
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassExamMarksheetForm;