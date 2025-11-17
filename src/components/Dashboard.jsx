import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaUsers, FaMoneyBillWave, FaChalkboardTeacher, FaBook, FaGraduationCap, 
  FaChartLine, FaPlus, FaSearch, FaDollarSign, FaChartPie, FaChartBar, 
  FaFilter, FaPrint, FaDownload, FaCalendarAlt, FaChevronLeft, FaChevronRight,
  FaHandHoldingUsd, FaUserTie
} from 'react-icons/fa';
import PageHeader from './common/PageHeader';
import ActivitiesPrintView from './dashboard/ActivitiesPrintView';
import { useSchoolFunding } from '../hooks/useSchoolFunding';
import FundingConditional from './common/FundingConditional';
import NGOFundingInfo from './common/NGOFundingInfo';
import { usePermissions } from '../hooks/usePermissions';

// Mock subsidy data for when viewing subsidies
const mockSubsidies = [
  {
    id: 'sub-1',
    quarter: 'Q1',
    year: 2023,
    amount: 50000,
    date: '2023-03-15',
    status: 'received',
    description: 'Q1 NGO Subsidy'
  },
  {
    id: 'sub-2',
    quarter: 'Q2',
    year: 2023,
    amount: 50000,
    date: '2023-06-15',
    status: 'received',
    description: 'Q2 NGO Subsidy'
  },
  {
    id: 'sub-3',
    quarter: 'Q3',
    year: 2023,
    amount: 50000,
    date: '2023-09-15',
    status: 'received',
    description: 'Q3 NGO Subsidy'
  },
  {
    id: 'sub-4',
    quarter: 'Q4',
    year: 2023,
    amount: 50000,
    date: '2023-12-15',
    status: 'planned',
    description: 'Q4 NGO Subsidy'
  }
];

const Dashboard = () => {
  const location = useLocation();
  const students = useSelector(state => state.students.students);
  const expenses = useSelector(state => state.expenses.expenses);
  const staff = useSelector(state => state.staff.staff);
  const classes = useSelector(state => state.classes.classes);
  const subsidies = useSelector(state => state.subsidies.subsidies);
  const schoolInfo = useSelector(state => state.settings.schoolInfo);
  const currentUser = useSelector(state => state.users.currentUser);
  const { isNGOSchool } = useSchoolFunding();
  const { hasPermission, isOwner, isAdmin, isTeacher, isStaff } = usePermissions();

  // State for view mode - automatically set based on funding type
  const [viewMode, setViewMode] = useState(isNGOSchool ? 'subsidies' : 'fees'); // 'fees' or 'subsidies'
  
  // Update view mode when funding type changes
  React.useEffect(() => {
    setViewMode(isNGOSchool ? 'subsidies' : 'fees');
  }, [isNGOSchool]);
  
  // State for recent activities table
  const [activityType, setActivityType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [transactionType, setTransactionType] = useState('all');
  const [showPrintView, setShowPrintView] = useState(false);
  
  // State for quarter/year filter
  const [selectedQuarter, setSelectedQuarter] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get unique years and quarters from activities for the filters
  const availableYears = useMemo(() => {
    if (viewMode === 'subsidies') {
      const years = new Set();
      subsidies.forEach(subsidy => {
        // Only include years for received subsidies
        if (subsidy.year && subsidy.status === 'received') {
          years.add(subsidy.year);
        }
      });
      return Array.from(years).sort((a, b) => b - a);
    } else {
      const years = new Set();
      students.forEach(student => {
        if (student.feesHistory) {
          student.feesHistory.forEach(fee => {
            if (fee.date) {
              const year = new Date(fee.date).getFullYear();
              if (year) {
                years.add(year);
              }
            }
          });
        }
      });
      return Array.from(years).sort((a, b) => b - a);
    }
  }, [students, subsidies, viewMode]);

  // Get available quarters
  const availableQuarters = useMemo(() => {
    if (viewMode === 'subsidies') {
      const quarters = new Set();
      subsidies.forEach(subsidy => {
        // Only include quarters for received subsidies
        if (subsidy.quarter && subsidy.status === 'received') {
          const quarterNumber = parseInt(subsidy.quarter.replace('Q', ''));
          if (quarterNumber >= 1 && quarterNumber <= 4) {
            quarters.add(quarterNumber);
          }
        }
      });
      return Array.from(quarters).sort((a, b) => a - b);
    } else {
      const quarters = new Set();
      students.forEach(student => {
        if (student.feesHistory) {
          student.feesHistory.forEach(fee => {
            if (fee.date) {
              const date = new Date(fee.date);
              const month = date.getMonth(); // 0-11
              const quarterNumber = Math.floor(month / 3) + 1; // 1-4
              if (quarterNumber >= 1 && quarterNumber <= 4) {
                quarters.add(quarterNumber);
              }
            }
          });
        }
      });
      return Array.from(quarters).sort((a, b) => a - b);
    }
  }, [students, subsidies, viewMode]);

  // Filter data based on selected quarter and year
  const filteredData = useMemo(() => {
    // If no filter is applied, return all data
    if (selectedQuarter === 'all' && selectedYear === 'all') {
      if (viewMode === 'subsidies') {
        return { filteredExpenses: expenses, filteredStaff: staff, filteredSubsidies: subsidies };
      } else {
        return { filteredExpenses: expenses, filteredStaff: staff, filteredFees: students };
      }
    }
    
    if (viewMode === 'subsidies') {
      // Filter subsidies by quarter and year
      const filteredSubsidies = subsidies.filter(subsidy => {
        // Check year filter
        if (selectedYear !== 'all' && subsidy.year !== parseInt(selectedYear)) {
          return false;
        }
        
        // Check quarter filter
        if (selectedQuarter !== 'all') {
          const subsidyQuarter = parseInt(subsidy.quarter.replace('Q', ''));
          if (subsidyQuarter !== parseInt(selectedQuarter)) {
            return false;
          }
        }
        
        return true;
      });
      
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
      
      return { filteredExpenses, filteredStaff, filteredSubsidies };
    } else {
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
      
      // Filter student fees by quarter and year
      const filteredFees = students.map(student => {
        if (!student.feesHistory) return student;
        
        const filteredFeesHistory = student.feesHistory.filter(record => {
          if (!record.date) return false;
          
          const paymentDate = new Date(record.date);
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
          ...student,
          feesHistory: filteredFeesHistory
        };
      });
      
      return { filteredExpenses, filteredStaff, filteredFees };
    }
  }, [expenses, staff, students, selectedQuarter, selectedYear, viewMode]);

  // Calculate statistics using useMemo for performance
  const stats = useMemo(() => {
    // Use filtered data if filters are applied, otherwise use all data
    const { filteredExpenses, filteredStaff, filteredFees, filteredSubsidies } = filteredData;
    
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
    
    // Total expenses (staff salaries + other expenses)
    const totalExpenses = totalStaffSalaries + otherExpenses;
    
    // Total students
    const totalStudents = students.length;

    if (viewMode === 'subsidies') {
      // Calculate total subsidies received based on filtered received subsidies
      const totalSubsidiesReceived = filteredSubsidies
        .filter(subsidy => subsidy.status === 'received')
        .reduce((sum, subsidy) => sum + parseFloat(subsidy.amount || 0), 0);
      
      // Net profit/loss (income - expenses)
      const netProfit = totalSubsidiesReceived - totalExpenses;
      
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

      // Calculate total classes and sections
      const totalClasses = classes.length;
      const totalSections = classes.reduce((sum, classItem) => sum + (classItem.sections?.length || 0), 0);
      
      // Calculate total subjects (unique subjects only)
      const allSubjectNames = classes.flatMap(classItem => 
        classItem.subjects?.map(subject => subject.name) || []
      );
      const uniqueSubjectNames = [...new Set(allSubjectNames)];
      const totalSubjects = uniqueSubjectNames.length;
      
      return {
        totalExpenses,
        totalStaffSalaries,
        otherExpenses,
        netProfit,
        totalStudents,
        totalSubsidiesReceived,
        studentsByClass,
        expensesByCategory,
        staffByPosition,
        totalStaff: filteredStaff.length,
        totalClasses,
        totalSections,
        totalSubjects
      };
    } else {
      // Calculate total fees collected based on filtered paid fees
      const totalFeesCollected = filteredFees.reduce((sum, student) => {
        if (student.feesHistory) {
          return sum + student.feesHistory
            .filter(fee => fee.status === 'paid')
            .reduce((feeSum, fee) => feeSum + parseFloat(fee.amount || 0), 0);
        }
        return sum;
      }, 0);
      
      // Net profit/loss (income - expenses)
      const netProfit = totalFeesCollected - totalExpenses;
      
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

      // Calculate total classes and sections
      const totalClasses = classes.length;
      const totalSections = classes.reduce((sum, classItem) => sum + (classItem.sections?.length || 0), 0);
      
      // Calculate total subjects (unique subjects only)
      const allSubjectNames = classes.flatMap(classItem => 
        classItem.subjects?.map(subject => subject.name) || []
      );
      const uniqueSubjectNames = [...new Set(allSubjectNames)];
      const totalSubjects = uniqueSubjectNames.length;
      
      return {
        totalExpenses,
        totalStaffSalaries,
        otherExpenses,
        netProfit,
        totalStudents,
        totalFeesCollected,
        studentsByClass,
        expensesByCategory,
        staffByPosition,
        totalStaff: filteredStaff.length,
        totalClasses,
        totalSections,
        totalSubjects
      };
    }
  }, [students, filteredData, classes, selectedQuarter, selectedYear, viewMode]);

  // Generate recent activities data
  const recentActivities = useMemo(() => {
    const { filteredExpenses, filteredStaff, filteredFees, filteredSubsidies } = filteredData;
    const activities = [];
    
    // Add student admission activities
    students.forEach(student => {
      // For subsidy view, admission fees are 0
      // For fees view, admission fees are shown in fee collection entries to avoid duplication
      const admissionFeeAmount = viewMode === 'subsidies' ? 0 : 0; // Always 0 to avoid duplication with fee collection entries
      
      activities.push({
        id: `student-${student.id}`,
        type: 'Student Admission',
        description: `${student.firstName} ${student.lastName} admitted to ${student.class}`,
        date: student.admissionDate || new Date().toISOString(),
        category: 'Students',
        amount: admissionFeeAmount
      });
    });
    
    if (viewMode === 'subsidies') {
      // Add subsidy activities based on filtered data (only received subsidies)
      filteredSubsidies.forEach(subsidy => {
        if (subsidy.status === 'received' && subsidy.receivedDate) {
          activities.push({
            id: `subsidy-${subsidy.id}`,
            type: 'Subsidy Received',
            description: `${subsidy.description} for ${subsidy.quarter} ${subsidy.year}`,
            date: subsidy.receivedDate,
            category: 'Income',
            amount: parseFloat(subsidy.amount)
          });
        }
      });
    } else {
      // Add fee collection activities based on filtered data (only paid fees)
      filteredFees.forEach(student => {
        if (student.feesHistory) {
          student.feesHistory
            .filter(fee => fee.status === 'paid' && fee.date)
            .forEach(fee => {
              activities.push({
                id: `fee-${student.id}-${fee.id}`,
                type: 'Fee Collection',
                description: `Fee collected for ${fee.month} from ${student.firstName} ${student.lastName}`,
                date: fee.date,
                category: 'Fees',
                amount: parseFloat(fee.amount)
              });
            });
        }
      });
    }
    
    // Add expense activities
    filteredExpenses.forEach(expense => {
      activities.push({
        id: `expense-${expense.id}`,
        type: 'Expense',
        description: `${expense.description}`,
        date: expense.date,
        category: 'Expenses',
        amount: -parseFloat(expense.amount)  // Make expenses negative as they are outflows
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
    
    // Sort by date and time (newest first) - ensure proper date parsing and handle invalid dates
    // For activities with the same date, add a small time offset based on their position to maintain order
    return activities.map((activity, index) => {
      // Add a pseudo timestamp to differentiate activities with the same date
      // This helps maintain the order when dates don't include time information
      return {
        ...activity,
        pseudoTimestamp: index
      };
    }).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // Handle invalid dates by putting them at the end
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) {
        // If both dates are invalid, sort by pseudo timestamp
        return a.pseudoTimestamp - b.pseudoTimestamp;
      }
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      // If dates are different, sort by date (newest first)
      if (dateB.getTime() !== dateA.getTime()) {
        return dateB - dateA;
      }
      
      // If dates are the same, sort by pseudo timestamp to maintain original order
      return a.pseudoTimestamp - b.pseudoTimestamp;
    });
  }, [students, filteredData, selectedQuarter, selectedYear, viewMode]);

  // Filter activities based on selected criteria
  const filteredActivities = useMemo(() => {
    let filtered = [...recentActivities]; // Create a copy to avoid mutation
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by transaction type (in/out)
    if (transactionType === 'in') {
      // Income: Fees/Subsidies and Student admissions (positive amounts)
      filtered = filtered.filter(activity => 
        (activity.category === 'Income' && activity.amount > 0) ||
        (activity.category === 'Students')
      );
    } else if (transactionType === 'out') {
      // Expense: Only actual expenses (negative amounts)
      filtered = filtered.filter(activity => 
        (activity.category === 'Expenses' && activity.amount < 0) ||
        (activity.category === 'Fees' && activity.amount < 0)
      );
    }
    
    // Filter by date range for custom activity type
    if (activityType === 'custom' && dateRange.start && dateRange.end) {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
        return activityDate >= startDate && activityDate <= endDate;
      });
    }
    
    // For other activity types, filter by date
    const now = new Date();
    if (activityType === 'daily') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= today && activityDate < tomorrow;
      });
    } else if (activityType === 'monthly') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= startOfMonth && activityDate < startOfNextMonth;
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
      if ((activity.category === 'Income' && activity.amount > 0) ||
          (activity.category === 'Students') ||
          (activity.category === 'Fees' && activity.amount > 0)) {
        totalIncome += Math.abs(activity.amount);
      } else if ((activity.category === 'Expenses' && activity.amount < 0) ||
                 (activity.category === 'Fees' && activity.amount < 0)) {
        totalExpense += Math.abs(activity.amount);  // Use absolute value for expense total
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
        activity.date ? new Date(activity.date).toISOString().split('T')[0] : 'N/A', // MySQL format
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
    // Scroll to top to ensure print view is visible
    setTimeout(() => {
      window.scrollTo(0, 0);
      // Trigger print after a short delay to ensure rendering
      setTimeout(() => {
        window.print();
        // Hide print view after printing
        setTimeout(() => {
          setShowPrintView(false);
        }, 1000);
      }, 500);
    }, 100);
  };

  // Pagination functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate pagination variables
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Since filteredActivities is already sorted with newest first, we slice normally
  // This will show the newest activities on page 1, older on subsequent pages
  const currentActivities = filteredActivities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  
  // Debug information - remove in production
  // console.log('Filtered Activities Count:', filteredActivities.length);
  // console.log('Current Page:', currentPage);
  // console.log('Items Per Page:', itemsPerPage);
  // console.log('Index First Item:', indexOfFirstItem);
  // console.log('Index Last Item:', indexOfLastItem);
  // console.log('Current Activities Count:', currentActivities.length);
  // if (currentActivities.length > 0) {
  //   console.log('First Activity Date:', currentActivities[0]?.date);
  //   console.log('Last Activity Date:', currentActivities[currentActivities.length - 1]?.date);
  // }

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredActivities]);

  // Prepare quarter and year dropdowns for subsidy view
  const quarterYearFilters = viewMode === 'subsidies' ? (
    <>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="block w-full md:w-auto pl-3 pr-10 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <option value="all">All Years</option>
        {availableYears.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      
      <select
        value={selectedQuarter}
        onChange={(e) => setSelectedQuarter(e.target.value)}
        className="block w-full md:w-auto pl-3 pr-10 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <option value="all">All Quarters</option>
        {availableQuarters.map(quarter => (
          <option key={quarter} value={quarter}>{`Q${quarter}`}</option>
        ))}
      </select>
    </>
  ) : null;

  return (
    <div>
      <PageHeader
        title={`Dashboard - ${currentUser?.role || 'Guest'}`}
        subtitle={`Welcome back, ${currentUser?.username || 'Guest'}! Here's what's happening with your school today.`}
        quarterYearFilters={quarterYearFilters}
      />

      {/* NGO Funding Info Banner */}
      <FundingConditional showFor="ngo">
        <div className="mb-6">
          <NGOFundingInfo />
        </div> 
      </FundingConditional>

      {/* Stats Cards - Only show for Owner users */}
      {isOwner() && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-white text-opacity-90 text-sm font-medium mb-1">Financial Overview</h3>
                  <p className="text-white text-opacity-70 text-xs">Income and expenses summary</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <FundingConditional showFor="traditional">
                    <FaDollarSign className="text-white text-xl" />
                  </FundingConditional>
                  <FundingConditional showFor="ngo">
                    <FaHandHoldingUsd className="text-white text-xl" />
                  </FundingConditional>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white border-opacity-20">
                  <div>
                    <p className="text-white text-opacity-90 text-sm font-medium">
                      <FundingConditional showFor="traditional">Fees Collected</FundingConditional>
                      <FundingConditional showFor="ngo">Subsidies Received</FundingConditional>
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      Rs <FundingConditional showFor="traditional">{stats.totalFeesCollected?.toLocaleString()}</FundingConditional>
                      <FundingConditional showFor="ngo">{stats.totalSubsidiesReceived?.toLocaleString()}</FundingConditional>
                    </p>
                  </div>
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FundingConditional showFor="traditional">
                      <FaDollarSign className="text-white" />
                    </FundingConditional>
                    <FundingConditional showFor="ngo">
                      <FaHandHoldingUsd className="text-white" />
                    </FundingConditional>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pb-3 border-b border-white border-opacity-20">
                  <div>
                    <p className="text-white text-opacity-90 text-sm font-medium">Total Expenses</p>
                    <p className="text-2xl font-bold mt-1">Rs {stats.totalExpenses?.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FaChartPie className="text-white" />
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-white bg-opacity-50 mr-2"></div>
                      <span className="text-white text-opacity-80 text-sm">Staff Salaries</span>
                    </div>
                    <span className="font-medium text-sm">Rs {stats.totalStaffSalaries?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-white bg-opacity-50 mr-2"></div>
                      <span className="text-white text-opacity-80 text-sm">Other Expenses</span>
                    </div>
                    <span className="font-medium text-sm">Rs {stats.otherExpenses?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-white text-opacity-90 text-sm font-medium mb-1">Academic Overview</h3>
                  <p className="text-white text-opacity-70 text-xs">Students, classes and subjects</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <FaUsers className="text-white text-xl" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white border-opacity-20">
                  <div>
                    <p className="text-white text-opacity-90 text-sm font-medium">Total Students</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalStudents}</p>
                  </div>
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FaUsers className="text-white" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <p className="text-white text-opacity-80 text-xs mb-1">Classes</p>
                    <p className="text-xl font-bold">{stats.totalClasses}</p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <p className="text-white text-opacity-80 text-xs mb-1">Sections</p>
                    <p className="text-xl font-bold">{stats.totalSections}</p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <p className="text-white text-opacity-80 text-xs mb-1">Subjects</p>
                    <p className="text-xl font-bold">{stats.totalSubjects}</p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-3">
                    <p className="text-white text-opacity-80 text-xs mb-1">Avg. per Class</p>
                    <p className="text-xl font-bold">{stats.totalClasses > 0 ? Math.round(stats.totalStudents / stats.totalClasses) : 0}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-white text-opacity-90 text-sm font-medium mb-1">Staff & Finance</h3>
                  <p className="text-white text-opacity-70 text-xs">Team size and financial position</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <FaUserTie className="text-white text-xl" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white border-opacity-20">
                  <div>
                    <p className="text-white text-opacity-90 text-sm font-medium">Total Staff</p>
                    <p className="text-2xl font-bold mt-1">{stats.totalStaff}</p>
                  </div>
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FaUserTie className="text-white" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pb-3 border-b border-white border-opacity-20">
                  <div>
                    <p className="text-white text-opacity-90 text-sm font-medium">Net Position</p>
                    <p className={`text-2xl font-bold mt-1 ${stats.netProfit >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                      Rs {Math.abs(stats.netProfit)?.toLocaleString()} {stats.netProfit < 0 ? '(Loss)' : ''}
                    </p>
                  </div>
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <FaChartBar className="text-white" />
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-opacity-80 text-sm">Financial Health</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${stats.netProfit >= 0 ? 'bg-green-500 bg-opacity-30 text-green-100' : 'bg-red-500 bg-opacity-30 text-red-100'}`}>
                      {stats.netProfit >= 0 ? 'Positive' : 'Negative'}
                    </span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${stats.netProfit >= 0 ? 'bg-green-300' : 'bg-red-300'}`}
                      style={{ width: `${Math.min(100, Math.abs(stats.netProfit) / (stats.totalExpenses || 1) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </>
      )}

      {/* Academic Stats for Admin users */}
      {isAdmin() && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Students */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white text-opacity-90 text-sm font-medium mb-1">Total Students</h3>
                <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <FaUsers className="text-white text-xl" />
              </div>
            </div>
          </div>
          
          {/* Total Classes */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white text-opacity-90 text-sm font-medium mb-1">Total Classes</h3>
                <p className="text-3xl font-bold mt-2">{stats.totalClasses}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <FaBook className="text-white text-xl" />
              </div>
            </div>
          </div>
          
          {/* Total Sections */}
          <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white text-opacity-90 text-sm font-medium mb-1">Total Sections</h3>
                <p className="text-3xl font-bold mt-2">{stats.totalSections}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <FaGraduationCap className="text-white text-xl" />
              </div>
            </div>
          </div>
          
          {/* Total Staff */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white text-opacity-90 text-sm font-medium mb-1">Total Staff</h3>
                <p className="text-3xl font-bold mt-2">{stats.totalStaff}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <FaUserTie className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities - Show for all users */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 md:mb-0">Recent Activities</h3>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Activity Type Filter */}
            <select
              value={activityType}
              onChange={(e) => {
                setActivityType(e.target.value);
                // Reset date range when changing activity type
                if (e.target.value !== 'custom') {
                  setDateRange({ start: '', end: '' });
                }
              }}
              className="block w-full md:w-auto pl-3 pr-10 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Activities</option>
              <option value="daily">Today</option>
              <option value="monthly">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {/* Transaction Type Filter */}
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="block w-full md:w-auto pl-3 pr-10 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Transactions</option>
              <option value="in">Income</option>
              <option value="out">Expenses</option>
            </select>
            

            
            {/* Search */}
            <div className="relative flex-grow max-w-md md:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search activities..."
                className="block w-full pl-10 pr-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Export and Print Buttons */}
            <button
              onClick={exportToCSV}
              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FaDownload className="mr-1" /> CSV
            </button>
            <button
              onClick={printReport}
              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FaPrint className="mr-1" /> Print
            </button>
          </div>
        </div>
        
        {/* Custom Date Range */}
        {activityType === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="block w-full pl-3 pr-10 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="block w-full pl-3 pr-10 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
        )}
        
        {/* Activities Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentActivities.length > 0 ? (
                currentActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {activity.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {activity.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        activity.category === 'Students' ? 'bg-blue-100 text-blue-800' :
                        activity.category === 'Fees' ? 'bg-green-100 text-green-800' :
                        activity.category === 'Income' ? 'bg-emerald-100 text-emerald-800' :
                        activity.category === 'Expenses' ? 'bg-red-100 text-red-800' :
                        activity.category === 'Staff' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {activity.amount >= 0 ? (
                        <span className="text-green-600">+Rs {activity.amount.toLocaleString()}</span>
                      ) : (
                        <span className="text-red-600">-Rs {Math.abs(activity.amount).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No activities found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredActivities.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredActivities.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                      currentPage === 1 ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <FaChevronLeft />
                  </button>
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Only show first, last, current, and nearby pages
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === pageNumber
                              ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                      currentPage === totalPages ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <FaChevronRight />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print View */}
      {showPrintView && (
        <ActivitiesPrintView
          filteredActivities={filteredActivities}
          calculateTotals={calculateTotals}
          activityType={activityType}
          transactionType={transactionType}
          selectedQuarter={selectedQuarter}
          selectedYear={selectedYear}
          schoolInfo={schoolInfo}
        />
      )}
    </div>
  );
};

export default Dashboard;