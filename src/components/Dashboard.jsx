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
  const subsidies = useSelector(state => state.subsidies.subsidies);
  
  // State for recent activities table
  const [activityType, setActivityType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [transactionType, setTransactionType] = useState('all');
  const [showPrintView, setShowPrintView] = useState(false);
  
  // State for quarter/year filter
  const [selectedQuarter, setSelectedQuarter] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  // Get unique years and quarters from activities for the filters
  const availableYears = useMemo(() => {
    const years = new Set();
    
    // Add years from received subsidies only
    subsidies
      .filter(subsidy => subsidy.status === 'received')
      .forEach(subsidy => {
        if (subsidy.year) {
          years.add(subsidy.year);
        }
      });
    
    return Array.from(years).sort((a, b) => b - a);
  }, [subsidies]);

  // Get available quarters from received subsidies
  const availableQuarters = useMemo(() => {
    const quarters = new Set();
    
    // Add quarters from received subsidies only
    subsidies
      .filter(subsidy => subsidy.status === 'received')
      .forEach(subsidy => {
        if (subsidy.quarter) {
          const quarterNumber = parseInt(subsidy.quarter.replace('Q', ''));
          if (!isNaN(quarterNumber) && quarterNumber >= 1 && quarterNumber <= 4) {
            quarters.add(quarterNumber);
          }
        }
      });
    
    return Array.from(quarters).sort((a, b) => a - b);
  }, [subsidies]);

  // Filter data based on selected quarter and year
  const filteredData = useMemo(() => {
    // If no filter is applied, return all data
    if (selectedQuarter === 'all' && selectedYear === 'all') {
      return { filteredExpenses: expenses, filteredStaff: staff, filteredSubsidies: subsidies };
    }
    
    // Filter expenses by quarter and year
    const filteredExpenses = expenses.filter(expense => {
      if (!expense.date) return false;
      
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth(); // 0-11
      const expenseQuarter = Math.floor(expenseMonth / 3) + 1; // 1-4
      
      // Check year filter
      if (selectedYear !== 'all' && expenseYear !== parseInt(selectedYear)) {
        return false;
      }
      
      // Check quarter filter
      if (selectedQuarter !== 'all' && expenseQuarter !== parseInt(selectedQuarter)) {
        return false;
      }
      
      return true;
    });
    
    // Filter staff salary history by quarter and year
    const filteredStaff = staff.map(member => {
      if (!member.salaryHistory) return member;
      
      const filteredSalaryHistory = member.salaryHistory.filter(record => {
        if (!record.paymentDate) return false;
        
        const paymentDate = new Date(record.paymentDate);
        const paymentYear = paymentDate.getFullYear();
        const paymentMonth = paymentDate.getMonth(); // 0-11
        const paymentQuarter = Math.floor(paymentMonth / 3) + 1; // 1-4
        
        // Check year filter
        if (selectedYear !== 'all' && paymentYear !== parseInt(selectedYear)) {
          return false;
        }
        
        // Check quarter filter
        if (selectedQuarter !== 'all' && paymentQuarter !== parseInt(selectedQuarter)) {
          return false;
        }
        
        return true;
      });
      
      return {
        ...member,
        salaryHistory: filteredSalaryHistory
      };
    });
    
    // Filter subsidies by quarter and year
    const filteredSubsidies = subsidies.filter(subsidy => {
      // Only show received subsidies (as per financial reporting best practices)
      if (subsidy.status !== 'received') return false;
      
      // Check year filter
      if (selectedYear !== 'all' && subsidy.year !== parseInt(selectedYear)) {
        return false;
      }
      
      // Check quarter filter
      if (selectedQuarter !== 'all') {
        const quarterNumber = parseInt(selectedQuarter);
        const subsidyQuarterNumber = parseInt(subsidy.quarter.replace('Q', ''));
        if (subsidyQuarterNumber !== quarterNumber) {
          return false;
        }
      }
      
      return true;
    });
    
    return { filteredExpenses, filteredStaff, filteredSubsidies };
  }, [expenses, staff, subsidies, selectedQuarter, selectedYear]);

  // Calculate statistics using useMemo for performance
  const stats = useMemo(() => {
    // Use filtered data if filters are applied, otherwise use all data
    const { filteredExpenses, filteredStaff, filteredSubsidies } = filteredData;
    
    // Total expenses
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Total staff salaries (including allowances)
    const totalStaffSalaries = filteredStaff.reduce((sum, member) => {
      const allowances = (member.allowances || []).reduce((allowanceSum, allowance) => {
        return allowanceSum + parseFloat(allowance.amount || 0);
      }, 0);
      return sum + parseFloat(member.salary || 0) + allowances;
    }, 0);
    
    // Other expenses (excluding staff salaries)
    const otherExpenses = filteredExpenses
      .filter(expense => expense.category !== 'Salary')
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Total students
    const totalStudents = students.length;

    // Calculate total NGO subsidies based on filtered received subsidies
    const totalNGOSubsidies = filteredSubsidies
      .filter(subsidy => subsidy.status === 'received')
      .reduce((sum, subsidy) => sum + parseFloat(subsidy.amount), 0);
    
    // Net profit/loss (income - expenses)
    const netProfit = totalNGOSubsidies - (totalStaffSalaries + otherExpenses);
    
    // Students by class - include all classes, even those without students
    const studentsByClass = {};
    // Initialize with all classes
    classes.forEach(classItem => {
      studentsByClass[classItem.name] = 0;
    });
    // Add student data
    students.forEach(student => {
      if (!studentsByClass[student.class]) {
        studentsByClass[student.class] = 0;
      }
      studentsByClass[student.class] += 1;
    });
    
    // Expenses by category
    const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += parseFloat(expense.amount);
      return acc;
    }, {});
    
    // Staff by position
    const staffByPosition = filteredStaff.reduce((acc, member) => {
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
      totalNGOSubsidies,
      studentsByClass,
      expensesByCategory,
      staffByPosition,
      totalStaff: filteredStaff.length
    };
  }, [students, filteredData, classes, selectedQuarter, selectedYear]);

  // Generate recent activities data
  const recentActivities = useMemo(() => {
    const { filteredExpenses, filteredStaff, filteredSubsidies } = filteredData;
    const activities = [];
    
    // Add student admission activities
    students.forEach(student => {
      activities.push({
        id: `student-${student.id}`,
        type: 'Student Admission',
        description: `${student.firstName} ${student.lastName} admitted to ${student.class}`,
        date: student.admissionDate || new Date().toISOString(),
        category: 'Students',
        amount: 0 // No admission fees in NGO school
      });
    });
    
    // Add NGO subsidy activities based on filtered data (only received subsidies)
    filteredSubsidies
      .filter(subsidy => subsidy.status === 'received')
      .forEach(subsidy => {
        activities.push({
          id: `subsidy-${subsidy.id}`,
          type: 'NGO Subsidy',
          description: `${subsidy.quarter} ${subsidy.year} subsidy received from ${subsidy.ngoName}`,
          date: subsidy.receivedDate,
          category: 'Income',
          amount: parseFloat(subsidy.amount)
        });
      });
    
    // Add expense activities
    filteredExpenses.forEach(expense => {
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
    filteredStaff.forEach(member => {
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
  }, [students, filteredData, selectedQuarter, selectedYear]);

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
        (activity.category === 'Students' && activity.amount > 0) ||
        (activity.category === 'Income' && activity.amount > 0)
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
          (activity.category === 'Students' && activity.amount > 0) ||
          (activity.category === 'Income' && activity.amount > 0)) {
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">School management overview and analytics</p>
              </div>
              
              {/* Quarter/Year Filter */}
              <div className="flex space-x-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quarter</label>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    className="block w-full pl-2 pr-8 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Quarters</option>
                    {availableQuarters.map(quarter => (
                      <option key={quarter} value={quarter}>Q{quarter} (Quarter {quarter})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="block w-full pl-2 pr-8 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                {(selectedQuarter !== 'all' || selectedYear !== 'all') && (
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSelectedQuarter('all');
                        setSelectedYear('all');
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
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
              
              {/* <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaMoneyBillWave className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-semibold text-gray-900">Rs {Math.round(stats.totalExpenses)}</p>
                  </div>
                </div>
              </div> */}
              
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
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <p className="text-sm font-medium text-gray-600">NGO Subsidies</p>
                    <p className="text-2xl font-semibold text-gray-900">Rs {Math.round(stats.totalNGOSubsidies)}</p>
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
            </div> */}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Students by Class */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Students by Class</h3>
                  <FaChartPie className="text-gray-400" />
                </div>
                <div className="space-y-3">
                  {classes.map((classItem) => {
                    const count = stats.studentsByClass[classItem.name] || 0;
                    return (
                      <div key={classItem.name} className="flex items-center">
                        <div className="w-32 text-sm text-gray-600">{classItem.name}</div>
                        <div className="flex-1 ml-2">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${stats.totalStudents > 0 ? (count / stats.totalStudents) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <div className="ml-2 text-sm font-medium text-gray-700 w-10">{count}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NGO Subsidy Utilization */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Subsidy Utilization</h3>
                  <FaChartBar className="text-gray-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-32 text-sm text-gray-600">Staff Salaries</div>
                    <div className="flex-1 ml-2">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${stats.totalNGOSubsidies > 0 ? (stats.totalStaffSalaries / stats.totalNGOSubsidies) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="ml-2 text-sm font-medium text-gray-700 w-24">
                          Rs {Math.round(stats.totalStaffSalaries)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-32 text-sm text-gray-600">Other Expenses</div>
                    <div className="flex-1 ml-2">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-amber-600 h-2 rounded-full" 
                            style={{ width: `${stats.totalNGOSubsidies > 0 ? (stats.otherExpenses / stats.totalNGOSubsidies) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="ml-2 text-sm font-medium text-gray-700 w-24">
                          Rs {Math.round(stats.otherExpenses)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-32 text-sm text-gray-600">Remaining</div>
                    <div className="flex-1 ml-2">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${stats.totalNGOSubsidies > 0 ? ((stats.totalNGOSubsidies - stats.totalStaffSalaries - stats.otherExpenses) / stats.totalNGOSubsidies) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="ml-2 text-sm font-medium text-gray-700 w-24">
                          Rs {Math.round(stats.totalNGOSubsidies - stats.totalStaffSalaries - stats.otherExpenses)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Subsidy:</span>
                    <span className="font-medium">Rs {Math.round(stats.totalNGOSubsidies)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Expenses:</span>
                    <span className="font-medium">Rs {Math.round(stats.totalStaffSalaries + stats.otherExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold mt-1">
                    <span className={stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      Net {stats.netProfit >= 0 ? 'Profit' : 'Loss'}:
                    </span>
                    <span className={stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      Rs {Math.round(Math.abs(stats.netProfit))}
                    </span>
                  </div>
                  
                  {/* Filter info */}
                  {(selectedQuarter !== 'all' || selectedYear !== 'all') && (
                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                      Showing data for{' '}
                      {selectedQuarter !== 'all' ? `Q${selectedQuarter} ` : ''}
                      {selectedYear !== 'all' ? selectedYear : ''}
                    </div>
                  )}
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
                  {(selectedQuarter !== 'all' || selectedYear !== 'all') && (
                    <p className="text-sm">
                      Filtered for {selectedQuarter !== 'all' ? `Q${selectedQuarter} ` : ''}
                      {selectedYear !== 'all' ? selectedYear : ''}
                    </p>
                  )}
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

              {/* Filter info display */}
              {(selectedQuarter !== 'all' || selectedYear !== 'all') && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700 no-print">
                  Showing activities for{' '}
                  {selectedQuarter !== 'all' ? `Q${selectedQuarter} ` : ''}
                  {selectedYear !== 'all' ? selectedYear : ''}
                  <button 
                    onClick={() => {
                      setSelectedQuarter('all');
                      setSelectedYear('all');
                    }}
                    className="ml-2 text-blue-900 font-medium underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}

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
                                activity.category === 'Income' ? 'bg-emerald-100 text-emerald-600' :
                                'bg-purple-100 text-purple-600'
                              }`}>
                                {activity.category === 'Students' && <FaUsers className="h-3.5 w-3.5" />}
                                {activity.category === 'Fees' && <FaDollarSign className="h-3.5 w-3.5" />}
                                {activity.category === 'Expenses' && <FaMoneyBillWave className="h-3.5 w-3.5" />}
                                {activity.category === 'Income' && <FaChartLine className="h-3.5 w-3.5" />}
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
                              activity.category === 'Income' ? 'bg-emerald-100 text-emerald-800' :
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
              <div className="mt-6 pt-6 border-t border-gray-200 no-print">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-green-800">Total Income</div>
                    <div className="text-2xl font-semibold text-green-900">Rs {Math.round(calculateTotals.income)}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-red-800">Total Expenses</div>
                    <div className="text-2xl font-semibold text-red-900">Rs {Math.round(calculateTotals.expense)}</div>
                  </div>
                  <div className={`rounded-lg p-4 ${calculateTotals.net >= 0 ? 'bg-blue-50' : 'bg-amber-50'}`}>
                    <div className={`text-sm font-medium ${calculateTotals.net >= 0 ? 'text-blue-800' : 'text-amber-800'}`}>
                      Net {calculateTotals.net >= 0 ? 'Profit' : 'Loss'}
                    </div>
                    <div className={`text-2xl font-semibold ${calculateTotals.net >= 0 ? 'text-blue-900' : 'text-amber-900'}`}>
                      Rs {Math.round(Math.abs(calculateTotals.net))} {calculateTotals.net >= 0 ? '' : '(Loss)'}
                    </div>
                  </div>
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