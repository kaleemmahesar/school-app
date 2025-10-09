import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { FaUsers, FaMoneyBillWave, FaChalkboardTeacher, FaBook, FaGraduationCap, FaChartLine, FaPlus, FaSearch, FaDollarSign, FaChartPie, FaChartBar } from 'react-icons/fa';

const Dashboard = () => {
  const location = useLocation();
  const students = useSelector(state => state.students.students);
  const expenses = useSelector(state => state.expenses.expenses);
  const staff = useSelector(state => state.staff.staff);
  const classes = useSelector(state => state.classes.classes);

  // Calculate statistics using useMemo for performance
  const stats = useMemo(() => {
    // Total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Total staff
    const totalStaff = staff.length;
    
    // Total students
    const totalStudents = students.length;

    // Total fees collected
    const totalFeesCollected = students.reduce((sum, student) => sum + parseFloat(student.feesPaid || 0), 0);
    
    // Total pending fees
    const totalPendingFees = students.reduce((sum, student) => sum + (parseFloat(student.totalFees || 0) - parseFloat(student.feesPaid || 0)), 0);
    
    // Fees by class
    const feesByClass = students.reduce((acc, student) => {
      if (!acc[student.class]) {
        acc[student.class] = { collected: 0, pending: 0, total: 0 };
      }
      acc[student.class].collected += parseFloat(student.feesPaid || 0);
      acc[student.class].total += parseFloat(student.totalFees || 0);
      acc[student.class].pending += (parseFloat(student.totalFees || 0) - parseFloat(student.feesPaid || 0));
      return acc;
    }, {});
    
    // Students by class
    const studentsByClass = students.reduce((acc, student) => {
      if (!acc[student.class]) {
        acc[student.class] = 0;
      }
      acc[student.class] += 1;
      return acc;
    }, {});
    
    // Expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += parseFloat(expense.amount);
      return acc;
    }, {});
    
    // Staff by position
    const staffByPosition = staff.reduce((acc, member) => {
      if (!acc[member.position]) {
        acc[member.position] = 0;
      }
      acc[member.position] += 1;
      return acc;
    }, {});

    return {
      totalExpenses,
      totalStaff,
      totalStudents,
      totalFeesCollected,
      totalPendingFees,
      feesByClass,
      studentsByClass,
      expensesByCategory,
      staffByPosition
    };
  }, [students, expenses, staff, classes]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6">
        {location.pathname === '/' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform transition duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Students</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalStudents}</p>
                  </div>
                  <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
                    <FaUsers size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-blue-100 text-sm">
                    <span>+12% from last month</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform transition duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Expenses</p>
                    <p className="text-3xl font-bold mt-1">Rs {Math.round(stats.totalExpenses)}</p>
                  </div>
                  <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
                    <FaMoneyBillWave size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-green-100 text-sm">
                    <span>-5% from last month</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform transition duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Staff</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalStaff}</p>
                  </div>
                  <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
                    <FaChalkboardTeacher size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-purple-100 text-sm">
                    <span>+2% from last month</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl shadow-xl p-6 text-white transform transition duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Total Classes</p>
                    <p className="text-3xl font-bold mt-1">{classes.length}</p>
                  </div>
                  <div className="p-3 bg-amber-400 bg-opacity-30 rounded-full">
                    <FaBook size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-amber-100 text-sm">
                    <span>+1 from last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fees Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Fees Collected</p>
                    <p className="text-3xl font-bold mt-1">Rs {Math.round(stats.totalFeesCollected)}</p>
                  </div>
                  <div className="p-3 bg-emerald-400 bg-opacity-30 rounded-full">
                    <FaDollarSign size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-rose-100 text-sm font-medium">Pending Fees</p>
                    <p className="text-3xl font-bold mt-1">Rs {Math.round(stats.totalPendingFees)}</p>
                  </div>
                  <div className="p-3 bg-rose-400 bg-opacity-30 rounded-full">
                    <FaMoneyBillWave size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Students by Class */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Students by Class</h3>
                  <FaChartPie className="text-gray-400" />
                </div>
                <div className="space-y-3">
                  {Object.entries(stats.studentsByClass).map(([className, count]) => (
                    <div key={className} className="flex items-center">
                      <div className="w-32 text-sm text-gray-600">{className}</div>
                      <div className="flex-1 ml-2">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(count / stats.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                          <div className="ml-2 text-sm font-medium text-gray-700 w-10">{count}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fees Collection by Class */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Fees Collection by Class</h3>
                  <FaChartBar className="text-gray-400" />
                </div>
                <div className="space-y-3">
                  {Object.entries(stats.feesByClass).map(([className, data]) => {
                    const collectionRate = data.total > 0 ? (data.collected / data.total) * 100 : 0;
                    return (
                      <div key={className} className="flex items-center">
                        <div className="w-32 text-sm text-gray-600">{className}</div>
                        <div className="flex-1 ml-2">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${collectionRate}%` }}
                              ></div>
                            </div>
                            <div className="ml-2 text-sm font-medium text-gray-700 w-20">
                              {collectionRate.toFixed(0)}%
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ${data.collected.toFixed(0)} / ${data.total.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Students */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Students</h3>
                  <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">View All</button>
                </div>
                <div className="space-y-4">
                  {students.slice(0, 3).map((student) => (
                    <div key={student.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900">{student.firstName} {student.lastName}</h4>
                        <p className="text-sm text-gray-500">{student.class} - {student.section}</p>
                        <div className="flex items-center mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            student.feesPaid >= student.totalFees
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            ${student.feesPaid} / ${student.totalFees}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Expenses */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Expenses</h3>
                  <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">View All</button>
                </div>
                <div className="space-y-4">
                  {expenses.slice(0, 3).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div>
                        <h4 className="font-medium text-gray-900">{expense.description}</h4>
                        <p className="text-sm text-gray-500">{expense.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">Rs {Math.round(expense.amount)}</p>
                        <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;