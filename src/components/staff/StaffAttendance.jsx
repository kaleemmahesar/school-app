import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaCalendarAlt, FaUserCheck, FaUserTimes, FaSearch, FaSave, FaClock, FaDoorOpen } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import { addStaffAttendance, fetchStaffAttendanceByDate } from '../../store/staffSlice';

const StaffAttendance = () => {
  const dispatch = useDispatch();
  const { staff, attendanceRecords: storedAttendanceRecords, loading, error } = useSelector(state => state.staff);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [selectedStaff, setSelectedStaff] = useState([]); // For bulk selection

  // Get unique departments for dropdown
  const uniqueDepartments = [...new Set(staff.map(member => member.department))];

  // Filter staff based on search term and department
  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || member.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  // Load existing attendance records for the selected date
  useEffect(() => {
    dispatch(fetchStaffAttendanceByDate(attendanceDate));
  }, [attendanceDate, dispatch]);

  // Initialize attendance records with existing data or defaults
  useEffect(() => {
    const initialAttendance = {};
    
    // If we have stored attendance records for this date, use them
    if (storedAttendanceRecords && storedAttendanceRecords.length > 0) {
      // storedAttendanceRecords is an array of attendance records for the date
      // Each record has a records property which is an array of {staffId, status}
      storedAttendanceRecords.forEach(record => {
        if (record.date === attendanceDate) {
          record.records.forEach(staffRecord => {
            initialAttendance[staffRecord.staffId] = staffRecord.status;
          });
        }
      });
    }
    
    // For any staff not in existing records, default to present
    filteredStaff.forEach(member => {
      if (!initialAttendance[member.id]) {
        initialAttendance[member.id] = 'present';
      }
    });
    
    setAttendanceRecords(initialAttendance);
  }, [storedAttendanceRecords, attendanceDate, filteredStaff.length]);

  // Calculate attendance summary
  const attendanceSummary = useMemo(() => {
    const presentCount = Object.values(attendanceRecords).filter(status => status === 'present').length;
    const absentCount = Object.values(attendanceRecords).filter(status => status === 'absent').length;
    const lateCount = Object.values(attendanceRecords).filter(status => status === 'late').length;
    const leaveCount = Object.values(attendanceRecords).filter(status => status === 'leave').length;
    
    return { presentCount, absentCount, lateCount, leaveCount };
  }, [attendanceRecords]);

  // Set attendance status for a staff member
  const setAttendanceStatus = (staffId, status) => {
    setAttendanceRecords({
      ...attendanceRecords,
      [staffId]: status
    });
  };

  // Get attendance status for a staff member
  const getAttendanceStatus = (staffId) => {
    return attendanceRecords[staffId] || 'present';
  };

  // Handle checkbox selection
  const handleCheckboxChange = (staffId) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId) 
        : [...prev, staffId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedStaff.length === filteredStaff.length && filteredStaff.length > 0) {
      // Deselect all
      setSelectedStaff([]);
    } else {
      // Select all
      setSelectedStaff(filteredStaff.map(member => member.id));
    }
  };

  // Clear selection
  const clearStaffSelection = () => {
    setSelectedStaff([]);
  };

  // Save attendance records
  const saveAttendance = () => {
    // Prepare attendance data for saving
    const attendanceData = {
      date: attendanceDate,
      records: Object.entries(attendanceRecords).map(([staffId, status]) => ({
        staffId,
        status
      }))
    };
    
    // Dispatch action to save attendance
    dispatch(addStaffAttendance(attendanceData))
      .then(() => {
        alert(`Attendance records saved for ${Object.keys(attendanceRecords).length} staff members`);
      })
      .catch((error) => {
        alert(`Failed to save attendance: ${error.message || 'Unknown error'}`);
      });
  };

  // Mark selected staff as a specific status
  const markSelectedAs = (status) => {
    if (selectedStaff.length === 0) {
      alert('Please select at least one staff member');
      return;
    }
    
    const updatedAttendance = { ...attendanceRecords };
    selectedStaff.forEach(staffId => {
      updatedAttendance[staffId] = status;
    });
    
    setAttendanceRecords(updatedAttendance);
    setSelectedStaff([]); // Clear selection after marking
  };

  // Mark all as present
  const markAllPresent = () => {
    const newRecords = {};
    filteredStaff.forEach(member => {
      newRecords[member.id] = 'present';
    });
    setAttendanceRecords(newRecords);
  };

  // Mark all as absent
  const markAllAbsent = () => {
    const newRecords = {};
    filteredStaff.forEach(member => {
      newRecords[member.id] = 'absent';
    });
    setAttendanceRecords(newRecords);
  };

  // Mark all as late
  const markAllLate = () => {
    const newRecords = {};
    filteredStaff.forEach(member => {
      newRecords[member.id] = 'late';
    });
    setAttendanceRecords(newRecords);
  };

  // Mark all as leave
  const markAllLeave = () => {
    const newRecords = {};
    filteredStaff.forEach(member => {
      newRecords[member.id] = 'leave';
    });
    setAttendanceRecords(newRecords);
  };

  // Get button class based on status
  const getButtonClass = (staffId, status) => {
    const currentStatus = attendanceRecords[staffId] || 'present';
    if (currentStatus === status) {
      switch (status) {
        case 'present':
          return 'inline-flex items-center px-3 py-1 border border-green-300 bg-green-100 text-green-800 text-xs font-medium rounded-lg';
        case 'absent':
          return 'inline-flex items-center px-3 py-1 border border-red-300 bg-red-100 text-red-800 text-xs font-medium rounded-lg';
        case 'late':
          return 'inline-flex items-center px-3 py-1 border border-yellow-300 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-lg';
        case 'leave':
          return 'inline-flex items-center px-3 py-1 border border-blue-300 bg-blue-100 text-blue-800 text-xs font-medium rounded-lg';
        default:
          return 'inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 bg-white text-xs font-medium rounded-lg hover:bg-gray-50';
      }
    }
    return 'inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 bg-white text-xs font-medium rounded-lg hover:bg-gray-50';
  };

  return (
    <>
      <PageHeader
        title="Staff Attendance"
        subtitle="Manage staff attendance manually"
        actionButton={
          <button
            onClick={saveAttendance}
            disabled={Object.keys(attendanceRecords).length === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
              Object.keys(attendanceRecords).length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            <FaSave className="mr-2" /> Save Attendance
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

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
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
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={markAllPresent}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FaUserCheck className="mr-1" /> All Present
            </button>
            <button
              onClick={markAllAbsent}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaUserTimes className="mr-1" /> All Absent
            </button>
          </div>
        </div>
        
        {/* Additional Bulk Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={markAllLate}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <FaClock className="mr-1" /> Mark All Late
          </button>
          <button
            onClick={markAllLeave}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaDoorOpen className="mr-1" /> Mark All Leave
          </button>
        </div>
      </div>

      {/* Bulk Selection Actions */}
      {selectedStaff.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between">
            <div className="text-blue-800 font-medium">
              {selectedStaff.length} staff member{selectedStaff.length !== 1 ? 's' : ''} selected
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
                onClick={() => markSelectedAs('leave')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaDoorOpen className="mr-1" /> Mark Leave
              </button>
              <button
                onClick={clearStaffSelection}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Summary Cards - Moved to top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 shadow">
          <div className="text-sm font-medium text-green-800">Present</div>
          <div className="text-2xl font-semibold text-green-900">{attendanceSummary.presentCount}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 shadow">
          <div className="text-sm font-medium text-red-800">Absent</div>
          <div className="text-2xl font-semibold text-red-900">{attendanceSummary.absentCount}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 shadow">
          <div className="text-sm font-medium text-yellow-800">Late</div>
          <div className="text-2xl font-semibold text-yellow-900">{attendanceSummary.lateCount}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 shadow">
          <div className="text-sm font-medium text-blue-800">Leave</div>
          <div className="text-2xl font-semibold text-blue-900">{attendanceSummary.leaveCount}</div>
        </div>
      </div>

      {/* Staff Attendance Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Staff Attendance ({filteredStaff.length} staff members)
          </h3>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              onClick={handleSelectAll}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              Select All
            </button>
            <button
              onClick={clearStaffSelection}
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
                    checked={selectedStaff.length > 0 && selectedStaff.length === filteredStaff.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedStaff.includes(member.id)}
                      onChange={() => handleCheckboxChange(member.id)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500">ID: {member.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {member.department}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {member.position}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => setAttendanceStatus(member.id, 'present')}
                      className={getButtonClass(member.id, 'present')}
                    >
                      <FaUserCheck className="mr-1" /> Present
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => setAttendanceStatus(member.id, 'absent')}
                      className={getButtonClass(member.id, 'absent')}
                    >
                      <FaUserTimes className="mr-1" /> Absent
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => setAttendanceStatus(member.id, 'late')}
                      className={getButtonClass(member.id, 'late')}
                    >
                      <FaClock className="mr-1" /> Late
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => setAttendanceStatus(member.id, 'leave')}
                      className={getButtonClass(member.id, 'leave')}
                    >
                      <FaDoorOpen className="mr-1" /> Leave
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="4" className="px-4 py-3 text-sm font-medium text-gray-900">
                  Total Staff: {filteredStaff.length}
                </td>
                <td className="px-4 py-3 text-sm text-green-700 font-medium">
                  <FaUserCheck className="inline mr-1" /> Present: {attendanceSummary.presentCount}
                </td>
                <td className="px-4 py-3 text-sm text-red-700 font-medium">
                  <FaUserTimes className="inline mr-1" /> Absent: {attendanceSummary.absentCount}
                </td>
                <td className="px-4 py-3 text-sm text-yellow-700 font-medium">
                  <FaClock className="inline mr-1" /> Late: {attendanceSummary.lateCount}
                </td>
                <td className="px-4 py-3 text-sm text-blue-700 font-medium">
                  <FaDoorOpen className="inline mr-1" /> Leave: {attendanceSummary.leaveCount}
                </td>
              </tr>
            </tfoot>
          </table>
          {filteredStaff.length === 0 && (
            <div className="text-center py-12">
              <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StaffAttendance;