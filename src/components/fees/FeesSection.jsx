import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, generateChallan, bulkGenerateChallans, bulkUpdateChallanStatuses, payFees } from '../../store/studentsSlice';
import { FaEye, FaReceipt, FaCheck, FaDollarSign, FaPrint, FaUser, FaUsers } from 'react-icons/fa';
import FeesHeader from './FeesHeader';
import FeesStats from './FeesStats';
import ViewTabs from './ViewTabs';
import FeesFilters from './FeesFilters';
import StudentFeesView from './StudentFeesView';
import FamilyFeesView from './FamilyFeesView';
import ChallanModals from './ChallanModals';
import ChallanPrintView from '../ChallanPrintView';
import BulkChallanPrintView from '../BulkChallanPrintView';
import { printChallanAsPDF } from '../../utils/challanPrinter';

const FeesSection = () => {
  const dispatch = useDispatch();
  const { students, loading, error } = useSelector(state => state.students);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [detailViewStudent, setDetailViewStudent] = useState(null);
  const [challanData, setChallanData] = useState({
    studentId: '',
    month: '',
    amount: '',
    dueDate: '',
    description: ''
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPrintView, setShowPrintView] = useState(false);
  const [printChallan, setPrintChallan] = useState(null);
  const [printStudent, setPrintStudent] = useState(null);
  const [showBulkPrintView, setShowBulkPrintView] = useState(false);
  const [bulkPrintChallans, setBulkPrintChallans] = useState([]);
  const [showBulkGenerateModal, setShowBulkGenerateModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [bulkSelectedChallans, setBulkSelectedChallans] = useState([]);
  const [paymentData, setPaymentData] = useState({
    challanId: '',
    paymentMethod: 'cash',
    paymentDate: ''
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Add state for bulk generate options
  const [bulkGenerateOptions, setBulkGenerateOptions] = useState({
    generateFor: 'all',
    selectedClass: '',
    selectedSection: ''
  });
  // Add state for class and section filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  // Add state for view mode (student or family)
  const [viewMode, setViewMode] = useState('student'); // 'student' or 'family'
  // Add state for family management view
  const [showFamilyManagement, setShowFamilyManagement] = useState(false);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  // Update detailViewStudent when students data changes
  useEffect(() => {
    if (detailViewStudent && showStudentDetails) {
      const updatedStudent = students.find(s => s.id === detailViewStudent.id);
      if (updatedStudent) {
        // Generate stats for the updated student
        const monthlyChallans = updatedStudent.feesHistory ? updatedStudent.feesHistory.filter(challan => challan.type !== 'admission') : [];
        const admissionChallans = updatedStudent.feesHistory ? updatedStudent.feesHistory.filter(challan => challan.type === 'admission') : [];
        
        const totalChallans = monthlyChallans.length;
        const paidChallans = monthlyChallans.filter(challan => challan.status === 'paid').length;
        const pendingChallans = totalChallans - paidChallans;
        
        // Calculate total amount
        const totalAmount = monthlyChallans.reduce((sum, challan) => sum + (challan.amount || 0), 0);
        
        const paidAmount = monthlyChallans
          .filter(challan => challan.status === 'paid')
          .reduce((sum, challan) => sum + (challan.amount || 0), 0);
        
        const pendingAmount = totalAmount - paidAmount;
        
        // Check if admission fees have been paid
        const admissionPaid = admissionChallans.length > 0 && admissionChallans.every(challan => challan.status === 'paid');
        
        setDetailViewStudent({
          ...updatedStudent,
          totalChallans,
          paidChallans,
          pendingChallans,
          totalAmount,
          paidAmount,
          pendingAmount,
          admissionPaid,
          completionRate: totalChallans > 0 ? Math.round((paidChallans / totalChallans) * 100) : 0
        });
      }
    }
  }, [students, detailViewStudent, showStudentDetails]);

  // Get unique classes and sections for filters
  const uniqueClasses = [...new Set(students.map(student => student.class))];
  const classSections = selectedClass 
    ? [...new Set(students.filter(student => student.class === selectedClass).map(student => student.section))]
    : [];

  // Generate fee statistics for all students
  const generateStudentFeeStats = () => {
    return students.map(student => {
      const monthlyChallans = student.feesHistory ? student.feesHistory.filter(challan => challan.type !== 'admission') : [];
      const admissionChallans = student.feesHistory ? student.feesHistory.filter(challan => challan.type === 'admission') : [];
      
      const totalChallans = monthlyChallans.length;
      const paidChallans = monthlyChallans.filter(challan => challan.status === 'paid').length;
      const pendingChallans = totalChallans - paidChallans;
      
      const totalAmount = monthlyChallans.reduce((sum, challan) => sum + (challan.amount || 0), 0);
      
      const paidAmount = monthlyChallans
        .filter(challan => challan.status === 'paid')
        .reduce((sum, challan) => sum + (challan.amount || 0), 0);
      
      const pendingAmount = totalAmount - paidAmount;
      
      const admissionPaid = admissionChallans.length > 0 && admissionChallans.every(challan => challan.status === 'paid');
      
      return {
        ...student,
        totalChallans,
        paidChallans,
        pendingChallans,
        totalAmount,
        paidAmount,
        pendingAmount,
        admissionPaid,
        completionRate: totalChallans > 0 ? Math.round((paidChallans / totalChallans) * 100) : 0
      };
    });
  };

  const studentStats = generateStudentFeeStats();

  const filteredStudents = studentStats.filter(student => {
    const matchesSearch = 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.section.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'paid' && student.completionRate === 100 && student.admissionPaid) || 
      (filterStatus === 'pending' && (student.completionRate < 100 || !student.admissionPaid));
      
    // Add class and section filters
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesSection = !selectedSection || student.section === selectedSection;
    
    return matchesSearch && matchesStatus && matchesClass && matchesSection;
  });

  // Get all challans grouped by family for family view
  const getFamilyChallans = () => {
    const familyMap = {};
    
    // Group students by familyId and collect all their challans
    filteredStudents.forEach(student => {
      if (!familyMap[student.familyId]) {
        familyMap[student.familyId] = {
          familyId: student.familyId,
          students: [],
          totalChallans: 0,
          paidChallans: 0,
          pendingChallans: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          completionRate: 0,
          familyName: `${student.firstName} ${student.lastName}'s Family`,
          challans: [] // Add this property to store all family challans
        };
      }
      
      familyMap[student.familyId].students.push(student);
      
      // Add student's challans to family challans array
      if (student.feesHistory) {
        student.feesHistory.forEach(challan => {
          familyMap[student.familyId].challans.push({
            ...challan,
            studentName: `${student.firstName} ${student.lastName}`,
            studentClass: student.class,
            studentSection: student.section,
            studentId: student.id
          });
        });
      }
      
      // Aggregate statistics
      familyMap[student.familyId].totalChallans += student.totalChallans;
      familyMap[student.familyId].paidChallans += student.paidChallans;
      familyMap[student.familyId].pendingChallans += student.pendingChallans;
      familyMap[student.familyId].totalAmount += student.totalAmount;
      familyMap[student.familyId].paidAmount += student.paidAmount;
      familyMap[student.familyId].pendingAmount += student.pendingAmount;
      
      // Calculate completion rate
      familyMap[student.familyId].completionRate = familyMap[student.familyId].totalChallans > 0 
        ? Math.round((familyMap[student.familyId].paidChallans / familyMap[student.familyId].totalChallans) * 100)
        : 0;
    });
    
    return Object.values(familyMap);
  };

  // Calculate family groups only when needed to avoid "Cannot access 'filteredStudents' before initialization"
  const familyGroups = viewMode === 'family' ? getFamilyChallans() : [];

  // Bulk operation functions
  const handleBulkGenerate = () => {
    setShowBulkGenerateModal(true);
  };

  const handleBulkUpdate = () => {
    setShowBulkUpdateModal(true);
  };

  // Challan selection functions
  const isChallanSelected = (challanId) => {
    return bulkSelectedChallans.includes(challanId);
  };

  const handleSelectChallan = (challanId) => {
    // Prevent selecting paid challans
    if (detailViewStudent && detailViewStudent.feesHistory) {
      const challan = detailViewStudent.feesHistory.find(c => c.id === challanId);
      if (challan && challan.status === 'paid') {
        return; // Don't allow selecting paid challans
      }
    }
    
    if (isChallanSelected(challanId)) {
      setBulkSelectedChallans(bulkSelectedChallans.filter(id => id !== challanId));
    } else {
      setBulkSelectedChallans([...bulkSelectedChallans, challanId]);
    }
  };

  const areAllChallansSelected = detailViewStudent && 
    detailViewStudent.feesHistory && 
    detailViewStudent.feesHistory.length > 0 &&
    detailViewStudent.feesHistory
      .filter(challan => challan.status !== 'paid')
      .every(challan => isChallanSelected(challan.id));

  const handleSelectAllChallans = () => {
    if (areAllChallansSelected) {
      // Deselect all
      setBulkSelectedChallans([]);
    } else {
      // Select only pending challans
      if (detailViewStudent && detailViewStudent.feesHistory) {
        const pendingChallanIds = detailViewStudent.feesHistory
          .filter(challan => challan.status !== 'paid')
          .map(challan => challan.id);
        setBulkSelectedChallans(pendingChallanIds);
      }
    }
  };

  // Submit bulk generate function
  const submitBulkGenerate = (data) => {
    let studentIds = [];
    
    if (viewMode === 'student') {
      // Student view logic
      if (selectedClass) {
        if (selectedSection) {
          // Generate for specific class and section
          studentIds = filteredStudents
            .filter(student => student.class === selectedClass && student.section === selectedSection)
            .map(student => student.id);
        } else {
          // Generate for specific class only
          studentIds = filteredStudents
            .filter(student => student.class === selectedClass)
            .map(student => student.id);
        }
      } else {
        // If no class filter is selected, generate for all filtered students
        studentIds = filteredStudents.map(student => student.id);
      }
    } else {
      // Family view logic - generate for all students in filtered families
      studentIds = filteredStudents.map(student => student.id);
    }
    
    if (studentIds.length > 0) {
      dispatch(bulkGenerateChallans({ 
        studentIds, 
        challanTemplate: {
          month: data.month,
          amount: data.amount,
          dueDate: data.dueDate,
          description: data.description
        }
      }));
      setShowBulkGenerateModal(false);
      // Reset bulk generate options
      setBulkGenerateOptions({
        generateFor: 'all',
        selectedClass: '',
        selectedSection: ''
      });
    } else {
      alert('No students found for the selected criteria.');
    }
  };

  // Submit bulk update function
  const submitBulkUpdate = (data) => {
    // Filter out any paid challans from the selection
    const pendingChallanIds = bulkSelectedChallans.filter(challanId => {
      if (detailViewStudent && detailViewStudent.feesHistory) {
        const challan = detailViewStudent.feesHistory.find(c => c.id === challanId);
        return challan && challan.status !== 'paid';
      }
      return false;
    });
    
    if (pendingChallanIds.length === 0) {
      alert('No pending challans selected for update.');
      return;
    }
    
    const challanUpdates = pendingChallanIds.map(challanId => ({
      challanId,
      status: 'paid',
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate || new Date().toISOString().split('T')[0]
    }));
    
    dispatch(bulkUpdateChallanStatuses({ challanUpdates }));
    setBulkSelectedChallans([]);
    setShowBulkUpdateModal(false);
  };

  // Payment submission function
  const submitPayment = (data) => {
    if (!data.challanId || !data.paymentMethod) {
      alert('Please provide all required payment information.');
      return;
    }
    
    dispatch(payFees({
      challanId: data.challanId,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate || new Date().toISOString().split('T')[0] // Default to today if not provided
    }));
    
    // Show success message after a short delay to allow state update
    setTimeout(() => {
      if (!loading && !error) {
        alert('Payment processed successfully!');
      }
    }, 100);
    
    setShowPaymentModal(false);
  };

  const handleGenerateChallan = () => {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 7);
    
    setChallanData({
      studentId: '',
      month: currentMonth,
      amount: '',
      dueDate: dueDate.toISOString().split('T')[0],
      description: ''
    });
    setShowGenerateModal(true);
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setChallanData(prev => ({
      ...prev,
      studentId: studentId
    }));
    
    if (studentId) {
      const student = students.find(s => s.id === studentId);
      if (student) {
        setChallanData(prev => ({
          ...prev,
          studentId: studentId,
          amount: student.monthlyFees || ''
        }));
      }
    }
  };

  // Export to CSV function
  const exportToCSV = (data, filename) => {
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(item => Object.values(item).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export students to CSV
  const exportStudentsToCSV = () => {
    const csvData = filteredStudents.map(student => ({
      name: `${student.firstName} ${student.lastName}`,
      class: student.class,
      section: student.section,
      email: student.email,
      phone: student.phone,
      totalChallans: student.totalChallans,
      paidChallans: student.paidChallans,
      pendingChallans: student.pendingChallans,
      totalAmount: student.totalAmount,
      paidAmount: student.paidAmount,
      pendingAmount: student.pendingAmount,
      completionRate: `${student.completionRate}%`
    }));
    
    exportToCSV(csvData, 'students_fees_summary.csv');
  };

  const handleViewDetails = (student) => {
    setDetailViewStudent(student);
    setShowStudentDetails(true);
  };

  const handleClosePrintView = () => {
    setShowPrintView(false);
    setPrintChallan(null);
    setPrintStudent(null);
  };

  const handleCloseBulkPrintView = () => {
    setShowBulkPrintView(false);
    setBulkPrintChallans([]);
  };

  // Function to handle challan printing
  const handlePrintChallan = async (challan, student) => {
    setPrintChallan(challan);
    setPrintStudent(student);
    setShowPrintView(true);
  };

  // Function to handle bulk challan printing
  const handleBulkPrintChallans = () => {
    // Get all pending challans from filtered students
    const allPendingChallans = [];
    
    filteredStudents.forEach(student => {
      if (student.feesHistory) {
        student.feesHistory
          .filter(challan => challan.status !== 'paid')
          .forEach(challan => {
            allPendingChallans.push({
              ...challan,
              studentId: student.id
            });
          });
      }
    });
    
    if (allPendingChallans.length > 0) {
      setBulkPrintChallans(allPendingChallans);
      setShowBulkPrintView(true);
    } else {
      alert('No pending challans found to print.');
    }
  };

  // Function to actually print the challan
  const handlePrintAction = async () => {
    if (printChallan && printStudent) {
      try {
        // Create a simplified, print-optimized HTML version
        const printContent = `
          <div style="width: 80mm; font-family: Arial, Helvetica, sans-serif; font-size: 12px; padding: 10px;">
            <!-- School Header -->
            <div style="text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 10px;">
              <h1 style="font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">School Management System</h1>
              <p style="font-size: 10px; margin: 0 0 2px 0;">123 Education Street, Learning City</p>
              <p style="font-size: 10px; margin: 0;">Phone: +1 (555) 123-4567</p>
            </div>

            <!-- Challan Header -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <div>
                <h2 style="font-size: 14px; font-weight: bold; margin: 0 0 3px 0;">Fee Challan</h2>
                <p style="font-size: 10px; margin: 0;">ID: ${printChallan.id}</p>
              </div>
              <div style="background: ${printChallan.status === 'paid' ? '#d1fae5' : '#fef3c7'}; 
                          color: ${printChallan.status === 'paid' ? '#065f46' : '#92400e'}; 
                          padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">
                ${printChallan.status === 'paid' ? 'PAID' : 'PENDING'}
              </div>
            </div>

            <!-- Student Information -->
            <div style="margin-bottom: 10px;">
              <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">Student Information</h3>
              <div style="background: #f9fafb; padding: 8px; border-radius: 4px;">
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2px; font-size: 10px;">
                  <span style="font-weight: bold;">Name:</span>
                  <span>${printStudent.firstName} ${printStudent.lastName}</span>
                  
                  <span style="font-weight: bold;">Class:</span>
                  <span>${printStudent.class} - Section ${printStudent.section}</span>
                  
                  <span style="font-weight: bold;">Month:</span>
                  <span>${printChallan.month}</span>
                </div>
              </div>
            </div>

            <!-- Fee Details -->
            <div style="margin-bottom: 10px;">
              <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">Fee Details</h3>
              <div style="width: 100%; border-collapse: collapse; margin-bottom: 5px;">
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2px; padding: 4px; background: #f9fafb; border-bottom: 1px solid #ccc; font-size: 10px; font-weight: bold;">
                  <span>Description</span>
                  <span style="text-align: right;">Amount</span>
                </div>
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2px; padding: 4px; font-size: 10px;">
                  <span>Monthly Tuition Fee</span>
                  <span style="text-align: right;">Rs ${Math.round(printChallan.amount)}</span>
                </div>
                ${printChallan.description ? `
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2px; padding: 4px; font-size: 10px;">
                  <span>${printChallan.description}</span>
                  <span style="text-align: right;">Rs 0</span>
                </div>
                ` : ''}
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2px; padding: 4px; font-size: 10px; font-weight: bold; border-top: 1px solid #ccc;">
                  <span>Total Amount</span>
                  <span style="text-align: right;">Rs ${Math.round(printChallan.amount)}</span>
                </div>
              </div>
            </div>

            <!-- Dates -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 10px;">
              <div>
                <h4 style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Issue Date</h4>
                <div style="background: #f9fafb; padding: 6px; border-radius: 4px; border: 1px solid #ccc; font-size: 10px;">
                  ${new Date(printChallan.date || new Date()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <h4 style="font-size: 10px; font-weight: bold; margin: 0 0 3px 0;">Due Date</h4>
                <div style="background: #f9fafb; padding: 6px; border-radius: 4px; border: 1px solid #ccc; font-size: 10px;">
                  ${new Date(printChallan.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <!-- Payment Information -->
            ${printChallan.status === 'paid' && printChallan.paymentMethod ? `
            <div style="margin-bottom: 10px;">
              <h3 style="font-size: 12px; font-weight: bold; margin: 0 0 5px 0;">Payment Information</h3>
              <div style="background: #d1fae5; padding: 8px; border-radius: 4px; border: 1px solid #10b981; font-size: 10px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 2px;">
                  <div style="font-weight: bold;">Payment Method:</div>
                  <div style="text-transform: capitalize;">${printChallan.paymentMethod}</div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px;">
                  <div style="font-weight: bold;">Payment Date:</div>
                  <div>${new Date(printChallan.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</div>
                </div>
              </div>
            </div>
            ` : ''}

            <!-- Footer -->
            <div style="text-align: center; font-size: 10px; color: #6b7280; padding-top: 8px; border-top: 1px solid #ccc;">
              ${printChallan.status === 'paid' ? 
                '<p>Thank you for your payment.</p>' : 
                '<p>Please pay by the due date.</p>'}
              <p style="margin-top: 3px;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Challan Print</title>
              <style>
                @media print {
                  @page {
                    size: 80mm auto;
                    margin: 0;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 12px;
                    width: 80mm;
                  }
                }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      } catch (error) {
        console.error('Error printing challan:', error);
      }
    }
  };

  // Function to download the challan as PDF
  const handleDownloadAction = async () => {
    if (printChallan && printStudent) {
      try {
        const filename = `challan_${printStudent.firstName}_${printStudent.lastName}_${printChallan.month.replace(/\s+/g, '_')}.pdf`;
        const success = await printChallanAsPDF(printChallan, printStudent, filename);
        if (success) {
          console.log('Challan downloaded successfully');
        } else {
          console.error('Failed to download challan');
        }
      } catch (error) {
        console.error('Error downloading challan:', error);
      }
    }
  };

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

  // If family management view is active, show the FamilyManagement component
  if (showFamilyManagement) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Family Management</h1>
          <button
            onClick={() => setShowFamilyManagement(false)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Fees
          </button>
        </div>
        <FamilyManagement />
      </div>
    );
  }

  return (
    <>
      {/* Single Challan Print View */}
      {showPrintView && printChallan && printStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Challan Preview</h3>
              <button 
                onClick={handleClosePrintView}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="py-4 px-6">
              <div className="mb-4 flex justify-center">
                <ChallanPrintView 
                  challan={printChallan} 
                  student={printStudent} 
                  schoolInfo={{
                    name: "School Management System",
                    address: "123 Education Street, Learning City",
                    phone: "+1 (555) 123-4567",
                    email: "info@schoolmanagement.com"
                  }} 
                  onPrint={handlePrintAction}
                  onDownload={handleDownloadAction}
                />
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* Bulk Challan Print View */}
      {showBulkPrintView && bulkPrintChallans.length > 0 && (
        <div className="fixed inset-0 bg-white z-50 p-0 m-0 overflow-hidden">
          <div className="print-container">
            <div className="flex justify-between items-center mb-4 p-4 bg-white border-b print:hidden">
              <h1 className="text-xl font-bold text-gray-900">Bulk Challan Print Preview</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <FaPrint className="mr-2" /> Print All Challans
                </button>
                <button
                  onClick={handleCloseBulkPrintView}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Fees
                </button>
              </div>
            </div>
            <BulkChallanPrintView
              challans={bulkPrintChallans}
              students={students}
              schoolInfo={{
                name: "School Management System",
                address: "123 Education Street, Learning City",
                phone: "+1 (555) 123-4567"
              }}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <ChallanModals
        showGenerateModal={showGenerateModal}
        setShowGenerateModal={setShowGenerateModal}
        challanData={challanData}
        setChallanData={setChallanData}
        students={students}
        handleStudentChange={handleStudentChange}
        submitChallan={submitChallan}
        showBulkGenerateModal={showBulkGenerateModal}
        setShowBulkGenerateModal={setShowBulkGenerateModal}
        submitBulkGenerate={submitBulkGenerate}
        showBulkUpdateModal={showBulkUpdateModal}
        setShowBulkUpdateModal={setShowBulkUpdateModal}
        submitBulkUpdate={submitBulkUpdate}
        bulkSelectedChallans={bulkSelectedChallans}
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        paymentData={paymentData}
        setPaymentData={setPaymentData}
        submitPayment={submitPayment}
        detailViewStudent={detailViewStudent}
      />

      <div className="">
        <FeesHeader 
          onGenerateChallan={handleGenerateChallan}
          onExportCSV={exportStudentsToCSV}
          onBulkPrint={handleBulkPrintChallans}
        />
        
        <FeesStats filteredStudents={filteredStudents} />
        
        <ViewTabs 
          viewMode={viewMode}
          setViewMode={setViewMode}
          setShowFamilyManagement={setShowFamilyManagement}
        />
        
        {/* Student Fees Summary Table */}
        {!showStudentDetails ? (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {viewMode === 'student' ? 'Student Fees Summary' : 'Family Fees Summary'}
            </h3>
            
            <FeesFilters
              viewMode={viewMode}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              uniqueClasses={uniqueClasses}
              classSections={classSections}
              onBulkGenerate={handleBulkGenerate}
              onClearFilters={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setSelectedClass('');
                setSelectedSection('');
              }}
            />
            
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {viewMode === 'student' ? (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challans</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </>
                    ) : (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class/Section</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                {viewMode === 'student' ? (
                  <StudentFeesView 
                    filteredStudents={filteredStudents}
                    onViewDetails={handleViewDetails}
                  />
                ) : (
                  <FamilyFeesView 
                    familyGroups={familyGroups}
                    students={students}
                    onPayFees={handlePayFees}
                    onPrintChallan={handlePrintChallan}
                  />
                )}
              </table>
              {(viewMode === 'student' ? filteredStudents.length === 0 : familyGroups.every(f => f.challans.length === 0)) && (
                <div className="text-center py-12">
                  <FaUser className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No {viewMode === 'student' ? 'students' : 'challans'} found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Student Details View
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {detailViewStudent && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <button
                      onClick={() => setShowStudentDetails(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-4"
                    >
                      <FaEye className="mr-2" /> Back to All Students
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{detailViewStudent.firstName} {detailViewStudent.lastName}</h2>
                      <p className="text-gray-600">{detailViewStudent.class} - {detailViewStudent.section}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-4 text-white">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-400 bg-opacity-30 rounded-full mr-3">
                          <FaDollarSign size={20} />
                        </div>
                        <div>
                          <p className="text-blue-100 text-xs font-medium">Total Amount</p>
                          <p className="text-xl font-bold">Rs {detailViewStudent.totalAmount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-4 text-white">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-400 bg-opacity-30 rounded-full mr-3">
                          <FaCheck size={20} />
                        </div>
                        <div>
                          <p className="text-green-100 text-xs font-medium">Paid</p>
                          <p className="text-xl font-bold">Rs {detailViewStudent.paidAmount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Fee Challans</h3>
                        <p className="text-sm text-gray-500">Manage and track student fee payments</p>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-md font-medium text-gray-900">
                            Challan History ({detailViewStudent.feesHistory ? detailViewStudent.feesHistory.length : 0})
                          </h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSelectAllChallans}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              {areAllChallansSelected ? 'Deselect All' : 'Select All'}
                            </button>
                            <button
                              onClick={handleBulkUpdate}
                              disabled={bulkSelectedChallans.length === 0}
                              className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                bulkSelectedChallans.length === 0 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                              }`}
                            >
                              <FaCheck className="mr-1" /> Mark as Paid ({bulkSelectedChallans.length})
                            </button>
                          </div>
                        </div>
                        
                        {detailViewStudent.feesHistory && detailViewStudent.feesHistory.length > 0 ? (
                          <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                      type="checkbox"
                                      checked={areAllChallansSelected}
                                      onChange={handleSelectAllChallans}
                                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {detailViewStudent.feesHistory
                                  .slice() // Create a copy to avoid mutating the original array
                                  .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending
                                  .map((challan) => (
                                  <tr key={challan.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {challan.status !== 'paid' ? (
                                        <input
                                          type="checkbox"
                                          checked={isChallanSelected(challan.id)}
                                          onChange={() => handleSelectChallan(challan.id)}
                                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                      ) : (
                                        <span className="text-green-500">✓</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {challan.month}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      Rs {challan.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {new Date(challan.dueDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        challan.status === 'paid' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {challan.status === 'paid' ? 'Paid' : 'Pending'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          onClick={() => {
                                            const student = students.find(s => s.id === detailViewStudent.id);
                                            if (student) {
                                              handlePrintChallan(challan, student);
                                            }
                                          }}
                                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                          <FaPrint className="mr-1" /> Print
                                        </button>
                                        {challan.status !== 'paid' && (
                                          <button
                                            onClick={() => {
                                              setPaymentData({
                                                challanId: challan.id,
                                                paymentMethod: 'cash',
                                                paymentDate: new Date().toISOString().split('T')[0]
                                              });
                                              setShowPaymentModal(true);
                                            }}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                          >
                                            <FaDollarSign className="mr-1" /> Pay
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <FaReceipt className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No challans found</h3>
                            <p className="mt-1 text-sm text-gray-500">This student doesn't have any fee challans yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Student Information</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Student ID</p>
                          <p className="text-sm font-medium">{detailViewStudent.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium">{detailViewStudent.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium">{detailViewStudent.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Address</p>
                          <p className="text-sm font-medium">{detailViewStudent.address}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date of Birth</p>
                          <p className="text-sm font-medium">
                            {detailViewStudent.dateOfBirth 
                              ? new Date(detailViewStudent.dateOfBirth).toLocaleDateString() 
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Fee Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Total Challans</span>
                          <span className="text-sm font-medium">{detailViewStudent.totalChallans}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Paid Challans</span>
                          <span className="text-sm font-medium text-green-600">{detailViewStudent.paidChallans}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Pending Challans</span>
                          <span className="text-sm font-medium text-yellow-600">{detailViewStudent.pendingChallans}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Completion Rate</span>
                          <span className="text-sm font-medium">{detailViewStudent.completionRate}%</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Admission Paid</span>
                            <span className={`text-sm font-medium ${
                              detailViewStudent.admissionPaid ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {detailViewStudent.admissionPaid ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default FeesSection;