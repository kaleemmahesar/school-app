import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaff, addStaff, updateStaff, deleteStaff } from '../store/staffSlice';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaChalkboardTeacher, FaUser, FaPhone, FaEnvelope, FaCalendar, FaDollarSign, FaBriefcase } from 'react-icons/fa';
import PageHeader from './common/PageHeader';
import StaffFormModal from './StaffFormModal';

const StaffSection = () => {
  const dispatch = useDispatch();
  const { staff, loading, error } = useSelector(state => state.staff);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);

  useEffect(() => {
    dispatch(fetchStaff());
  }, [dispatch]);

  const handleEdit = (staffMember) => {
    setCurrentStaff(staffMember);
    setShowStaffModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      dispatch(deleteStaff(id));
    }
  };

  const handleStaffSubmit = (staffData) => {
    if (currentStaff) {
      dispatch(updateStaff({ ...currentStaff, ...staffData }));
    } else {
      dispatch(addStaff(staffData));
    }
    setShowStaffModal(false);
    setCurrentStaff(null);
  };

  const filteredStaff = staff.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total salary expenses
  const totalSalary = staff.reduce((sum, member) => sum + parseFloat(member.salary), 0);

  // Group staff by position
  const staffByPosition = staff.reduce((acc, member) => {
    if (!acc[member.position]) {
      acc[member.position] = 0;
    }
    acc[member.position] += 1;
    return acc;
  }, {});

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
    // Removed the outer div with className "space-y-6" since Layout provides the styling
    <>
      <PageHeader
        title="Staff Management"
        subtitle="Manage staff members, positions, and salaries"
        actionButton={
          <button
            onClick={() => {
              setCurrentStaff(null);
              setShowStaffModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <FaPlus className="mr-2" /> Add Staff
          </button>
        }
      />

      {/* Summary Statistics */}
      <div className="my-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Total Staff</p>
                <p className="text-2xl font-bold mt-1">{staff.length}</p>
              </div>
              <div className="p-2 bg-blue-400 bg-opacity-30 rounded-full">
                <FaChalkboardTeacher size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">Total Salary</p>
                <p className="text-2xl font-bold mt-1">Rs {Math.round(totalSalary)}</p>
              </div>
              <div className="p-2 bg-green-400 bg-opacity-30 rounded-full">
                <FaDollarSign size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">Positions</p>
                <p className="text-2xl font-bold mt-1">{Object.keys(staffByPosition).length}</p>
              </div>
              <div className="p-2 bg-purple-400 bg-opacity-30 rounded-full">
                <FaBriefcase size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters - Move inside table section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Filters inside the table container */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Staff by Position */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff by Position</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(staffByPosition).map(([position, count]) => (
            <div key={position} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">{position}</h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {count} members
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Staff Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                        <div className="text-sm text-gray-500">ID: {member.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.email}</div>
                    <div className="text-sm text-gray-500">{member.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Rs {Math.round(parseFloat(member.salary))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.dateOfJoining).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStaff.length === 0 && (
            <div className="text-center py-12">
              <FaChalkboardTeacher className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      

      {/* Staff Form Modal */}
      {showStaffModal && (
        <StaffFormModal
          onClose={() => {
            setShowStaffModal(false);
            setCurrentStaff(null);
          }}
          onSubmit={handleStaffSubmit}
          staffData={currentStaff}
        />
      )}
    </>
  );
};

export default StaffSection;