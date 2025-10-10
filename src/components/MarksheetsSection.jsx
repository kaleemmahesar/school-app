import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMarks, addMarks, updateMarks, deleteMarks } from '../store/marksSlice';
import { fetchStudents } from '../store/studentsSlice';
import { fetchClasses } from '../store/classesSlice';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaGraduationCap, FaClipboardList, FaEye } from 'react-icons/fa';
import ClassExamMarksheetForm from './marksheets/ClassExamMarksheetForm';
import StudentMarksheetForm from './marksheets/StudentMarksheetForm';

const MarksheetsSection = () => {
  const dispatch = useDispatch();
  const { marks, loading, error } = useSelector(state => state.marks);
  const { students } = useSelector(state => state.students);
  const { classes } = useSelector(state => state.classes);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentMarks, setCurrentMarks] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [selectedStudentData, setSelectedStudentData] = useState(null);
  
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    class: '',
    section: '',
    examType: '',
    year: new Date().getFullYear().toString(),
    marks: []
  });

  useEffect(() => {
    dispatch(fetchMarks());
    dispatch(fetchStudents());
    dispatch(fetchClasses());
  }, [dispatch]);

  // Prepare student data with marksheet counts
  const studentsWithMarks = students.map(student => {
    const studentMarks = marks.filter(mark => mark.studentId === student.id);
    return {
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      class: student.class,
      section: student.section,
      marksCount: studentMarks.length,
      marks: studentMarks
    };
  });

  const handleEdit = (marksData) => {
    setCurrentMarks(marksData);
    setFormData(marksData);
    setBulkMode(false);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this marksheet?')) {
      dispatch(deleteMarks(id));
    }
  };

  // Function to handle saving marks (for both single and bulk entry)
  const handleSaveMarks = (marksData) => {
    if (Array.isArray(marksData)) {
      // Handle bulk marksheets data
      marksData.forEach(mark => {
        if (mark.id && marks.find(m => m.id === mark.id)) {
          dispatch(updateMarks(mark));
        } else {
          dispatch(addMarks(mark));
        }
      });
    } else {
      // Handle single marksheet data
      if (currentMarks) {
        dispatch(updateMarks(marksData));
      } else {
        dispatch(addMarks(marksData));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      studentName: '',
      class: '',
      section: '',
      examType: '',
      year: new Date().getFullYear().toString(),
      marks: []
    });
    setCurrentMarks(null);
    setShowForm(false);
    setBulkMode(false);
  };

  const handleViewDetails = (student) => {
    setSelectedStudentData(student);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedStudentData(null);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">Error: {error}</p>
      </div>
    </div>
  </div>;

  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marksheets Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            {view === 'list' 
              ? 'Manage student marks and generate report cards' 
              : `Marksheets for ${selectedStudentData?.name}`}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          {view === 'list' ? (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setBulkMode(false);
                  setShowForm(!showForm);
                  if (!showForm) {
                    // Reset form data when opening the form
                    setFormData({
                      studentId: '',
                      studentName: '',
                      class: '',
                      section: '',
                      examType: '',
                      year: new Date().getFullYear().toString(),
                      marks: []
                    });
                    setCurrentMarks(null);
                  }
                }}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  !bulkMode 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700' 
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                <FaPlus className="mr-2" /> {showForm && !bulkMode ? 'Cancel' : 'Add Marksheet'}
              </button>
              <button
                onClick={() => {
                  setBulkMode(true);
                  setShowForm(true);
                }}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  bulkMode 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                <FaClipboardList className="mr-2" /> Bulk Entry
              </button>
            </div>
          ) : (
            <button
              onClick={handleBackToList}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to List
            </button>
          )}
        </div>
      </div>

      {view === 'detail' && selectedStudentData && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedStudentData.name}</h2>
                <p className="text-gray-600">{selectedStudentData.class} - Section {selectedStudentData.section}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Marksheets</p>
              <p className="text-2xl font-bold text-gray-900">{selectedStudentData.marksCount}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedStudentData.marks && selectedStudentData.marks.map((marksheet) => (
                  <tr key={marksheet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{marksheet.examType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {marksheet.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {marksheet.marks.length} subjects
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(marksheet)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(marksheet.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!selectedStudentData.marks || selectedStudentData.marks.length === 0) && (
              <div className="text-center py-12">
                <FaGraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No marksheets found</h3>
                <p className="mt-1 text-sm text-gray-500">This student has no marksheets yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'list' && (
        <>
          {showForm && !bulkMode && (
            <StudentMarksheetForm
              classes={classes}
              students={students}
              currentMarks={currentMarks}
              onSubmit={(marksheetData) => {
                handleSaveMarks(marksheetData);
                resetForm();
                alert('Marksheet saved successfully!');
              }}
              onCancel={resetForm}
            />
          )}

          {showForm && bulkMode && (
            <ClassExamMarksheetForm
              classes={classes}
              students={students}
              onSubmit={(marksheetsData) => {
                handleSaveMarks(marksheetsData);
                resetForm();
                alert(`Successfully saved marksheets for ${marksheetsData.length} students!`);
              }}
              onCancel={resetForm}
            />
          )}

          {/* Show student list when no form is active */}
          {!showForm && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Marksheets</h3>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by student name, class, or section..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Classes</option>
                        {classes && classes.map(cls => (
                          <option key={cls.id} value={cls.name}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Sections</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marksheets</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentsWithMarks
                      .filter(student => {
                        const matchesSearch = 
                          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.section.toLowerCase().includes(searchTerm.toLowerCase());
                        
                        const matchesClass = !selectedClass || student.class === selectedClass;
                        const matchesSection = !selectedSection || student.section === selectedSection;
                        
                        return matchesSearch && matchesClass && matchesSection;
                      })
                      .map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.name}
                                </div>
                                <div className="text-sm text-gray-500">ID: {student.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.class}</div>
                            <div className="text-sm text-gray-500">Section {student.section}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.marksCount} marksheets</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <FaEye className="mr-1" /> View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {studentsWithMarks.filter(student => {
                  const matchesSearch = 
                    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.section.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  const matchesClass = !selectedClass || student.class === selectedClass;
                  const matchesSection = !selectedSection || student.section === selectedSection;
                  
                  return matchesSearch && matchesClass && matchesSection;
                }).length === 0 && (
                  <div className="text-center py-12">
                    <FaGraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MarksheetsSection;