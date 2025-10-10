import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { FaUsers, FaMoneyBillWave, FaChalkboardTeacher, FaBook, FaGraduationCap, FaChartLine, FaPlus, FaSearch, FaDollarSign, FaChartPie, FaChartBar, FaFilter, FaPrint, FaDownload, FaCalendarAlt } from 'react-icons/fa';
import PageHeader from './common/PageHeader';

const Dashboard = () => {
  const location = useLocation();
  const students = useSelector(state => state.students.students);
  const expenses = useSelector(state => state.expenses.expenses);
  const staff = useSelector(state => state.staff.staff);
  const classes = useSelector(state => state.classes.classes);
  
  // State for recent activities table
  const [activityType, setActivityType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [transactionType, setTransactionType] = useState('all');
  const [showPrintView, setShowPrintView] = useState(false);

  // Calculate statistics using useMemo for performance
  const stats = useMemo(() => {
    // Total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Total staff salaries (including allowances)
    const totalStaffSalaries = staff.reduce((sum, member) => {
      const allowances = (member.allowances || []).reduce((allowanceSum, allowance) => {
        return allowanceSum + parseFloat(allowance.amount || 0);
      }, 0);
      return sum + parseFloat(member.salary || 0) + allowances;
    }, 0);
    
    // Other expenses (excluding staff salaries)
    const otherExpenses = expenses
      .filter(expense => expense.category !== 'Salary')
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Total students
    const totalStudents = students.length;

    // Total fees collected
    const totalFeesCollected = students.reduce((sum, student) => sum + parseFloat(student.feesPaid || 0), 0);
    
    // Total pending fees
    const totalPendingFees = students.reduce((sum, student) => sum + (parseFloat(student.totalFees || 0) - parseFloat(student.feesPaid || 0)), 0);
    
    // Net profit/loss (income - expenses)
    const netProfit = totalFeesCollected - (totalStaffSalaries + otherExpenses);
    
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
      totalStaffSalaries,
      otherExpenses,
      netProfit,
      totalStudents,
      totalFeesCollected,
      totalPendingFees,
      feesByClass,
      studentsByClass,
      expensesByCategory,
      staffByPosition,
      totalStaff: staff.length
    };
  }, [students, expenses, staff, classes]);

  // Generate recent activities data
  const recentActivities = useMemo(() => {
    const activities = [];
    
    // Add student admission activities
    students.forEach(student => {
      activities.push({
        id: `student-${student.id}`,
        type: 'Student Admission',
        description: `${student.firstName} ${student.lastName} admitted to ${student.class}`,
        date: student.admissionDate || new Date().toISOString(),
        category: 'Students',
        amount: parseFloat(student.admissionFees) || 0
      });
    });
    
    // Add fee payment activities
    students.forEach(student => {
      if (parseFloat(student.feesPaid) > 0) {
        activities.push({
          id: `fee-${student.id}`,
          type: 'Fee Payment',
          description: `${student.firstName} ${student.lastName} paid fees`,
          date: new Date().toISOString(), // In a real app, this would be the actual payment date
          category: 'Fees',
          amount: parseFloat(student.feesPaid)
        });
      }
    });
    
    // Add expense activities
    expenses.forEach(expense => {
      activities.push({
        id: `expense-${expense.id}`,
        type: 'Expense',
        description: `${expense.description}`,
        date: expense.date,
        category: 'Expenses',
        amount: parseFloat(expense.amount)
      });
    });
    
    // Add staff activities
    staff.forEach(member => {
      activities.push({
        id: `staff-${member.id}`,
        type: 'Staff',
        description: `${member.firstName} ${member.lastName} joined as ${member.position}`,
        date: member.dateOfJoining || new Date().toISOString(),
        category: 'Staff',
        amount: 0
      });
    });
    
    // Sort by date (newest first)
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [students, expenses, staff]);

  // Filter activities based on selected criteria
  const filteredActivities = useMemo(() => {
    let filtered = recentActivities;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by activity category (fees, expenses, etc.) - removed category filtering from here
    // Categories are now handled separately if needed
    
    // Filter by transaction type (in/out)
    if (transactionType === 'in') {
      // Income: Fees and Student admissions (positive amounts)
      filtered = filtered.filter(activity => 
        (activity.category === 'Fees' && activity.amount > 0) || 
        (activity.category === 'Students' && activity.amount > 0)
      );
    } else if (transactionType === 'out') {
      // Expense: Only actual expenses
      filtered = filtered.filter(activity => 
        activity.category === 'Expenses'
      );
    }
    
    // Filter by date range for custom activity type
    if (activityType === 'custom' && dateRange.start && dateRange.end) {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return activityDate >= startDate && activityDate <= endDate;
      });
    }
    
    // For other activity types, filter by date
    const now = new Date();
    if (activityType === 'daily') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        const activityDay = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate());
        return activityDay.getTime() === today.getTime();
      });
    } else if (activityType === 'monthly') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= startOfMonth;
      });
    }
    // 'all' shows all activities, so no additional filtering needed
    
    return filtered;
  }, [recentActivities, activityType, searchTerm, dateRange, transactionType]);

  // Calculate totals for income and expenses based on filtered activities
  const calculateTotals = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    
    filteredActivities.forEach(activity => {
      if ((activity.category === 'Fees' && activity.amount > 0) || 
          (activity.category === 'Students' && activity.amount > 0)) {
        totalIncome += activity.amount;
      } else if (activity.category === 'Expenses') {
        totalExpense += activity.amount;
      }
    });
    
    return {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense
    };
  }, [filteredActivities]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Activity Type', 'Description', 'Category', 'Date', 'Amount'],
      ...filteredActivities.map(activity => [
        activity.type,
        activity.description,
        activity.category,
        new Date(activity.date).toLocaleDateString(),
        activity.amount
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activities-${activityType}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print report
  const printReport = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 500);
  };

  return (
    <div className={`min-h-screen ${showPrintView ? 'bg-white' : 'bg-gray-50'}`}>
      {/* Print View Styles */}
      {showPrintView && (
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-section, .print-section * {
              visibility: visible;
            }
            .print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 20px;
            }
            .no-print {
              display: none !important;
            }
            body {
              margin: 0;
              padding: 20px;
              background: white;
              font-family: Arial, sans-serif;
            }
            .print-header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .print-header h1 {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            .print-header p {
              font-size: 14px;
              color: #666;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .print-table th,
            .print-table td {
              border: 1px solid #333;
              padding: 8px;
              text-align: left;
            }
            .print-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .print-summary {
              display: flex;
              justify-content: space-between;
              margin-top: 30px;
              page-break-inside: avoid;
            }
            .print-summary-box {
              border: 1px solid #333;
              padding: 15px;
              width: 30%;
              text-align: center;
            }
            .print-summary-box h4 {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #333;
            }
            .print-summary-box p {
              font-size: 20px;
              font-weight: bold;
              color: #333;
            }
            .print-footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #ccc;
              font-size: 12px;
              color: #666;
            }
          }
        `}</style>
      )}
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6">
        {location.pathname === '/' && (
          <div className="space-y-6">
            <PageHeader
              title="Dashboard"
              subtitle="School management overview and analytics"
            />
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaUsers className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaMoneyBillWave className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-semibold text-gray-900">Rs {Math.round(stats.totalExpenses)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FaChalkboardTeacher className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Staff</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalStaff}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <FaBook className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Classes</p>
                    <p className="text-2xl font-semibold text-gray-900">{classes.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaDollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Staff Salaries</p>
                    <p className="text-2xl font-semibold text-gray-900">Rs {Math.round(stats.totalStaffSalaries)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaMoneyBillWave className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Other Expenses</p>
                    <p className="text-2xl font-semibold text-gray-900">Rs {Math.round(stats.otherExpenses)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <FaChartLine className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-2xl font-semibold text-gray-900">Rs {Math.round(stats.totalFeesCollected)}</p>
                  </div>
                </div>
              </div>
              
              <div className={`bg-white rounded-lg shadow p-6 ${stats.netProfit >= 0 ? 'border-t-4 border-green-500' : 'border-t-4 border-red-500'}`}>
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stats.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <FaChartBar className={`h-6 w-6 ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Net Profit/Loss</p>
                    <p className={`text-2xl font-semibold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Rs {Math.round(Math.abs(stats.netProfit))} {stats.netProfit >= 0 ? '' : '(Loss)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Students by Class */}
              <div className="bg-white rounded-lg shadow p-6">
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
              <div className="bg-white rounded-lg shadow p-6">
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
                            Rs {Math.round(data.collected)} / Rs {Math.round(data.total)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activities Table with Filters and Report Generation */}
            <div className={`bg-white rounded-lg shadow p-6 ${showPrintView ? 'print-section' : ''}`}>
              {/* Print Header */}
              {showPrintView && (
                <div className="print-header">
                  <h1>SCHOOL MANAGEMENT SYSTEM</h1>
                  <p>Recent Activities Report</p>
                  <p>Generated on {new Date().toLocaleDateString()}</p>
                </div>
              )}
              
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold text-gray-800 mb-4 md:mb-0 ${showPrintView ? 'print-header' : ''}`}>
                  Recent Activities
                </h3>
                
                {/* Action Buttons */}
                <div className="flex space-x-2 no-print">
                  <button 
                    onClick={exportToCSV}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaDownload className="mr-1.5 text-xs" />
                    Export CSV
                  </button>
                  <button 
                    onClick={printReport}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaPrint className="mr-1.5 text-xs" />
                    Print Report
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6 no-print">
                {/* Activity Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Activity Type</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="block w-full pl-2 pr-8 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Search Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <FaSearch className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Date Range Filters (only visible for custom type) */}
                {activityType === 'custom' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <FaCalendarAlt className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                          className="block w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <FaCalendarAlt className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                          className="block w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {/* Transaction Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Transaction Type</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="block w-full pl-2 pr-8 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="in">Income</option>
                    <option value="out">Expense</option>
                  </select>
                </div>
              </div>

              {/* Activities Table */}
              <div className="overflow-hidden rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredActivities.length > 0 ? (
                      filteredActivities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`p-1.5 rounded-full ${
                                activity.category === 'Students' ? 'bg-blue-100 text-blue-600' :
                                activity.category === 'Fees' ? 'bg-green-100 text-green-600' :
                                activity.category === 'Expenses' ? 'bg-red-100 text-red-600' :
                                'bg-purple-100 text-purple-600'
                              }`}>
                                {activity.category === 'Students' && <FaUsers className="h-3.5 w-3.5" />}
                                {activity.category === 'Fees' && <FaDollarSign className="h-3.5 w-3.5" />}
                                {activity.category === 'Expenses' && <FaMoneyBillWave className="h-3.5 w-3.5" />}
                                {activity.category === 'Staff' && <FaChalkboardTeacher className="h-3.5 w-3.5" />}
                              </div>
                              <div className="ml-2">
                                <div className="text-sm font-medium text-gray-900">{activity.type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm text-gray-900">{activity.description}</div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              activity.category === 'Students' ? 'bg-blue-100 text-blue-800' :
                              activity.category === 'Fees' ? 'bg-green-100 text-green-800' :
                              activity.category === 'Expenses' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {activity.category}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {new Date(activity.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {activity.amount > 0 ? `Rs ${Math.round(activity.amount)}` : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-sm text-gray-500">
                          No activities found matching the current filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-full">
                      <FaDollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600">Total Income</p>
                      <p className="text-lg font-semibold text-gray-900">Rs {Math.round(calculateTotals.income)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-full">
                      <FaMoneyBillWave className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600">Total Expense</p>
                      <p className="text-lg font-semibold text-gray-900">Rs {Math.round(calculateTotals.expense)}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`bg-white rounded-lg p-3 border ${calculateTotals.net >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-gray-100">
                      <FaChartLine className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600">Net Amount</p>
                      <p className={`text-lg font-semibold ${calculateTotals.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Rs {Math.round(Math.abs(calculateTotals.net))} {calculateTotals.net >= 0 ? '' : '(Loss)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fees Stats for Income Report */}
              {transactionType === 'in' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-emerald-100 rounded-full">
                        <FaDollarSign className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-600">Fees Collected</p>
                        <p className="text-lg font-semibold text-gray-900">Rs {Math.round(calculateTotals.income)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-amber-100 rounded-full">
                        <FaMoneyBillWave className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-600">Pending Fees</p>
                        <p className="text-lg font-semibold text-gray-900">Rs {Math.round(stats.totalPendingFees)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Print Summary */}
              {showPrintView && (
                <div className="print-summary mt-6">
                  <div className="print-summary-box">
                    <h4>Total Activities</h4>
                    <p>{filteredActivities.length}</p>
                  </div>
                  <div className="print-summary-box">
                    <h4>Total Income</h4>
                    <p>Rs {Math.round(calculateTotals.income)}</p>
                  </div>
                  <div className="print-summary-box">
                    <h4>Total Expense</h4>
                    <p>Rs {Math.round(calculateTotals.expense)}</p>
                  </div>
                  <div className="print-summary-box">
                    <h4>Net Profit/Loss</h4>
                    <p>Rs {Math.round(Math.abs(calculateTotals.net))} {calculateTotals.net >= 0 ? '' : '(Loss)'}</p>
                  </div>
                </div>
              )}

              {/* Fees Stats for Print View when Income Report */}
              {showPrintView && transactionType === 'in' && (
                <div className="print-summary mt-4">
                  <div className="print-summary-box">
                    <h4>Fees Collected</h4>
                    <p>Rs {Math.round(calculateTotals.income)}</p>
                  </div>
                  <div className="print-summary-box">
                    <h4>Pending Fees</h4>
                    <p>Rs {Math.round(stats.totalPendingFees)}</p>
                  </div>
                </div>
              )}

              {/* Print Footer */}
              {showPrintView && (
                <div className="print-footer mt-6">
                  <p>Report generated on {new Date().toLocaleString()}</p>
                  <p>This is a computer-generated report and does not require a signature.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;