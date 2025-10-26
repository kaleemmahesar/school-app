import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaSearch,FaChartLine, FaDollarSign, FaMoneyBillWave, FaBuilding, FaCalendar, FaDownload, FaPrint, FaFilter } from 'react-icons/fa';
import { useSchoolFunding } from '../hooks/useSchoolFunding';
import FundingConditional from './common/FundingConditional';
import NGOFundingInfo from './common/NGOFundingInfo';

const FinancialReporting = () => {
  const { students } = useSelector(state => state.students);
  const { subsidies } = useSelector(state => state.subsidies);
  const { expenses } = useSelector(state => state.expenses);
  const { isNGOSchool } = useSchoolFunding();
  
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Calculate financial summaries
  const calculateFinancialSummary = () => {
    // Calculate total fees collected
    const totalFeesCollected = students.reduce((total, student) => {
      return total + (student.feesHistory || [])
        .filter(challan => challan.status === 'paid')
        .reduce((studentTotal, challan) => studentTotal + (challan.amount || 0), 0);
    }, 0);
    
    // Calculate total subsidies received
    const totalSubsidiesReceived = subsidies
      .filter(subsidy => subsidy.status === 'received')
      .reduce((total, subsidy) => total + (subsidy.amount || 0), 0);
      
    // Calculate total expenses
    const totalExpenses = expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
    
    // Calculate net balance
    const totalIncome = isNGOSchool ? totalSubsidiesReceived : totalFeesCollected + totalSubsidiesReceived;
    const netBalance = totalIncome - totalExpenses;
    
    return {
      totalFeesCollected,
      totalSubsidiesReceived,
      totalIncome,
      totalExpenses,
      netBalance
    };
  };
  
  const financialSummary = calculateFinancialSummary();
  
  // Filter data based on date range and search term
  const filterFinancialData = () => {
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
    
    // Combine all financial transactions
    const allTransactions = [];
    
    // Add fee transactions (only for traditional schools)
    if (!isNGOSchool) {
      students.forEach(student => {
        (student.feesHistory || []).forEach(challan => {
          if (challan.status === 'paid' && challan.date) {
            const challanDate = new Date(challan.date);
            if ((!startDate || challanDate >= startDate) && (!endDate || challanDate <= endDate)) {
              allTransactions.push({
                id: challan.id,
                date: challan.date,
                type: 'Fee Payment',
                description: `${student.firstName} ${student.lastName} - ${challan.month}`,
                amount: challan.amount || 0,
                category: 'Income',
                studentName: `${student.firstName} ${student.lastName}`,
                class: student.class
              });
            }
          }
        });
      });
    }
    
    // Add subsidy transactions
    subsidies.forEach(subsidy => {
      if (subsidy.status === 'received' && subsidy.receivedDate) {
        const subsidyDate = new Date(subsidy.receivedDate);
        if ((!startDate || subsidyDate >= startDate) && (!endDate || subsidyDate <= endDate)) {
          allTransactions.push({
            id: subsidy.id,
            date: subsidy.receivedDate,
            type: 'NGO Subsidy',
            description: `${subsidy.ngoName} - ${subsidy.quarter} ${subsidy.year}`,
            amount: subsidy.amount || 0,
            category: 'Income',
            ngoName: subsidy.ngoName
          });
        }
      }
    });
    
    // Add expense transactions
    expenses.forEach(expense => {
      if (expense.date) {
        const expenseDate = new Date(expense.date);
        if ((!startDate || expenseDate >= startDate) && (!endDate || expenseDate <= endDate)) {
          allTransactions.push({
            id: expense.id,
            date: expense.date,
            type: 'Expense',
            description: expense.description,
            amount: expense.amount || 0,
            category: 'Expense',
            expenseCategory: expense.category
          });
        }
      }
    });
    
    // Sort by date (newest first)
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply search filter
    if (searchTerm) {
      return allTransactions.filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.studentName && transaction.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.ngoName && transaction.ngoName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return allTransactions;
  };
  
  const filteredTransactions = filterFinancialData();
  
  // Export to CSV function
  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Category'],
      ...filteredTransactions.map(transaction => [
        transaction.date,
        transaction.type,
        `"${transaction.description.replace(/"/g, '""')}"`,
        transaction.amount,
        transaction.category
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'financial_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Reporting</h1>
        <p className="mt-1 text-sm text-gray-600">Comprehensive financial overview with real-time balance and export capabilities</p>
      </div>
      
      {/* NGO Funding Info Banner */}
      {/* <FundingConditional showFor="ngo">
        <div className="mb-6">
          <NGOFundingInfo />
        </div>
      </FundingConditional> */}
      
      {/* Summary Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${isNGOSchool ? '4' : '4'} gap-6 mb-6`}>
        <FundingConditional showFor="traditional">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaDollarSign className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fees Collected</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialSummary.totalFeesCollected)}</p>
              </div>
            </div>
          </div>
        </FundingConditional>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FaBuilding className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Subsidies Received</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialSummary.totalSubsidiesReceived)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FaChartLine className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialSummary.totalIncome)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <FaMoneyBillWave className="text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialSummary.totalExpenses)}</p>
            </div>
          </div>
        </div>
        
        <div className={`bg-white rounded-2xl shadow-lg p-6 ${financialSummary.netBalance >= 0 ? 'border-t-4 border-green-500' : 'border-t-4 border-red-500'}`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${financialSummary.netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <FaChartLine className={financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Balance</p>
              <p className={`text-2xl font-bold ${financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(financialSummary.netBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="summary">Summary Report</option>
                  <option value="detailed">Detailed Transactions</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="date"
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
                <input
                  type="date"
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaDownload className="mr-2" />
                Export CSV
              </button>
              <button
                onClick={printReport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaPrint className="mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Report */}
      {reportType === 'detailed' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Detailed Financial Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                      {transaction.studentName && (
                        <div className="text-xs text-gray-500">{transaction.studentName} ({transaction.class})</div>
                      )}
                      {transaction.ngoName && (
                        <div className="text-xs text-gray-500">{transaction.ngoName}</div>
                      )}
                      {transaction.expenseCategory && (
                        <div className="text-xs text-gray-500">Category: {transaction.expenseCategory}</div>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.category === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.category === 'Income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.category === 'Income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <FaChartLine className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your date range or search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Summary Report */}
      {reportType === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Income Summary</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <FundingConditional showFor="traditional">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Fees Collected</p>
                      <p className="text-xs text-gray-500">Student tuition and other fees</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.totalFeesCollected)}</p>
                  </div>
                </FundingConditional>
                
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">NGO Subsidies</p>
                    <p className="text-xs text-gray-500">Quarterly funding from NGOs</p>
                  </div>
                  <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.totalSubsidiesReceived)}</p>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <p className="text-sm font-medium text-gray-900">Total Income</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(financialSummary.totalIncome)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Expense Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Expense Summary</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Array.from(
                  expenses.reduce((acc, expense) => {
                    if (!acc[expense.category]) {
                      acc[expense.category] = 0;
                    }
                    acc[expense.category] += expense.amount || 0;
                    return acc;
                  }, {})
                )
                  .map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{category}</p>
                      <p className="text-sm font-medium text-red-600">{formatCurrency(amount)}</p>
                    </div>
                  ))}
                
                <div className="flex justify-between items-center pt-2">
                  <p className="text-sm font-medium text-gray-900">Total Expenses</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(financialSummary.totalExpenses)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Net Balance */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Net Financial Position</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Income</p>
                  <p className="text-xs text-gray-500">Fees + Subsidies</p>
                </div>
                <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.totalIncome)}</p>
              </div>
              
              <div className="flex justify-between items-center my-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Expenses</p>
                  <p className="text-xs text-gray-500">Operational costs</p>
                </div>
                <p className="text-sm font-medium text-red-600">{formatCurrency(financialSummary.totalExpenses)}</p>
              </div>
              
              <div className={`flex justify-between items-center p-4 rounded-lg ${financialSummary.netBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div>
                  <p className="text-lg font-bold text-gray-900">Net Balance</p>
                  <p className="text-sm text-gray-500">Current financial position</p>
                </div>
                <p className={`text-lg font-bold ${financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialSummary.netBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReporting;