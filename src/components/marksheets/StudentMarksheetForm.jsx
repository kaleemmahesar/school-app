import React, { useState, useEffect } from 'react';
import { FaBook, FaGraduationCap, FaClipboardList, FaUserGraduate } from 'react-icons/fa';
import MarksheetPrintView from './MarksheetPrintView';

const StudentMarksheetForm = ({ 
  classes, 
  students, 
  currentMarks, 
  onSubmit, 
  onCancel 
}) => {
  const [selectedClass, setSelectedClass] = useState(currentMarks?.class || '');
  const [selectedSection, setSelectedSection] = useState(currentMarks?.section || '');
  const [selectedStudent, setSelectedStudent] = useState(currentMarks?.studentId || '');
  const [examType, setExamType] = useState(currentMarks?.examType || '');
  const [year, setYear] = useState(currentMarks?.year || new Date().getFullYear().toString());
  const [subjectMarks, setSubjectMarks] = useState(currentMarks?.marks || []);
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

  // Initialize form when class is selected or when editing existing marks
  useEffect(() => {
    if (currentMarks) {
      // Editing existing marksheet
      setSelectedClass(currentMarks.class || '');
      setSelectedSection(currentMarks.section || '');
      setSelectedStudent(currentMarks.studentId || '');
      setExamType(currentMarks.examType || '');
      setYear(currentMarks.year || new Date().getFullYear().toString());
      setSubjectMarks(currentMarks.marks || []);
    } else if (selectedClass && selectedSection) {
      // Creating new marksheet - initialize subjects
      const classData = classes.find(cls => cls.name === selectedClass);
      const subjects = classData?.subjects || [];
      
      // Initialize subject marks structure
      const initialSubjectMarks = subjects.map(subject => ({
        subjectId: subject.id,
        subjectName: subject.name,
        marksObtained: '',
        totalMarks: 100,
        grade: ''
      }));
      setSubjectMarks(initialSubjectMarks);
    }
  }, [selectedClass, selectedSection, classes, currentMarks]);

  // Handle student selection
  const handleStudentChange = (studentId) => {
    setSelectedStudent(studentId);
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedClass(student.class);
      setSelectedSection(student.section);
    }
  };

  // Handle marks change for a specific subject
  const handleMarksChange = (subjectIndex, field, value) => {
    const updatedSubjectMarks = [...subjectMarks];
    
    if (field === 'marksObtained') {
      const obtained = parseInt(value) || 0;
      const total = parseInt(updatedSubjectMarks[subjectIndex].totalMarks) || 100;
      const percentage = total > 0 ? (obtained / total) * 100 : 0;
      
      // Calculate grade
      let grade = '';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else grade = 'F';
      
      updatedSubjectMarks[subjectIndex].marksObtained = value;
      updatedSubjectMarks[subjectIndex].grade = grade;
    } else {
      updatedSubjectMarks[subjectIndex][field] = value;
    }
    
    setSubjectMarks(updatedSubjectMarks);
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalObtained = subjectMarks.reduce((sum, mark) => sum + (parseInt(mark.marksObtained) || 0), 0);
    const totalMarks = subjectMarks.reduce((sum, mark) => sum + (parseInt(mark.totalMarks) || 0), 0);
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
    if (!selectedStudent || !selectedClass || !selectedSection || !examType || !year) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate that all marks are entered
    const allMarksEntered = subjectMarks.every(mark => 
      mark.marksObtained !== '' && mark.marksObtained !== null
    );
    
    if (!allMarksEntered) {
      alert('Please enter marks for all subjects');
      return;
    }
    
    // Get student name
    const student = students.find(s => s.id === selectedStudent);
    const studentName = student ? `${student.firstName} ${student.lastName}` : '';
    
    // Prepare data for submission
    const totals = calculateTotals();
    const marksheetData = {
      id: currentMarks ? currentMarks.id : Date.now().toString(),
      studentId: selectedStudent,
      studentName: studentName,
      class: selectedClass,
      section: selectedSection,
      examType: examType,
      year: year,
      marks: subjectMarks,
      ...totals
    };
    
    // Show print preview before saving
    setPreviewData(marksheetData);
    setShowPrintPreview(true);
  };

  // Handle actual submission after print preview
  const handleFinalSubmit = (marksheetData) => {
    onSubmit(marksheetData);
    setShowPrintPreview(false);
    setPreviewData(null);
  };

  // Handle print action
  const handlePrint = () => {
    window.print();
  };

  // Handle download action (simplified for now)
  const handleDownload = () => {
    alert('In a full implementation, this would download the marksheet as a PDF');
  };

  if (showPrintPreview && previewData) {
    const studentData = students.find(s => s.id === previewData.studentId);
    const classData = classes.find(c => c.name === previewData.class);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Print Preview</h3>
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
            <MarksheetPrintView
              marksheetData={previewData}
              studentData={studentData}
              classData={classData}
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
                Save Marksheet
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
        {currentMarks ? 'Edit Student Marksheet' : 'Add Student Marksheet'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                setSelectedStudent('');
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
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedStudent('');
              }}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUserGraduate className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedStudent}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!selectedClass || !selectedSection}
            >
              <option value="">Select Student</option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
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
      
      {/* Subject Marks */}
      {subjectMarks.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Subject Marks</h4>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subjectMarks.map((mark, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{mark.subjectName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={mark.marksObtained}
                          onChange={(e) => handleMarksChange(index, 'marksObtained', e.target.value)}
                          className="block w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={mark.totalMarks}
                          onChange={(e) => handleMarksChange(index, 'totalMarks', e.target.value)}
                          className="block w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{mark.grade || '-'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Totals */}
      {subjectMarks.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Obtained</p>
              <p className="text-lg font-bold text-gray-900">{calculateTotals().totalObtained}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Marks</p>
              <p className="text-lg font-bold text-gray-900">{calculateTotals().totalMarks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Percentage</p>
              <p className="text-lg font-bold text-gray-900">{calculateTotals().percentage}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Overall Grade</p>
              <p className="text-lg font-bold text-gray-900">{calculateTotals().overallGrade}</p>
            </div>
          </div>
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
          onClick={handleSubmit}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaClipboardList className="mr-2" /> {currentMarks ? 'Update Marksheet' : 'Add Marksheet'}
        </button>
      </div>
    </div>
  );
};

export default StudentMarksheetForm;