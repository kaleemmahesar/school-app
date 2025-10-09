import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUserCheck, FaUserTimes, FaSearch, FaFilter, FaEdit } from 'react-icons/fa';

const StudentAvailabilityLists = ({ activeTab: propActiveTab }) => {
  const navigate = useNavigate();
  const { students } = useSelector(state => state.students);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [localActiveTab, setLocalActiveTab] = useState('available'); // 'available', 'unavailable', or 'left'
  
  // Use prop activeTab if provided, otherwise use local state
  const activeTab = propActiveTab !== undefined && propActiveTab !== null ? propActiveTab : localActiveTab;

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  // Get sections for selected class
  const classSections = selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [];

  // Categorize students
  const categorizeStudents = () => {
    return students.reduce((acc, student) => {
      // Calculate if student is "available" (studying - all fees paid)
      const totalFees = parseFloat(student.totalFees) || 0;
      const feesPaid = parseFloat(student.feesPaid) || 0;
      const isAvailable = feesPaid >= totalFees;
      
      // For this implementation, we'll consider students with a "graduationDate" or "status" field as "left"
      // Since we don't have these fields in the current data model, we'll simulate this by checking
      // if the student is in a "passed out" class (e.g., classes that are no longer active)
      const isLeft = student.status === 'left' || student.status === 'passed_out' || 
                    (student.class && student.class.includes('Passed')) || 
                    (student.graduationDate && new Date(student.graduationDate) < new Date());
      
      if (isLeft) {
        acc.left.push(student);
      } else if (isAvailable) {
        acc.available.push(student);
      } else {
        acc.unavailable.push(student);
      }
      
      return acc;
    }, { available: [], unavailable: [], left: [] });
  };

  const { available, unavailable, left } = categorizeStudents();

  // Filter students based on search term, class, and section
  const filterStudents = (studentList) => {
    return studentList.filter(student => {
      const matchesSearch = 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = !selectedClass || student.class === selectedClass;
      const matchesSection = !selectedSection || student.section === selectedSection;
      
      return matchesSearch && matchesClass && matchesSection;
    });
  };

  const filteredAvailable = filterStudents(available);
  const filteredUnavailable = filterStudents(unavailable);
  const filteredLeft = filterStudents(left);

  // Get current filtered list based on active tab
  const getCurrentFilteredList = () => {
    switch (activeTab) {
      case 'available': return filteredAvailable;
      case 'unavailable': return filteredUnavailable;
      case 'left': return filteredLeft;
      default: return filteredAvailable;
    }
  };

  const currentFilteredList = getCurrentFilteredList();

  // If activeTab is provided as prop, don't show the tabs
  const showTabs = propActiveTab === undefined || propActiveTab === null;

  // Handle edit student
  const handleEditStudent = (student) => {
    navigate('/students/admission', { state: { studentData: student } });
  };

  return (
    <>
      {/* Students Table with integrated filters - only show tabs when not controlled by parent */}
      <div className="bg-white rounded-lg shadow p-4">
        {showTabs && (
          /* Tabs for Available/Unavailable/Left */
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex flex-wrap space-x-6">
              <button
                onClick={() => setLocalActiveTab('available')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <FaUserCheck className="mr-2" />
                  Available
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {filteredAvailable.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setLocalActiveTab('unavailable')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'unavailable'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <FaUserTimes className="mr-2" />
                  Unavailable
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {filteredUnavailable.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setLocalActiveTab('left')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'left'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <FaUserTimes className="mr-2" />
                  Left
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {filteredLeft.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>
        )}

        {/* Search and Filters - Move inside table section */}
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by student name, email, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400 h-4 w-4" />
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection(''); // Reset section when class changes
                  }}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400 h-4 w-4" />
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">All Sections</option>
                  {classSections.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedClass('');
                  setSelectedSection('');
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear
              </button>
            </div>
          </div>
          
          {/* Summary Statistics */}
          <div className="mt-3 flex items-center text-sm text-gray-600">
            <span>
              Showing {currentFilteredList.length} of {
                activeTab === 'available' ? available.length :
                activeTab === 'unavailable' ? unavailable.length :
                left.length
              } {activeTab} students
            </span>
            {(selectedClass || selectedSection || searchTerm) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedClass('');
                  setSelectedSection('');
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                (Clear filters)
              </button>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentFilteredList.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border border-dashed rounded-md w-8 h-8" />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                        <div className="text-xs text-gray-500">ID: {student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                    <div className="text-xs text-gray-500">{student.phone}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.class}</div>
                    <div className="text-xs text-gray-500">Section {student.section}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      parseFloat(student.feesPaid) >= parseFloat(student.totalFees)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Rs {student.feesPaid} / Rs {student.totalFees}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === 'available'
                        ? 'bg-green-100 text-green-800'
                        : activeTab === 'unavailable'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {activeTab === 'available' 
                        ? 'Studying' 
                        : activeTab === 'unavailable' 
                          ? 'Pending Fees' 
                          : 'Left School'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentFilteredList.length === 0 && (
            <div className="text-center py-8">
              <div className="flex justify-center">
                {activeTab === 'available' ? 
                  <FaUserCheck className="mx-auto h-8 w-8 text-gray-400" /> : 
                  activeTab === 'unavailable' ?
                  <FaUserTimes className="mx-auto h-8 w-8 text-gray-400" /> :
                  <FaUserTimes className="mx-auto h-8 w-8 text-gray-400" />
                }
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No {activeTab} students found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentAvailabilityLists;