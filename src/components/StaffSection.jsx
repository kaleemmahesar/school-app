import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaff, addStaff, updateStaff, deleteStaff, addStaffAdvance, payStaffSalary } from '../store/staffSlice';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaChalkboardTeacher, FaUser, FaPhone, FaEnvelope, FaCalendar, FaDollarSign, FaBriefcase, FaMoneyBillWave } from 'react-icons/fa';
import PageHeader from './common/PageHeader';
import StaffFormModal from './StaffFormModal';
import StaffFinancialModal from './StaffFinancialModal';
import Pagination from './common/Pagination';

const StaffSection = () => {
  const dispatch = useDispatch();
  const { staff, loading, error } = useSelector(state => state.staff);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [selectedStaffForFinance, setSelectedStaffForFinance] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const handleFinancialAction = (staffMember) => {
    setSelectedStaffForFinance(staffMember);
    setShowFinancialModal(true);
  };

  const handleAddAdvance = (advanceData) => {
    dispatch(addStaffAdvance(advanceData));
  };

  const handlePaySalary = (salaryData) => {
    dispatch(payStaffSalary(salaryData));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const filteredStaff = staff.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total monthly salary expenses (including allowances for current month only)
  const totalMonthlySalary = staff.reduce((sum, member) => {
    const allowances = (member.allowances || []).reduce((allowanceSum, allowance) => {
      return allowanceSum + parseFloat(allowance.amount || 0);
    }, 0);
    return sum + parseFloat(member.salary || 0) + allowances;
  }, 0);

  // Calculate total advances taken by all staff
  const totalAdvances = staff.reduce((sum, member) => {
    const salaryHistory = member.salaryHistory || [];
    const advances = salaryHistory.reduce((advanceSum, record) => {
      // Advances are identified by 'advance' status
      return advanceSum + (record.status === 'advance' ? Math.abs(parseFloat(record.netSalary || 0)) : 0);
    }, 0);
    return sum + advances;
  }, 0);

  // Calculate total amount paid to all staff (historical total)
  const totalPaidSalaries = staff.reduce((sum, member) => {
    const salaryHistory = member.salaryHistory || [];
    const paid = salaryHistory.reduce((paidSum, record) => {
      // Sum all paid salaries
      return paidSum + (record.status === 'paid' ? Math.abs(parseFloat(record.netSalary || 0)) : 0);
    }, 0);
    return sum + paid;
  }, 0);

  // Calculate total expected salaries based on joining date (true pending amount)
  const totalExpectedSalaries = staff.reduce((sum, member) => {
    // Calculate months since joining
    const joiningDate = new Date(member.dateOfJoining);
    const currentDate = new Date();
    const monthsSinceJoining = 
      (currentDate.getFullYear() - joiningDate.getFullYear()) * 12 + 
      (currentDate.getMonth() - joiningDate.getMonth());
    
    // Calculate monthly total (salary + allowances)
    const allowances = (member.allowances || []).reduce((allowanceSum, allowance) => {
      return allowanceSum + parseFloat(allowance.amount || 0);
    }, 0);
    const monthlyTotal = parseFloat(member.salary || 0) + allowances;
    
    // Total expected = months worked * monthly salary
    return sum + (monthsSinceJoining * monthlyTotal);
  }, 0);

  // Calculate true pending amount (expected - paid)
  const totalPendingSalaries = totalExpectedSalaries - totalPaidSalaries;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <p className="text-green-100 text-xs font-medium">Monthly Payroll</p>
                <p className="text-2xl font-bold mt-1">Rs {Math.round(totalMonthlySalary)}</p>
              </div>
              <div className="p-2 bg-green-400 bg-opacity-30 rounded-full">
                <FaDollarSign size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-xs font-medium">Advances Taken</p>
                <p className="text-2xl font-bold mt-1">Rs {Math.round(totalAdvances)}</p>
              </div>
              <div className="p-2 bg-yellow-400 bg-opacity-30 rounded-full">
                <FaMoneyBillWave size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">Total Pending</p>
                <p className="text-2xl font-bold mt-1">Rs {Math.round(totalPendingSalaries)}</p>
              </div>
              <div className="p-2 bg-purple-400 bg-opacity-30 rounded-full">
                <FaBriefcase size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-xs font-medium">Total Paid Ever</p>
                <p className="text-2xl font-bold mt-1">Rs {Math.round(totalPaidSalaries)}</p>
              </div>
              <div className="p-2 bg-teal-400 bg-opacity-30 rounded-full">
                <FaDollarSign size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or position..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStaff.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        ).map((member) => {
          // Calculate months since joining
          const joiningDate = new Date(member.dateOfJoining);
          const currentDate = new Date();
          const monthsSinceJoining = 
            (currentDate.getFullYear() - joiningDate.getFullYear()) * 12 + 
            (currentDate.getMonth() - joiningDate.getMonth());
          
          // Calculate total allowances for the member
          const totalAllowances = (member.allowances || []).reduce((sum, allowance) => {
            return sum + parseFloat(allowance.amount || 0);
          }, 0);
          
          // Calculate monthly total (salary + allowances)
          const monthlyTotal = parseFloat(member.salary || 0) + totalAllowances;
          
          // Calculate advances for this member
          const memberAdvances = (member.salaryHistory || []).reduce((sum, record) => {
            return sum + (record.status === 'advance' ? Math.abs(parseFloat(record.netSalary || 0)) : 0);
          }, 0);
          
          // Calculate paid salaries for this member (total paid so far)
          const memberPaidSalaries = (member.salaryHistory || []).reduce((sum, record) => {
            return sum + (record.status === 'paid' ? Math.abs(parseFloat(record.netSalary || 0)) : 0);
          }, 0);
          
          // Calculate paid salaries for this member for current month
          const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          const memberPaidSalariesCurrentMonth = (member.salaryHistory || []).reduce((sum, record) => {
            return sum + (record.status === 'paid' && record.month === currentMonth ? Math.abs(parseFloat(record.netSalary || 0)) : 0);
          }, 0);
          
          // Calculate pending amount for this member (current month)
          const memberPending = monthlyTotal - memberPaidSalariesCurrentMonth;
          
          return (
            <div key={member.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{member.firstName} {member.lastName}</h3>
                    <p className="text-sm text-gray-500">ID: {member.id}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <FaPhone className="text-gray-400 mr-2" />
                    <span className="text-gray-600">{member.phone}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <FaBriefcase className="text-gray-400 mr-2" />
                    <span className="text-gray-600">{member.position}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <FaCalendar className="text-gray-400 mr-2" />
                    <span className="text-gray-600">Joined: {new Date(member.dateOfJoining).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Financial Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Months Worked:</span>
                        <span className="font-medium">{monthsSinceJoining}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Monthly Salary:</span>
                        <span className="font-medium">Rs {Math.round(monthlyTotal)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Advances Taken:</span>
                        <span className="font-medium text-yellow-600">Rs {Math.round(memberAdvances)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Paid:</span>
                        <span className="font-medium text-green-600">Rs {Math.round(memberPaidSalaries)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Expected Total:</span>
                        <span className="font-medium">Rs {Math.round(monthsSinceJoining * monthlyTotal)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-gray-900">Total Pending:</span>
                        <span className={`text-gray-900 ${(monthsSinceJoining * monthlyTotal) - memberPaidSalaries > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          Rs {Math.round(Math.abs((monthsSinceJoining * monthlyTotal) - memberPaidSalaries))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6 space-x-2">
                  <button
                    onClick={() => handleFinancialAction(member)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FaDollarSign className="mr-1" /> Manage
                  </button>
                  
                  <button
                    onClick={() => handleEdit(member)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaEdit />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredStaff.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FaChalkboardTeacher className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {filteredStaff.length >= itemsPerPage && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredStaff.length / itemsPerPage)}
            totalItems={filteredStaff.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

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

      {/* Staff Financial Modal */}
      {showFinancialModal && selectedStaffForFinance && (
        <StaffFinancialModal
          staffMember={selectedStaffForFinance}
          onClose={() => {
            setShowFinancialModal(false);
            setSelectedStaffForFinance(null);
          }}
          onAddAdvance={handleAddAdvance}
          onPaySalary={handlePaySalary}
        />
      )}
    </>
  );
};

export default StaffSection;