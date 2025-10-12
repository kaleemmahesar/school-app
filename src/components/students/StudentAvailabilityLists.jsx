import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUserCheck, FaUserTimes, FaSearch, FaFilter, FaEdit } from 'react-icons/fa';
import Pagination from '../common/Pagination';
import { markStudentAsLeft } from '../../store/studentsSlice';

const StudentAvailabilityLists = ({ activeTab: propActiveTab, 
                                  onFilterChange,
                                  parentSearchTerm,
                                  parentSelectedClass,
                                  parentSelectedSection }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { students } = useSelector(state => state.students);
  
  const [searchTerm, setSearchTerm] = useState(parentSearchTerm || '');
  const [selectedClass, setSelectedClass] = useState(parentSelectedClass || '');
  const [selectedSection, setSelectedSection] = useState(parentSelectedSection || '');
  const [localActiveTab, setLocalActiveTab] = useState('available'); // 'available', 'unavailable', or 'left'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Use prop activeTab if provided, otherwise use local state
  const activeTab = propActiveTab !== undefined && propActiveTab !== null ? propActiveTab : localActiveTab;

  // Update local state when parent props change
  useEffect(() => {
    if (parentSearchTerm !== undefined) setSearchTerm(parentSearchTerm);
    if (parentSelectedClass !== undefined) setSelectedClass(parentSelectedClass);
    if (parentSelectedSection !== undefined) setSelectedSection(parentSelectedSection);
  }, [parentSearchTerm, parentSelectedClass, parentSelectedSection]);

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
      // Students who have passed out (generated pass certificate)
      if (student.status === 'passed_out') {
        acc.unavailable.push(student);
      } 
      // Students who left in middle (generated leaving certificate)
      else if (student.status === 'left') {
        acc.left.push(student);
      }
      // Available students (studying - all fees paid)
      else {
        const totalFees = parseFloat(student.totalFees) || 0;
        const feesPaid = parseFloat(student.feesPaid) || 0;
        const isAvailable = feesPaid >= totalFees;
        
        if (isAvailable) {
          acc.available.push(student);
        } else {
          acc.unavailable.push(student);
        }
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
        (student.grNo && student.grNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
  
  // Get current page students
  const getCurrentPageStudents = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return currentFilteredList.slice(startIndex, endIndex);
  };

  const currentStudents = getCurrentPageStudents();
  const totalPages = Math.ceil(currentFilteredList.length / itemsPerPage);

  // Handle edit student
  const handleEditStudent = (student) => {
    navigate('/students/admission', { state: { studentData: student } });
  };

  // Notify parent of filter changes
  const notifyParentOfFilterChange = () => {
    if (onFilterChange) {
      // Calculate filtered stats to send to parent
      const allFilteredStudents = filterStudents(students);
      
      const filteredAvailableStudents = allFilteredStudents.filter(student => {
        // Available students are those who are studying and have paid all fees
        return student.status !== 'passed_out' && student.status !== 'left';
      });

      const filteredUnavailableStudents = allFilteredStudents.filter(student => {
        // Unavailable students are those who have passed out
        return student.status === 'passed_out';
      });

      const filteredLeftStudents = allFilteredStudents.filter(student => {
        // Left students are those who left in middle
        return student.status === 'left';
      });

      // Family groups based on filtered students
      const familyGroups = {};
      allFilteredStudents.forEach(student => {
        const familyId = student.familyId || `unknown-${student.id}`;
        if (!familyGroups[familyId]) {
          familyGroups[familyId] = [];
        }
        familyGroups[familyId].push(student);
      });
      const familyCount = Object.keys(familyGroups).length;

      onFilterChange({
        stats: {
          available: filteredAvailableStudents.length,
          unavailable: filteredUnavailableStudents.length,
          left: filteredLeftStudents.length,
          families: familyCount
        },
        searchTerm,
        selectedClass,
        selectedSection
      });
    }
  };

  // Call notifyParentOfFilterChange when filters change
  useEffect(() => {
    notifyParentOfFilterChange();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, selectedClass, selectedSection]);

  return (
    <>
      {/* Students Table with integrated filters */}
      <div className="bg-white shadow p-4">
        {/* Search and Filters - Move inside table section */}
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by student name, GR No, or class..."
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
                  onChange={(e) => setSelectedClass(e.target.value)}
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
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GR No</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Father's Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Religion</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
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
                    <div className="text-sm text-gray-900">{student.fatherName}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.class}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.section}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.religion}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FaEdit className="mr-1" /> Edit Details
                      </button>
                    </div>
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
                No {activeTab === 'unavailable' ? 'passed out' : activeTab === 'left' ? 'left in middle' : activeTab} students found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {currentFilteredList.length > itemsPerPage && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={currentFilteredList.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default StudentAvailabilityLists;