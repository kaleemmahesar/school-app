import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaCalendarAlt, FaSearch, FaFilter, FaCheck, FaTimes, FaUserClock } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const StaffAttendance = () => {
  const { staff } = useSelector(state => state.staff);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});

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

  // Save attendance records
  const saveAttendance = () => {
    // In a real implementation, this would dispatch an action to save attendance records
    console.log('Saving attendance records:', {
      date: attendanceDate,
      records: attendanceRecords
    });
    
    alert(`Attendance records saved for ${Object.keys(attendanceRecords).length} staff members`);
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

  return (
    <>
      <PageHeader
        title="Staff Attendance"
        subtitle="Manage staff attendance manually"
        actionButton={
          Object.keys(attendanceRecords).length > 0 && (
            <button
              onClick={saveAttendance}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              <FaCheck className="mr-2" /> Save Attendance
            </button>
          )
        }
      />

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
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
              <FaCheck className="mr-1" /> All Present
            </button>
            <button
              onClick={markAllAbsent}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaTimes className="mr-1" /> All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Staff Attendance Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Staff Members ({filteredStaff.length})
        </h3>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getAttendanceStatus(member.id) === 'present'
                        ? 'bg-green-100 text-green-800'
                        : getAttendanceStatus(member.id) === 'absent'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getAttendanceStatus(member.id) === 'present' ? 'Present' : 
                       getAttendanceStatus(member.id) === 'absent' ? 'Absent' : 'Late'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setAttendanceStatus(member.id, 'present')}
                        className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded-lg ${
                          getAttendanceStatus(member.id) === 'present'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <FaCheck className="mr-1" /> Present
                      </button>
                      <button
                        onClick={() => setAttendanceStatus(member.id, 'late')}
                        className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded-lg ${
                          getAttendanceStatus(member.id) === 'late'
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <FaUserClock className="mr-1" /> Late
                      </button>
                      <button
                        onClick={() => setAttendanceStatus(member.id, 'absent')}
                        className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded-lg ${
                          getAttendanceStatus(member.id) === 'absent'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <FaTimes className="mr-1" /> Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
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