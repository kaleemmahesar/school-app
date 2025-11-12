import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch, FaChartLine, FaDollarSign, FaMoneyBillWave, FaBuilding, FaCalendar, FaDownload, FaPrint, FaFilter, FaUtensils, FaHandshake } from 'react-icons/fa';
import { useSchoolFunding } from '../hooks/useSchoolFunding';
import FundingConditional from './common/FundingConditional';
import NGOFundingInfo from './common/NGOFundingInfo';
import { addCanteenIncome, addSponsorshipIncome } from '../store/incomeSlice';
import FinancialReportPrintView from './FinancialReportPrintView';

const FinancialReporting = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const { subsidies } = useSelector(state => state.subsidies);
  const { expenses } = useSelector(state => state.expenses);
  const { staff } = useSelector(state => state.staff);
  const { canteenIncome: canteenIncomeData, sponsorshipIncome: sponsorshipIncomeData } = useSelector(state => state.income);
  const { isNGOSchool } = useSchoolFunding();
  
  const [reportPeriod, setReportPeriod] = useState('monthly'); // monthly, daily, yearly, overall, custom
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [canteenIncome, setCanteenIncome] = useState('');
  const [sponsorshipIncome, setSponsorshipIncome] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);
  
  // Set default date range based on selected period
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    switch (reportPeriod) {
      case 'daily':
        const todayStr = today.toISOString().split('T')[0];
        setDateRange({ start: todayStr, end: todayStr });
        break;
      case 'monthly':
        setDateRange({ 
          start: firstDayOfMonth.toISOString().split('T')[0], 
          end: lastDayOfMonth.toISOString().split('T')[0] 
        });
        break;
      case 'yearly':
        setDateRange({ 
          start: `${selectedYear}-01-01`, 
          end: `${selectedYear}-12-31` 
        });
        break;
      case 'overall':
        setDateRange({ start: '', end: '' });
        break;
      case 'custom':
        // Keep existing date range
        break;
      default:
        setDateRange({ 
          start: firstDayOfMonth.toISOString().split('T')[0], 
          end: lastDayOfMonth.toISOString().split('T')[0] 
        });
    }
  }, [reportPeriod, selectedMonth, selectedYear]);
  
  // Clear all filters to default values
  const clearFilters = () => {
    setReportPeriod('monthly');
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setSelectedYear(new Date().getFullYear());
    setSearchTerm('');
    setCanteenIncome('');
    setSponsorshipIncome('');
    setReportGenerated(false);
    
    // Reset date range to current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setDateRange({ 
      start: firstDayOfMonth.toISOString().split('T')[0], 
      end: lastDayOfMonth.toISOString().split('T')[0] 
    });
  };
  
  // Filter data based on date range
  const filterDataByDate = (data) => {
    if (!dateRange.start && !dateRange.end) return data; // Overall report
    
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
    
    return data.filter(item => {
      if (!item.date) return true;
      const itemDate = new Date(item.date);
      return (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
    });
  };
  
  // Get period description for display
  const getPeriodDescription = () => {
    switch (reportPeriod) {
      case 'daily':
        return dateRange.start ? `Daily Report: ${new Date(dateRange.start).toLocaleDateString()}` : 'Daily Report';
      case 'monthly':
        return `Monthly Report: ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      case 'yearly':
        return `Yearly Report: ${selectedYear}`;
      case 'overall':
        return 'Overall Report';
      case 'custom':
        return dateRange.start && dateRange.end 
          ? `Custom Report: ${new Date(dateRange.start).toLocaleDateString()} to ${new Date(dateRange.end).toLocaleDateString()}`
          : 'Custom Report';
      default:
        return 'Monthly Report';
    }
  };
  
  // Calculate financial summaries based on selected filters
  const calculateFinancialSummary = () => {
    // Filter data by date range
    const filteredStudents = students;
    const filteredSubsidies = filterDataByDate(subsidies);
    const filteredExpenses = filterDataByDate(expenses);
    const filteredCanteenIncome = filterDataByDate(canteenIncomeData);
    const filteredSponsorshipIncome = filterDataByDate(sponsorshipIncomeData);
    const filteredStaff = staff;
    
    // Initialize income categories
    let tuitionFees = 0;
    let admissionFees = 0;
    let otherFees = 0; // For fines and other miscellaneous fees
    let totalSubsidiesReceived = 0;
    
    // Calculate fees collected (only for traditional schools)
    if (!isNGOSchool) {
      filteredStudents.forEach(student => {
        (student.feesHistory || []).forEach(challan => {
          if (challan.status === 'paid' && challan.amount) {
            const challanDate = challan.date ? new Date(challan.date) : null;
            const isInDateRange = (!dateRange.start || !challanDate || challanDate >= new Date(dateRange.start)) && 
                                  (!dateRange.end || !challanDate || challanDate <= new Date(dateRange.end));
            
            if (isInDateRange) {
              if (challan.type === 'admission') {
                admissionFees += challan.amount;
              } else if (challan.type === 'monthly') {
                tuitionFees += challan.amount;
              } else {
                // For other types like fines
                otherFees += challan.amount;
              }
            }
          }
        });
      });
    }
    
    // Calculate subsidies received (only for NGO schools)
    if (isNGOSchool) {
      totalSubsidiesReceived = filteredSubsidies
        .filter(subsidy => subsidy.status === 'received')
        .reduce((total, subsidy) => total + (subsidy.amount || 0), 0);
    }
    
    // Calculate existing canteen income for the period
    const existingCanteenIncome = filteredCanteenIncome.reduce((total, income) => total + (income.amount || 0), 0);
    
    // Calculate existing sponsorship income for the period
    const existingSponsorshipIncome = filteredSponsorshipIncome.reduce((total, income) => total + (income.amount || 0), 0);
    
    // Use input values if provided, otherwise use existing values
    const totalCanteenIncome = canteenIncome !== '' ? parseFloat(canteenIncome) : existingCanteenIncome;
    const totalSponsorshipIncome = sponsorshipIncome !== '' ? parseFloat(sponsorshipIncome) : existingSponsorshipIncome;
      
    // Calculate total expenses including staff salaries
    let totalStaffSalaries = 0;
    
    // Add staff salaries from salaryHistory
    filteredStaff.forEach(staffMember => {
      (staffMember.salaryHistory || []).forEach(salaryRecord => {
        if (salaryRecord.status === 'paid') {
          const salaryDate = salaryRecord.paymentDate ? new Date(salaryRecord.paymentDate) : null;
          const isInDateRange = (!dateRange.start || !salaryDate || salaryDate >= new Date(dateRange.start)) && 
                                (!dateRange.end || !salaryDate || salaryDate <= new Date(dateRange.end));
          
          if (isInDateRange) {
            totalStaffSalaries += salaryRecord.netSalary || 0;
          }
        }
      });
    });
    
    // Calculate other expenses
    const otherExpenses = filteredExpenses.reduce((total, expense) => total + (expense.amount || 0), 0);
    
    // Total expenses is the sum of staff salaries and other expenses
    const totalExpenses = totalStaffSalaries + otherExpenses;
    
    // Calculate net balance
    const totalIncome = tuitionFees + admissionFees + otherFees + totalSponsorshipIncome + totalCanteenIncome + totalSubsidiesReceived;
    const netBalance = totalIncome - totalExpenses;
    
    return {
      tuitionFees,
      admissionFees,
      otherFees,
      totalSponsorshipIncome,
      totalCanteenIncome,
      totalSubsidiesReceived,
      totalStaffSalaries,
      otherExpenses,
      totalIncome,
      totalExpenses,
      netBalance
    };
  };
  
  const financialSummary = calculateFinancialSummary();
  
  // Save income values
  const saveIncomeValues = () => {
    const periodDesc = getPeriodDescription();
    
    // Add or update canteen income
    if (canteenIncome !== '') {
      dispatch(addCanteenIncome({
        date: dateRange.start || new Date().toISOString().split('T')[0],
        amount: parseFloat(canteenIncome),
        description: `Canteen income for ${periodDesc}`
      }));
    }
    
    // Add or update sponsorship income
    if (sponsorshipIncome !== '') {
      dispatch(addSponsorshipIncome({
        date: dateRange.start || new Date().toISOString().split('T')[0],
        amount: parseFloat(sponsorshipIncome),
        description: `Sponsorship income for ${periodDesc}`,
        sponsor: 'General Sponsor'
      }));
    }
    
    setReportGenerated(true);
  };
  
  // Export to CSV function
  const exportToCSV = () => {
    // Implementation for CSV export
    alert('CSV export functionality would be implemented here');
  };
  
  // Print report function
  const printReport = () => {
    window.print();
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="p-6">
      {/* Screen-Only View - Hidden when printing */}
      <div className="print:hidden">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Financial Reporting</h1>
          <p className="mt-1 text-sm text-gray-600">Comprehensive financial overview with detailed income sources and expense tracking</p>
        </div>
        
        {/* Report Period Selection */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Period</label>
                <select
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                >
                  <option value="daily">Daily Report</option>
                  <option value="monthly">Monthly Report</option>
                  <option value="yearly">Yearly Report</option>
                  <option value="overall">Overall Report</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              
              {reportPeriod === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                  <input
                    type="month"
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
              )}
              
              {reportPeriod === 'yearly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Year</label>
                  <input
                    type="number"
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    min="2000"
                    max="2030"
                  />
                </div>
              )}
              
              {reportPeriod === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />
                  </div>
                </>
              )}
              
              <div className="flex items-end space-x-2">
                <button
                  onClick={saveIncomeValues}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaChartLine className="mr-2" />
                  Update Report
                </button>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaFilter className="mr-2" />
                  Clear Filters
                </button>
              </div>
            </div>
            
            {/* Current Period Display */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Current Period: <span className="font-medium">{getPeriodDescription()}</span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Income Entry Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FaUtensils className="text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Canteen Income</h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR)</label>
              <input
                type="number"
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                value={canteenIncome}
                onChange={(e) => setCanteenIncome(e.target.value)}
                placeholder="Enter canteen income"
              />
            </div>
            <p className="text-sm text-gray-500">
              Current period canteen income: {formatCurrency(financialSummary.totalCanteenIncome)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FaHandshake className="text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Sponsorship Income</h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR)</label>
              <input
                type="number"
                className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                value={sponsorshipIncome}
                onChange={(e) => setSponsorshipIncome(e.target.value)}
                placeholder="Enter sponsorship income"
              />
            </div>
            <p className="text-sm text-gray-500">
              Current period sponsorship income: {formatCurrency(financialSummary.totalSponsorshipIncome)}
            </p>
          </div>
        </div>
        
        {/* Summary Cards - Simplified to 3 main cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Income Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Total Income</h3>
              <div className="p-3 rounded-full bg-green-100">
                <FaChartLine className="text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-4">{formatCurrency(financialSummary.totalIncome)}</p>
            
            <div className="space-y-3">
              <FundingConditional showFor="traditional">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tuition Fees</span>
                  <span className="font-medium">{formatCurrency(financialSummary.tuitionFees)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Admission Fees</span>
                  <span className="font-medium">{formatCurrency(financialSummary.admissionFees)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Other Fees</span>
                  <span className="font-medium">{formatCurrency(financialSummary.otherFees)}</span>
                </div>
              </FundingConditional>
              
              <FundingConditional showFor="ngo">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subsidies Received</span>
                  <span className="font-medium">{formatCurrency(financialSummary.totalSubsidiesReceived)}</span>
                </div>
              </FundingConditional>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Canteen Income</span>
                <span className="font-medium">{formatCurrency(financialSummary.totalCanteenIncome)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sponsorship Income</span>
                <span className="font-medium">{formatCurrency(financialSummary.totalSponsorshipIncome)}</span>
              </div>
            </div>
          </div>
          
          {/* Expenses Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Total Expenses</h3>
              <div className="p-3 rounded-full bg-red-100">
                <FaMoneyBillWave className="text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600 mb-4">{formatCurrency(financialSummary.totalExpenses)}</p>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Staff Salaries</span>
                <span className="font-medium">{formatCurrency(financialSummary.totalStaffSalaries)}</span>
              </div>
              
              {/* Other expenses by category */}
              {Array.from(
                expenses.reduce((acc, expense) => {
                  if (!acc[expense.category]) {
                    acc[expense.category] = 0;
                  }
                  const expenseDate = expense.date ? new Date(expense.date) : null;
                  const isInDateRange = (!dateRange.start || !expenseDate || expenseDate >= new Date(dateRange.start)) && 
                                        (!dateRange.end || !expenseDate || expenseDate <= new Date(dateRange.end));
                  
                  if (isInDateRange) {
                    acc[expense.category] += expense.amount || 0;
                  }
                  return acc;
                }, {})
              )
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="text-gray-600">{category}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
              
              {/* Other Expenses Total */}
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Other Expenses Total</span>
                <span className="font-medium">{formatCurrency(financialSummary.otherExpenses)}</span>
              </div>
            </div>
          </div>
          
          {/* Net Balance Card */}
          <div className={`bg-white rounded-2xl shadow-lg p-6 ${financialSummary.netBalance >= 0 ? 'border-t-4 border-green-500' : 'border-t-4 border-red-500'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Net Balance</h3>
              <div className={`p-3 rounded-full ${financialSummary.netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <FaChartLine className={financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(financialSummary.netBalance)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {financialSummary.netBalance >= 0 ? 'Profit' : 'Loss'} for the selected period
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mb-6">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaDownload className="mr-2" />
            Export CSV
          </button>
          <button
            onClick={printReport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaPrint className="mr-2" />
            Print Report
          </button>
        </div>
        
        {/* Screen-Only Financial Report - Card Style */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Financial Summary</h3>
            <p className="text-sm text-gray-500 mt-1">
              {getPeriodDescription()}
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Breakdown */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Income Breakdown</h4>
                <div className="space-y-3">
                  <FundingConditional showFor="traditional">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Tuition Fees</p>
                      </div>
                      <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.tuitionFees)}</p>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Admission Fees</p>
                      </div>
                      <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.admissionFees)}</p>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Other Fees</p>
                      </div>
                      <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.otherFees)}</p>
                    </div>
                  </FundingConditional>
                  
                  <FundingConditional showFor="ngo">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">NGO Subsidies</p>
                      </div>
                      <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.totalSubsidiesReceived)}</p>
                    </div>
                  </FundingConditional>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Canteen Income</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.totalCanteenIncome)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Sponsorship Income</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.totalSponsorshipIncome)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Total Income</p>
                    <p className="text-sm font-bold text-green-600">{formatCurrency(financialSummary.totalIncome)}</p>
                  </div>
                </div>
              </div>
              
              {/* Expense Breakdown */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Expense Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Staff Salaries</p>
                    </div>
                    <p className="text-sm font-medium text-red-600">{formatCurrency(financialSummary.totalStaffSalaries)}</p>
                  </div>
                  
                  {Array.from(
                    expenses.reduce((acc, expense) => {
                      if (!acc[expense.category]) {
                        acc[expense.category] = 0;
                      }
                      const expenseDate = expense.date ? new Date(expense.date) : null;
                      const isInDateRange = (!dateRange.start || !expenseDate || expenseDate >= new Date(dateRange.start)) && 
                                            (!dateRange.end || !expenseDate || expenseDate <= new Date(dateRange.end));
                      
                      if (isInDateRange) {
                        acc[expense.category] += expense.amount || 0;
                      }
                      return acc;
                    }, {})
                  )
                    .map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{category}</p>
                        <p className="text-sm font-medium text-red-600">{formatCurrency(amount)}</p>
                      </div>
                    ))}
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Other Expenses Total</p>
                    <p className="text-sm font-bold text-red-600">{formatCurrency(financialSummary.otherExpenses)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Total Expenses</p>
                    <p className="text-sm font-bold text-red-600">{formatCurrency(financialSummary.totalExpenses)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Net Balance Summary */}
            <div className={`mt-6 p-4 rounded-lg ${financialSummary.netBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">Net Financial Position</p>
                  <p className="text-sm text-gray-500">Total income minus total expenses</p>
                </div>
                <p className={`text-lg font-bold ${financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialSummary.netBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Print-Only View - Hidden on screen, visible only when printing */}
      <div className="hidden print:block">
        <FinancialReportPrintView 
          financialSummary={financialSummary}
          getPeriodDescription={getPeriodDescription}
          dateRange={dateRange}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
};

export default FinancialReporting;