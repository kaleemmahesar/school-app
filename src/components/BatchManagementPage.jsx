import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStudents } from '../store/studentsSlice';
import { fetchBatches, addBatch, updateBatch, deleteBatch } from '../store/alumniSlice';
import PageHeader from './common/PageHeader';
import PromotionManagement from './PromotionManagement';
import { FaPlus, FaSearch, FaFilter, FaUsers, FaCalendarAlt, FaUserGraduate, FaEdit, FaDownload, FaPrint, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import Pagination from './common/Pagination';

const BatchManagementPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { students, loading: studentsLoading } = useSelector(state => state.students);
  const { batches, loading: batchesLoading } = useSelector(state => state.alumni);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'promotion'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [newBatchData, setNewBatchData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'active' // Changed default to 'active'
  });
  const [editingBatch, setEditingBatch] = useState(null);

  useEffect(() => {
    dispatch(fetchStudents());
    // Only fetch batches once when component mounts
    dispatch(fetchBatches());
  }, [dispatch]); // Empty dependency array means this runs once

  // Auto-update batch statuses based on end dates
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    batches.forEach(batch => {
      // Only check active batches
      if (batch.status === 'active') {
        const endDate = new Date(batch.endDate);
        endDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
        
        // If batch end date has passed, mark as completed
        if (endDate < today) {
          const updatedBatch = {
            ...batch,
            status: 'completed'
          };
          dispatch(updateBatch(updatedBatch));
        }
      }
    });
  }, [batches, dispatch]);

  // Set default selected batch to the active batch
  useEffect(() => {
    if (batches.length > 0 && !selectedBatch) {
      const activeBatch = batches.find(batch => batch.status === 'active');
      if (activeBatch) {
        setSelectedBatch(activeBatch.name);
      }
    }
  }, [batches, selectedBatch]);

  // Get unique academic years from students
  const getUniqueBatches = () => {
    // Use the actual batches from the store
    return batches;
  };

  const uniqueBatches = getUniqueBatches();

  // Get unique classes for dropdown
  const uniqueClasses = [...new Set(students.map(student => student.class))];

  // Get sections for selected class
  const classSections = selectedClass 
    ? [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section))]
    : [];

  // Filter students by selected batch, class, section and search term
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.grNo && student.grNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.class && student.class.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Match by batch name instead of academicYear
    const matchesBatch = !selectedBatch || student.academicYear === selectedBatch;
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesSection = !selectedSection || student.section === selectedSection;
    
    return matchesSearch && matchesBatch && matchesClass && matchesSection;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  const handleCreateBatch = () => {
    if (newBatchData.name && newBatchData.startDate && newBatchData.endDate) {
      // Auto-generate ID based on name
      const batchData = {
        ...newBatchData,
        id: `batch-${newBatchData.name.replace('/', '-')}`,
        classes: ['PG', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
        sections: ['A', 'B']
      };
      dispatch(addBatch(batchData));
      setShowCreateModal(false);
      setNewBatchData({
        name: '',
        startDate: '',
        endDate: '',
        status: 'active' // Changed default to 'active'
      });
    }
  };

  const handleUpdateBatch = () => {
    if (editingBatch && editingBatch.name && editingBatch.startDate && editingBatch.endDate) {
      dispatch(updateBatch(editingBatch));
      setShowEditModal(false);
      setEditingBatch(null);
    }
  };

  const handleDeleteBatch = (batchId) => {
    if (window.confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      dispatch(deleteBatch(batchId));
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  if (studentsLoading || batchesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Batch Management"
        subtitle="Manage academic years and student batches"
        actionButton={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Create Batch
          </button>
        }
      />

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaUsers className="mr-2" />
                Students by Batch
              </div>
            </button>
            <button
              onClick={() => setActiveTab('promotion')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'promotion'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaUserGraduate className="mr-2" />
                Promotion Management
              </div>
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'students' ? (
        <>
          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by student name, GR No, or class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-400" />
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Batches</option>
                    {uniqueBatches.map((batch) => (
                      <option key={batch.id} value={batch.name}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-400" />
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedSection(''); // Reset section when class changes
                    }}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Classes</option>
                    {uniqueClasses.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-400" />
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    disabled={!selectedClass}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Sections</option>
                    {classSections.map((section) => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      // Don't reset selectedBatch to keep active batch selected by default
                      setSelectedClass('');
                      setSelectedSection('');
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Batch Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaUsers className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Total Students</h3>
                  <p className="text-2xl font-bold text-gray-900">{filteredStudents.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <FaCalendarAlt className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Active Batches</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {uniqueBatches.filter(b => b.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaUsers className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Classes</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {uniqueClasses.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Batches Overview */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Academic Batches</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uniqueBatches.map((batch) => {
                    // Count students in this batch
                    const studentCount = students.filter(s => s.academicYear === batch.name).length;
                    
                    return (
                      <tr key={batch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{batch.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            batch.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800' // Changed to gray for completed
                          }`}>
                            {batch.status === 'active' ? (
                              <FaCheck className="mr-1" />
                            ) : (
                              <FaTimes className="mr-1" />
                            )}
                            {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {studentCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingBatch({...batch});
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteBatch(batch.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {uniqueBatches.length === 0 && (
                <div className="text-center py-8">
                  <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No batches found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first batch to get started
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GR No
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class & Section
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src={student.photo || 'https://i.pravatar.cc/300?img=1'} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.fatherName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.grNo || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.class || 'N/A'}</div>
                        <div className="text-sm text-gray-500">Section {student.section || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.academicYear || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.status === 'studying' 
                            ? 'bg-green-100 text-green-800' 
                            : student.status === 'passed_out' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.status === 'studying' ? 'Studying' : 
                           student.status === 'passed_out' ? 'Passed Out' : 
                           student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredStudents.length === 0 && (
                <div className="text-center py-8">
                  <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedBatch || selectedClass || selectedSection || searchTerm
                      ? 'Try adjusting your filters or search criteria'
                      : 'No students available in the system'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {filteredStudents.length > itemsPerPage && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredStudents.length}
                  itemsPerPage={itemsPerPage}
                  paginate={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        // Pass batches data to PromotionManagement component
        <PromotionManagement batches={batches} />
      )}

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New Batch</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Name</label>
                <input
                  type="text"
                  value={newBatchData.name}
                  onChange={(e) => setNewBatchData({...newBatchData, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2025-2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={newBatchData.startDate}
                  onChange={(e) => setNewBatchData({...newBatchData, startDate: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={newBatchData.endDate}
                  onChange={(e) => setNewBatchData({...newBatchData, endDate: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={newBatchData.status}
                  onChange={(e) => setNewBatchData({...newBatchData, status: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {/* Removed 'upcoming' option */}
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBatch}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {showEditModal && editingBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Edit Batch</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Name</label>
                <input
                  type="text"
                  value={editingBatch.name}
                  onChange={(e) => setEditingBatch({...editingBatch, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2025-2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={editingBatch.startDate}
                  onChange={(e) => setEditingBatch({...editingBatch, startDate: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={editingBatch.endDate}
                  onChange={(e) => setEditingBatch({...editingBatch, endDate: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editingBatch.status}
                  onChange={(e) => setEditingBatch({...editingBatch, status: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {/* Removed 'upcoming' option */}
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBatch}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BatchManagementPage;