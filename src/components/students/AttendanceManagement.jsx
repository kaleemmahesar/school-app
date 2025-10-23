import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaCalendarAlt, FaUserCheck, FaUserTimes, FaSearch, FaSave, FaClock } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import { addNewAttendanceRecord, fetchAttendanceByDateAndClass } from '../../store/attendanceSlice';

const AttendanceManagement = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const { attendanceRecords: storedAttendanceRecords, loading, error } = useSelector(state => state.attendance);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]); // For bulk selection

  // Get unique classes for dropdown
  const uniqueClasses = useMemo(() => [...new Set(students.map(student => student.class))], [students]);

  // Get sections for selected class
  const classSections = useMemo(() => selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [], [students, selectedClass]);

  // Filter students based on search term, class, and section
  const filteredStudents = useMemo(() => students.filter(student => {
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.grNo && student.grNo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesSection = !selectedSection || student.section === selectedSection;
    
    return matchesSearch && matchesClass && matchesSection;
  }), [students, searchTerm, selectedClass, selectedSection]);

  // Load existing attendance records for the selected date and class
  useEffect(() => {
    if (selectedClass && selectedDate) {
      dispatch(fetchAttendanceByDateAndClass({ date: selectedDate, classId: selectedClass }));
    }
  }, [selectedClass, selectedDate, dispatch]);

  // Initialize attendance records with existing data or defaults
  useEffect(() => {
    const initialAttendance = {};
    
    // If we have stored attendance records for this date and class, use them
    if (storedAttendanceRecords && storedAttendanceRecords.length > 0 && selectedClass) {
      // storedAttendanceRecords is an array of attendance records for the date/class
      // Each record has a records property which is an array of {studentId, status}
      storedAttendanceRecords.forEach(record => {
        if (record.date === selectedDate && record.classId === selectedClass) {
          record.records.forEach(studentRecord => {
            initialAttendance[studentRecord.studentId] = studentRecord.status;
          });
        }
      });
    }
    
    // For any students not in existing records, default to present
    filteredStudents.forEach(student => {
      if (!initialAttendance[student.id]) {
        initialAttendance[student.id] = 'present';
      }
    });
    
    setAttendanceRecords(initialAttendance);
  }, [storedAttendanceRecords, selectedDate, selectedClass, filteredStudents.length]);

  // Handle attendance status change
  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Save attendance records
  const saveAttendance = () => {
    if (!selectedClass) {
      alert('Please select a class first');
      return;
    }
    
    // Prepare attendance data for saving
    const attendanceData = {
      date: selectedDate,
      classId: selectedClass,
      records: Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status
      }))
    };
    
    // Dispatch action to save attendance
    dispatch(addNewAttendanceRecord(attendanceData))
      .then(() => {
        alert(`Attendance for ${filteredStudents.length} students saved successfully for ${selectedDate}`);
      })
      .catch((error) => {
        alert(`Failed to save attendance: ${error.message || 'Unknown error'}`);
      });
  };

  // Mark all as present
  const markAllPresent = () => {
    const updatedAttendance = {};
    filteredStudents.forEach(student => {
      updatedAttendance[student.id] = 'present';
    });
    setAttendanceRecords(updatedAttendance);
  };

  // Mark all as absent
  const markAllAbsent = () => {
    const updatedAttendance = {};
    filteredStudents.forEach(student => {
      updatedAttendance[student.id] = 'absent';
    });
    setAttendanceRecords(updatedAttendance);
  };

  // Bulk selection handlers
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(filteredStudents.map(student => student.id));
  };

  const clearStudentSelection = () => {
    setSelectedStudents([]);
  };

  // Bulk attendance marking
  const markSelectedAs = (status) => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }
    
    const updatedAttendance = { ...attendanceRecords };
    selectedStudents.forEach(studentId => {
      updatedAttendance[studentId] = status;
    });
    
    setAttendanceRecords(updatedAttendance);
    setSelectedStudents([]); // Clear selection after marking
  };

  // Get attendance summary
  const getAttendanceSummary = () => {
    const presentCount = Object.values(attendanceRecords).filter(status => status === 'present').length;
    const absentCount = Object.values(attendanceRecords).filter(status => status === 'absent').length;
    const lateCount = Object.values(attendanceRecords).filter(status => status === 'late').length;
    
    return { presentCount, absentCount, lateCount };
  };

  const { presentCount, absentCount, lateCount } = useMemo(getAttendanceSummary, [attendanceRecords]);

  // Get button class based on status
  const getButtonClass = (studentId, status) => {
    const currentStatus = attendanceRecords[studentId] || 'present';
    if (currentStatus === status) {
      switch (status) {
        case 'present':
          return 'inline-flex items-center px-3 py-1 border border-green-300 bg-green-100 text-green-800 text-xs font-medium rounded-lg';
        case 'absent':
          return 'inline-flex items-center px-3 py-1 border border-red-300 bg-red-100 text-red-800 text-xs font-medium rounded-lg';
        case 'late':
          return 'inline-flex items-center px-3 py-1 border border-yellow-300 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-lg';
        default:
          return 'inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 bg-white text-xs font-medium rounded-lg hover:bg-gray-50';
      }
    }
    return 'inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 bg-white text-xs font-medium rounded-lg hover:bg-gray-50';
  };

  return (
    <>
      <PageHeader
        title="Attendance Management"
        subtitle="Track student attendance manually"
        actionButton={
          <button
            onClick={saveAttendance}
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" /> Save Attendance
              </>
            )}
          </button>
        }
      />
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
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
        </div>
      )}

      {/* Attendance Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection(''); // Reset section when class changes
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sections</option>
              {classSections.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, GR No, class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={markAllPresent}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FaUserCheck className="mr-1" /> Mark All Present
          </button>
          <button
            onClick={markAllAbsent}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FaUserTimes className="mr-1" /> Mark All Absent
          </button>
        </div>
      </div>

      {/* Bulk Selection Actions */}
      {selectedStudents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between">
            <div className="text-blue-800 font-medium">
              {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => markSelectedAs('present')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaUserCheck className="mr-1" /> Mark Present
              </button>
              <button
                onClick={() => markSelectedAs('absent')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaUserTimes className="mr-1" /> Mark Absent
              </button>
              <button
                onClick={() => markSelectedAs('late')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <FaClock className="mr-1" /> Mark Late
              </button>
              <button
                onClick={clearStudentSelection}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Student Attendance ({filteredStudents.length} students)
          </h3>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              onClick={selectAllStudents}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              Select All
            </button>
            <button
              onClick={clearStudentSelection}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Selection
            </button>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAllStudents();
                      } else {
                        clearStudentSelection();
                      }
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GR No</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {student.photo ? (
                        <img 
                          src={student.photo} 
                          alt={`${student.firstName} ${student.lastName}`} 
                          className="w-8 h-8 rounded-full object-cover border-2 border-gray-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = `
                              <div class="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center">
                                <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.grNo ? student.grNo.replace('GR', '') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.class}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.section}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'present')}
                        className={getButtonClass(student.id, 'present')}
                      >
                        <FaUserCheck className="mr-1" /> Present
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                        className={getButtonClass(student.id, 'absent')}
                      >
                        <FaUserTimes className="mr-1" /> Absent
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'late')}
                        className={getButtonClass(student.id, 'late')}
                      >
                        <FaClock className="mr-1" /> Late
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Summary Row at Bottom */}
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="4" className="px-4 py-3 text-sm font-medium text-gray-900">
                  Total Students: {filteredStudents.length}
                </td>
                <td className="px-4 py-3 text-sm text-green-700 font-medium">
                  <FaUserCheck className="inline mr-1" /> Present: {presentCount}
                </td>
                <td className="px-4 py-3 text-sm text-red-700 font-medium">
                  <FaUserTimes className="inline mr-1" /> Absent: {absentCount}
                </td>
                <td className="px-4 py-3 text-sm text-yellow-700 font-medium">
                  <FaClock className="inline mr-1" /> Late: {lateCount}
                </td>
              </tr>
            </tfoot>
          </table>
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AttendanceManagement;