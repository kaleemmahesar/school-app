import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch, FaChartLine, FaDollarSign, FaMoneyBillWave, FaBuilding, FaCalendar, FaDownload, FaPrint, FaFilter, FaUtensils, FaHandshake } from 'react-icons/fa';
import { useSchoolFunding } from '../hooks/useSchoolFunding';
import FundingConditional from './common/FundingConditional';
import NGOFundingInfo from './common/NGOFundingInfo';
import { addCanteenIncome, addSponsorshipIncome } from '../store/incomeSlice';
import FinancialReportPrintView from './FinancialReportPrintView';
import * as XLSX from 'xlsx-js-style';

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
        return dateRange.start ? `${new Date(dateRange.start).toLocaleDateString()}` : '';
      case 'monthly':
        return `${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      case 'yearly':
        return `${selectedYear}`;
      case 'overall':
        return '';
      case 'custom':
        return dateRange.start && dateRange.end 
          ? `${new Date(dateRange.start).toLocaleDateString()} to ${new Date(dateRange.end).toLocaleDateString()}`
          : '';
      default:
        return `${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
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
    try {
      // Get filtered data
      const filteredStudents = students;
      const filteredSubsidies = filterDataByDate(subsidies);
      const filteredExpenses = filterDataByDate(expenses);
      const filteredCanteenIncome = filterDataByDate(canteenIncomeData);
      const filteredSponsorshipIncome = filterDataByDate(sponsorshipIncomeData);
      const filteredStaff = staff;
      
      // Create CSV content with headers
      let csvContent = [
        ['Financial Report', getPeriodDescription()],
        ['Generated on', new Date().toLocaleString()],
        [], // Empty row for spacing
        ['INCOME SUMMARY'],
        ['Category', 'Amount (PKR)'],
        ['Tuition Fees', financialSummary.tuitionFees],
        ['Admission Fees', financialSummary.admissionFees],
        ['Other Fees', financialSummary.otherFees],
        ['Canteen Income', financialSummary.totalCanteenIncome],
        ['Sponsorship Income', financialSummary.totalSponsorshipIncome],
        ...(isNGOSchool ? [['Subsidies Received', financialSummary.totalSubsidiesReceived]] : []),
        [], // Empty row
        ['Total Income', financialSummary.totalIncome],
        [], // Empty row for spacing
        ['EXPENSE SUMMARY'],
        ['Category', 'Amount (PKR)'],
        ['Staff Salaries', financialSummary.totalStaffSalaries],
        ['Other Expenses', financialSummary.otherExpenses],
        [], // Empty row
        ['Total Expenses', financialSummary.totalExpenses],
        [], // Empty row for spacing
        ['NET BALANCE'],
        ['Amount (PKR)', financialSummary.netBalance],
        ['Status', financialSummary.netBalance >= 0 ? 'Profit' : 'Loss'],
        [], // Empty row for spacing
        ['DETAILED EXPENSE RECORDS'],
        ['Date', 'Description', 'Category', 'Amount (PKR)']
      ];
      
      // Add detailed expense records
      filteredExpenses.forEach(expense => {
        csvContent.push([
          expense.date ? new Date(expense.date).toLocaleDateString() : '',
          `"${expense.description || ''}"`,
          expense.category || '',
          expense.amount || 0
        ]);
      });
      
      // Add total for expenses
      const totalExpensesAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      csvContent.push([]); // Empty row
      csvContent.push(['', '', 'TOTAL', totalExpensesAmount]);
      
      // Add detailed canteen income records
      csvContent.push([], ['DETAILED CANTEEN INCOME RECORDS'], ['Date', 'Description', 'Amount (PKR)']);
      filteredCanteenIncome.forEach(income => {
        csvContent.push([
          income.date ? new Date(income.date).toLocaleDateString() : '',
          `"${income.description || ''}"`,
          income.amount || 0
        ]);
      });
      
      // Add total for canteen income
      const totalCanteenAmount = filteredCanteenIncome.reduce((sum, income) => sum + (income.amount || 0), 0);
      csvContent.push([]); // Empty row
      csvContent.push(['', 'TOTAL', totalCanteenAmount]);
      
      // Add detailed sponsorship income records
      csvContent.push([], ['DETAILED SPONSORSHIP INCOME RECORDS'], ['Date', 'Description', 'Sponsor', 'Amount (PKR)']);
      filteredSponsorshipIncome.forEach(income => {
        csvContent.push([
          income.date ? new Date(income.date).toLocaleDateString() : '',
          `"${income.description || ''}"`,
          income.sponsor || '',
          income.amount || 0
        ]);
      });
      
      // Add total for sponsorship income
      const totalSponsorshipAmount = filteredSponsorshipIncome.reduce((sum, income) => sum + (income.amount || 0), 0);
      csvContent.push([]); // Empty row
      csvContent.push(['', '', 'TOTAL', totalSponsorshipAmount]);
      
      // Add staff salary records if applicable
      csvContent.push([], ['STAFF SALARY RECORDS'], ['Staff Name', 'Position', 'Net Salary (PKR)']);
      filteredStaff.forEach(staffMember => {
        (staffMember.salaryHistory || []).forEach(salaryRecord => {
          const salaryDate = salaryRecord.paymentDate ? new Date(salaryRecord.paymentDate) : null;
          const isInDateRange = (!dateRange.start || !salaryDate || salaryDate >= new Date(dateRange.start)) && 
                                (!dateRange.end || !salaryDate || salaryDate <= new Date(dateRange.end));
          
          if (isInDateRange && salaryRecord.status === 'paid') {
            csvContent.push([
              `"${staffMember.firstName} ${staffMember.lastName}"`,
              staffMember.position || '',
              salaryRecord.netSalary || 0
            ]);
          }
        });
      });
      
      // Add total for staff salaries
      const totalStaffSalariesAmount = csvContent.slice(csvContent.length - filteredStaff.length).reduce((sum, row) => {
        // Skip header rows and empty rows
        if (row.length >= 3 && typeof row[2] === 'number') {
          return sum + row[2];
        }
        return sum;
      }, 0);
      
      csvContent.push([]); // Empty row
      csvContent.push(['', 'TOTAL', totalStaffSalariesAmount]);
      
      // Convert to CSV format
      const csvString = csvContent.map(row => 
        row.map(field => {
          // Escape commas and quotes in fields
          if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        }).join(',')
      ).join('\n');
      
      // Create blob and download
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `financial_report_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      alert("Error exporting to CSV. Please try again.");
    }
  };
  
  // Export to XLSX function
  const exportToXLSX = () => {
    try {
      // Get filtered data
      const filteredStudents = students;
      const filteredSubsidies = filterDataByDate(subsidies);
      const filteredExpenses = filterDataByDate(expenses);
      const filteredCanteenIncome = filterDataByDate(canteenIncomeData);
      const filteredSponsorshipIncome = filterDataByDate(sponsorshipIncomeData);
      const filteredStaff = staff;

      // Create workbook
      const wb = XLSX.utils.book_new();
      wb.Props = {
        Title: "Financial Report",
        Subject: "Financial Data Export",
        Author: "School Management System",
        CreatedDate: new Date(),
        Description: `Financial report for ${getPeriodDescription()}`,
      };

      // --- Summary Sheet ---
      const summaryData = [
        ["Financial Report", getPeriodDescription()],
        [],
        ["Generated on", new Date().toLocaleString()],
        [],
        ["INCOME SUMMARY"],
        ["Category", "Amount (PKR)"],
        ["Tuition Fees", financialSummary.tuitionFees],
        ["Admission Fees", financialSummary.admissionFees],
        ["Other Fees", financialSummary.otherFees],
        ["Canteen Income", financialSummary.totalCanteenIncome],
        ["Sponsorship Income", financialSummary.totalSponsorshipIncome],
        ...(isNGOSchool
          ? [["Subsidies Received", financialSummary.totalSubsidiesReceived]]
          : []),
        ["", ""],
        ["Total Income", financialSummary.totalIncome],
        [],
        ["EXPENSE SUMMARY"],
        ["Category", "Amount (PKR)"],
        ["Staff Salaries", financialSummary.totalStaffSalaries],
        ["Other Expenses", financialSummary.otherExpenses],
        ["", ""],
        ["Total Expenses", financialSummary.totalExpenses],
        [],
        ["NET BALANCE"],
        ["Amount (PKR)", financialSummary.netBalance],
        ["Status", financialSummary.netBalance >= 0 ? "Profit" : "Loss"],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Merge the first two cells in the header row
      summarySheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
      ];
      
      // Set column widths
      summarySheet["!cols"] = [
        { wch: 25 }, // First column width
        { wch: 15 }  // Second column width
      ];
      
      // Style the summary sheet
      const range = XLSX.utils.decode_range(summarySheet['!ref']);
      
      // Apply header styling to merged cell
      const headerCellRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
      if (summarySheet[headerCellRef]) {
        summarySheet[headerCellRef].s = {
          font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "3b82f6" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
      
      // Style category headers
      const categoryHeaderRef1 = XLSX.utils.encode_cell({ r: 4, c: 0 });
      const categoryHeaderRef2 = XLSX.utils.encode_cell({ r: 15, c: 0 });
      const categoryHeaderRef3 = XLSX.utils.encode_cell({ r: 23, c: 0 });
      
      if (summarySheet[categoryHeaderRef1]) {
        summarySheet[categoryHeaderRef1].s = {
          font: { bold: true, sz: 12, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "dbeafe" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
      
      if (summarySheet[categoryHeaderRef2]) {
        summarySheet[categoryHeaderRef2].s = {
          font: { bold: true, sz: 12, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "fee2e2" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
      
      if (summarySheet[categoryHeaderRef3]) {
        summarySheet[categoryHeaderRef3].s = {
          font: { bold: true, sz: 12, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "ddd6fe" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
      
      // Style total rows
      const totalIncomeRef = XLSX.utils.encode_cell({ r: 13, c: 1 });
      const totalExpensesRef = XLSX.utils.encode_cell({ r: 21, c: 1 });
      const netBalanceRef = XLSX.utils.encode_cell({ r: 25, c: 1 });
      
      if (summarySheet[totalIncomeRef]) {
        summarySheet[totalIncomeRef].s = {
          font: { bold: true, sz: 12, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "bbf7d0" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
      
      if (summarySheet[totalExpensesRef]) {
        summarySheet[totalExpensesRef].s = {
          font: { bold: true, sz: 12, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "fecaca" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
      
      if (summarySheet[netBalanceRef]) {
        summarySheet[netBalanceRef].s = {
          font: { bold: true, sz: 12, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: financialSummary.netBalance >= 0 ? "bbf7d0" : "fecaca" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }

      XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

      // --- Expenses Sheet ---
      const expenseData = [
        ["Financial Report - Expenses"],
        [getPeriodDescription()],
        [],
        ["Date", "Description", "Category", "Amount (PKR)"]
      ];

      filteredExpenses.forEach((expense) => {
        expenseData.push([
          expense.date ? new Date(expense.date).toLocaleDateString() : "",
          expense.description || "",
          expense.category || "",
          expense.amount || 0,
        ]);
      });

      // Add total row
      const totalExpensesAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      expenseData.push([]);
      expenseData.push(["", "", "TOTAL", totalExpensesAmount]);

      const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
      
      // Set column widths for expenses sheet
      expenseSheet["!cols"] = [
        { wch: 15 }, // Date column
        { wch: 30 }, // Description column
        { wch: 20 }, // Category column
        { wch: 15 }  // Amount column
      ];
      
      // Style the expenses sheet
      const expenseRange = XLSX.utils.decode_range(expenseSheet['!ref']);
      
      // Header styling
      for (let C = expenseRange.s.c; C <= expenseRange.e.c; C++) {
        const headerCellRef = XLSX.utils.encode_cell({ r: 0, c: C });
        const columnHeaderRef = XLSX.utils.encode_cell({ r: 3, c: C });
        
        if (expenseSheet[headerCellRef]) {
          expenseSheet[headerCellRef].s = {
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "3b82f6" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };
        }
        
        if (expenseSheet[columnHeaderRef]) {
          expenseSheet[columnHeaderRef].s = {
            font: { bold: true, sz: 12, color: { rgb: "000000" } },
            fill: { fgColor: { rgb: "e5e7eb" } },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };
        }
      }
      
      // Total row styling
      const totalExpenseRowRef = XLSX.utils.encode_cell({ r: expenseData.length - 1, c: 3 });
      if (expenseSheet[totalExpenseRowRef]) {
        expenseSheet[totalExpenseRowRef].s = {
          font: { bold: true, sz: 12, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "bbf7d0" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }

      XLSX.utils.book_append_sheet(wb, expenseSheet, "Expenses");

      // --- Canteen Income Sheet ---
      const canteenData = [
        ["Financial Report - Canteen Income"],
        [getPeriodDescription()],
        [],
        ["Date", "Description", "Amount (PKR)"]
      ];
      
      filteredCanteenIncome.forEach((income) =>
        canteenData.push([
          income.date ? new Date(income.date).toLocaleDateString() : "",
          income.description || "",
          income.amount || 0
        ])
      );

      // Add total row
      const totalCanteenAmount = filteredCanteenIncome.reduce((sum, income) => sum + (income.amount || 0), 0);
      canteenData.push([]);
      canteenData.push(["", "TOTAL", totalCanteenAmount]);

      const canteenSheet = XLSX.utils.aoa_to_sheet(canteenData);
      
      // Set column widths for canteen sheet
      canteenSheet["!cols"] = [
        { wch: 15 }, // Date column
        { wch: 35 }, // Description column
        { wch: 15 }  // Amount column
      ];
      
      // Style the canteen sheet
      const canteenRange = XLSX.utils.decode_range(canteenSheet['!ref']);
      
      // Header styling
      for (let C = canteenRange.s.c; C <= canteenRange.e.c; C++) {
        const headerCellRef = XLSX.utils.encode_cell({ r: 0, c: C });
        const columnHeaderRef = XLSX.utils.encode_cell({ r: 3, c: C });
        
        if (canteenSheet[headerCellRef]) {
          canteenSheet[headerCellRef].s = {
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "3b82f6" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };
        }
        
        if (canteenSheet[columnHeaderRef]) {
          canteenSheet[columnHeaderRef].s = {
            font: { bold: true, sz: 12, color: { rgb: "000000" } },
            fill: { fgColor: { rgb: "e5e7eb" } },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };
        }
      }
      
      // Total row styling
      const totalCanteenRowRef = XLSX.utils.encode_cell({ r: canteenData.length - 1, c: 2 });
      if (canteenSheet[totalCanteenRowRef]) {
        canteenSheet[totalCanteenRowRef].s = {
          font: { bold: true, sz: 12, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "bbf7d0" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }

      XLSX.utils.book_append_sheet(wb, canteenSheet, "Canteen Income");

      // --- Sponsorship Sheet ---
      const sponsorshipData = [
        ["Financial Report - Sponsorship Income"],
        [getPeriodDescription()],
        [],
        ["Date", "Description", "Sponsor", "Amount (PKR)"]
      ];
      
      filteredSponsorshipIncome.forEach((income) =>
        sponsorshipData.push([
          income.date ? new Date(income.date).toLocaleDateString() : "",
          income.description || "",
          income.sponsor || "",
          income.amount || 0,
        ])
      );

      // Add total row
      const totalSponsorshipAmount = filteredSponsorshipIncome.reduce((sum, income) => sum + (income.amount || 0), 0);
      sponsorshipData.push([]);
      sponsorshipData.push(["", "", "TOTAL", totalSponsorshipAmount]);

      const sponsorshipSheet = XLSX.utils.aoa_to_sheet(sponsorshipData);
      
      // Set column widths for sponsorship sheet
      sponsorshipSheet["!cols"] = [
        { wch: 15 }, // Date column
        { wch: 30 }, // Description column
        { wch: 25 }, // Sponsor column
        { wch: 15 }  // Amount column
      ];
      
      // Style the sponsorship sheet
      const sponsorshipRange = XLSX.utils.decode_range(sponsorshipSheet['!ref']);
      
      // Header styling
      for (let C = sponsorshipRange.s.c; C <= sponsorshipRange.e.c; C++) {
        const headerCellRef = XLSX.utils.encode_cell({ r: 0, c: C });
        const columnHeaderRef = XLSX.utils.encode_cell({ r: 3, c: C });
        
        if (sponsorshipSheet[headerCellRef]) {
          sponsorshipSheet[headerCellRef].s = {
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "3b82f6" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };
        }
        
        if (sponsorshipSheet[columnHeaderRef]) {
          sponsorshipSheet[columnHeaderRef].s = {
            font: { bold: true, sz: 12, color: { rgb: "000000" } },
            fill: { fgColor: { rgb: "e5e7eb" } },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };
        }
      }
      
      // Total row styling
      const totalSponsorshipRowRef = XLSX.utils.encode_cell({ r: sponsorshipData.length - 1, c: 3 });
      if (sponsorshipSheet[totalSponsorshipRowRef]) {
        sponsorshipSheet[totalSponsorshipRowRef].s = {
          font: { bold: true, sz: 12, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "bbf7d0" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }

      XLSX.utils.book_append_sheet(wb, sponsorshipSheet, "Sponsorship Income");

      // --- Staff Salaries Sheet ---
      const staffData = [
        ["Financial Report - Staff Salaries"],
        [getPeriodDescription()],
        [],
        ["Staff Name", "Position", "Net Salary (PKR)"]
      ];

      filteredStaff.forEach((staffMember) => {
        (staffMember.salaryHistory || []).forEach((salaryRecord) => {
          if (
            salaryRecord.status === "paid" &&
            (!dateRange.start ||
              new Date(salaryRecord.paymentDate) >= new Date(dateRange.start)) &&
            (!dateRange.end ||
              new Date(salaryRecord.paymentDate) <= new Date(dateRange.end))
          ) {
            staffData.push([
              `${staffMember.firstName} ${staffMember.lastName}`,
              staffMember.position || "",
              salaryRecord.netSalary || 0,
            ]);
          }
        });
      });

      // Add total row
      const totalStaffSalariesAmount = staffData.slice(4).reduce((sum, row) => sum + (row[2] || 0), 0);
      staffData.push([]);
      staffData.push(["", "TOTAL", totalStaffSalariesAmount]);

      const staffSheet = XLSX.utils.aoa_to_sheet(staffData);
      
      // Set column widths for staff sheet
      staffSheet["!cols"] = [
        { wch: 25 }, // Staff Name column
        { wch: 20 }, // Position column
        { wch: 15 }  // Net Salary column
      ];
      
      // Style the staff sheet
      const staffRange = XLSX.utils.decode_range(staffSheet['!ref']);
      
      // Header styling
      for (let C = staffRange.s.c; C <= staffRange.e.c; C++) {
        const headerCellRef = XLSX.utils.encode_cell({ r: 0, c: C });
        const columnHeaderRef = XLSX.utils.encode_cell({ r: 3, c: C });
        
        if (staffSheet[headerCellRef]) {
          staffSheet[headerCellRef].s = {
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "3b82f6" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };
        }
        
        if (staffSheet[columnHeaderRef]) {
          staffSheet[columnHeaderRef].s = {
            font: { bold: true, sz: 12, color: { rgb: "000000" } },
            fill: { fgColor: { rgb: "e5e7eb" } },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };
        }
      }
      
      // Total row styling
      const totalStaffRowRef = XLSX.utils.encode_cell({ r: staffData.length - 1, c: 2 });
      if (staffSheet[totalStaffRowRef]) {
        staffSheet[totalStaffRowRef].s = {
          font: { bold: true, sz: 12, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "bbf7d0" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }

      XLSX.utils.book_append_sheet(wb, staffSheet, "Staff Salaries");

      // Export
      XLSX.writeFile(
        wb,
        `financial_report_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } catch (error) {
      console.error("Error exporting to XLSX:", error);
      alert("Error exporting to Excel. Please try again.");
    }
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
    <div className="p-0">
      {/* Screen-Only View - Hidden when printing */}
      <div className="print:hidden">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financial Report</h1>
              <p className="text-sm text-gray-600">{getPeriodDescription()}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              <div className="relative group">
                <button
                  className="inline-flex items-center px-2 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaDownload className="mr-1" size="12" />
                  Export
                </button>
                <div className="absolute right-0 mt-1 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                  <div className="py-1">
                    <button
                      onClick={exportToCSV}
                      className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      CSV
                    </button>
                    <button
                      onClick={exportToXLSX}
                      className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Excel
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={printReport}
                className="inline-flex items-center px-2 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaPrint className="mr-1" size="12" />
                Print
              </button>
            </div>
          </div>
        </div>
        
        {/* Report Period Selection and Income Entry - Combined Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* Report Period Selection */}
          <div className="md:col-span-2 bg-white rounded shadow-sm">
            <div className="p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <select
                    className="block w-full border border-gray-300 rounded text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500"
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="overall">Overall</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                {reportPeriod === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <input
                      type="month"
                      className="block w-full border border-gray-300 rounded text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                  </div>
                )}
                
                {reportPeriod === 'yearly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      className="block w-full border border-gray-300 rounded text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                      <input
                        type="date"
                        className="block w-full border border-gray-300 rounded text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                      <input
                        type="date"
                        className="block w-full border border-gray-300 rounded text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                <div className="flex items-end space-x-1">
                  <button
                    onClick={saveIncomeValues}
                    className="flex-1 inline-flex items-center justify-center px-2 py-1.5 border border-transparent rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaChartLine className="mr-1" size="12" />
                    Update
                  </button>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center justify-center px-2 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FaFilter className="mr-1" size="12" />
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Income Entry Fields - Compact */}
          <div className="bg-white rounded shadow-sm">
            <div className="p-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canteen (PKR)</label>
                  <input
                    type="number"
                    className="block w-full border border-gray-300 rounded text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500"
                    value={canteenIncome}
                    onChange={(e) => setCanteenIncome(e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    Curr: {formatCurrency(financialSummary.totalCanteenIncome)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sponsorship (PKR)</label>
                  <input
                    type="number"
                    className="block w-full border border-gray-300 rounded text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500"
                    value={sponsorshipIncome}
                    onChange={(e) => setSponsorshipIncome(e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    Curr: {formatCurrency(financialSummary.totalSponsorshipIncome)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Financial Summary Cards - Compact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          {/* Income Card */}
          <div className="bg-white rounded shadow-sm p-3 border-l-2 border-l-green-500">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Income</h3>
              <div className="p-1 rounded-full bg-green-100">
                <FaChartLine className="text-green-600 text-sm" />
              </div>
            </div>
            <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(financialSummary.totalIncome)}</p>
            
            <div className="mt-2 space-y-1">
              <FundingConditional showFor="traditional">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tuition</span>
                  <span className="font-medium">{formatCurrency(financialSummary.tuitionFees + financialSummary.admissionFees)}</span>
                </div>
              </FundingConditional>
              
              <FundingConditional showFor="ngo">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subsidies</span>
                  <span className="font-medium">{formatCurrency(financialSummary.totalSubsidiesReceived)}</span>
                </div>
              </FundingConditional>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Other</span>
                <span className="font-medium">{formatCurrency(financialSummary.totalCanteenIncome + financialSummary.totalSponsorshipIncome + financialSummary.otherFees)}</span>
              </div>
            </div>
          </div>
          
          {/* Expenses Card */}
          <div className="bg-white rounded shadow-sm p-3 border-l-2 border-l-red-500">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Expenses</h3>
              <div className="p-1 rounded-full bg-red-100">
                <FaMoneyBillWave className="text-red-600 text-sm" />
              </div>
            </div>
            <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(financialSummary.totalExpenses)}</p>
            
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Salaries</span>
                <span className="font-medium">{formatCurrency(financialSummary.totalStaffSalaries)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Other</span>
                <span className="font-medium">{formatCurrency(financialSummary.otherExpenses)}</span>
              </div>
            </div>
          </div>
          
          {/* Net Balance Card */}
          <div className={`bg-white rounded shadow-sm p-3 border-l-2 ${financialSummary.netBalance >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Net</h3>
              <div className={`p-1 rounded-full ${financialSummary.netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <FaChartLine className={`text-sm ${financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <p className={`text-xl font-bold mt-1 ${financialSummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(financialSummary.netBalance)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {financialSummary.netBalance >= 0 ? 'Profit' : 'Loss'}
            </p>
          </div>
        </div>
        
        {/* Detailed Financial Breakdown - Compact */}
        <div className="bg-white rounded shadow-sm mb-4">
          <div className="p-3">
            <h3 className="text-base font-medium text-gray-900 mb-2">Financial Breakdown</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Income Breakdown */}
              <div className="border border-gray-200 rounded p-2">
                <h4 className="text-sm font-medium text-gray-900 mb-1 pb-1 border-b border-gray-200">Income</h4>
                <div className="space-y-1">
                  <FundingConditional showFor="traditional">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Tuition</p>
                      <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.tuitionFees)}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Admission</p>
                      <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.admissionFees)}</p>
                    </div>
                  </FundingConditional>
                  
                  <FundingConditional showFor="ngo">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Subsidies</p>
                      <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.totalSubsidiesReceived)}</p>
                    </div>
                  </FundingConditional>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Canteen</p>
                    <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.totalCanteenIncome)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Sponsorship</p>
                    <p className="text-sm font-medium text-green-600">{formatCurrency(financialSummary.totalSponsorshipIncome)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Total</p>
                    <p className="text-sm font-bold text-green-600">{formatCurrency(financialSummary.totalIncome)}</p>
                  </div>
                </div>
              </div>
              
              {/* Expense Breakdown */}
              <div className="border border-gray-200 rounded p-2">
                <h4 className="text-sm font-medium text-gray-900 mb-1 pb-1 border-b border-gray-200">Expenses</h4>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Salaries</p>
                    <p className="text-sm font-medium text-red-600">{formatCurrency(financialSummary.totalStaffSalaries)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Other</p>
                    <p className="text-sm font-medium text-red-600">{formatCurrency(financialSummary.otherExpenses)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Total</p>
                    <p className="text-sm font-bold text-red-600">{formatCurrency(financialSummary.totalExpenses)}</p>
                  </div>
                </div>
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