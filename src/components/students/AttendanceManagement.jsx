import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaCalendarAlt, FaUserCheck, FaUserTimes, FaSearch, FaFilter, FaSave, FaQrcode } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const AttendanceManagement = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [biometricMode, setBiometricMode] = useState(false); // Future implementation for biometric/face recognition

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  // Get sections for selected class
  const classSections = selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [];

  // Filter students based on search term, class, and section
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesSection = !selectedSection || student.section === selectedSection;
    
    return matchesSearch && matchesClass && matchesSection;
  });

  // Initialize attendance records for the selected date
  useEffect(() => {
    const initialAttendance = {};
    filteredStudents.forEach(student => {
      initialAttendance[student.id] = 'present'; // Default to present
    });
    setAttendanceRecords(initialAttendance);
  }, [filteredStudents, selectedDate]);

  // Handle attendance status change
  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Save attendance records
  const saveAttendance = () => {
    // In a real implementation, this would dispatch an action to save attendance
    console.log('Saving attendance for date:', selectedDate);
    console.log('Attendance records:', attendanceRecords);
    
    // Show success message (in a real app, this would be a toast notification)
    alert(`Attendance for ${filteredStudents.length} students saved successfully for ${selectedDate}`);
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

  // Get attendance summary
  const getAttendanceSummary = () => {
    const presentCount = Object.values(attendanceRecords).filter(status => status === 'present').length;
    const absentCount = Object.values(attendanceRecords).filter(status => status === 'absent').length;
    const lateCount = Object.values(attendanceRecords).filter(status => status === 'late').length;
    
    return { presentCount, absentCount, lateCount };
  };

  const { presentCount, absentCount, lateCount } = getAttendanceSummary();

  return (
    <>
      <PageHeader
        title="Attendance Management"
        subtitle="Track student attendance manually or with biometric systems"
        actionButton={
          <button
            onClick={saveAttendance}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <FaSave className="mr-2" /> Save Attendance
          </button>
        }
      />

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setBiometricMode(false)}
                className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-l-md ${
                  !biometricMode
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setBiometricMode(true)}
                className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-r-md ${
                  biometricMode
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FaQrcode className="mr-1" /> Biometric
              </button>
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by student name, email, or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
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

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Present</p>
              <p className="text-3xl font-bold mt-1">{presentCount}</p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
              <FaUserCheck size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Absent</p>
              <p className="text-3xl font-bold mt-1">{absentCount}</p>
            </div>
            <div className="p-3 bg-red-400 bg-opacity-30 rounded-full">
              <FaUserTimes size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Late</p>
              <p className="text-3xl font-bold mt-1">{lateCount}</p>
            </div>
            <div className="p-3 bg-yellow-400 bg-opacity-30 rounded-full">
              <FaClock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Student Attendance ({filteredStudents.length} students)
        </h3>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-gray-500">ID: {student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.class}</div>
                    <div className="text-sm text-gray-500">Section {student.section}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {biometricMode ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FaQrcode className="mr-1" /> Biometric Mode
                      </span>
                    ) : (
                      <select
                        value={attendanceRecords[student.id] || 'present'}
                        onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                        className={`block w-full px-3 py-1 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          attendanceRecords[student.id] === 'present' ? 'bg-green-100 text-green-800 border-green-200' :
                          attendanceRecords[student.id] === 'absent' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}
                      >
                        <option value="present" className="bg-green-100 text-green-800">Present</option>
                        <option value="absent" className="bg-red-100 text-red-800">Absent</option>
                        <option value="late" className="bg-yellow-100 text-yellow-800">Late</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!biometricMode && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'present')}
                          className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded-lg ${
                            attendanceRecords[student.id] === 'present'
                              ? 'border-green-300 bg-green-100 text-green-800'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <FaUserCheck className="mr-1" /> Present
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'absent')}
                          className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded-lg ${
                            attendanceRecords[student.id] === 'absent'
                              ? 'border-red-300 bg-red-100 text-red-800'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <FaUserTimes className="mr-1" /> Absent
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
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