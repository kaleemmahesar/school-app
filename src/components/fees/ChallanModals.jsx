import React, { useState } from 'react';
import { FaUser, FaCalendar, FaDollarSign, FaReceipt, FaCheck } from 'react-icons/fa';
import SearchableStudentDropdown from '../common/SearchableStudentDropdown';

const ChallanModals = ({
  showGenerateModal,
  setShowGenerateModal,
  challanData,
  setChallanData,
  students,
  handleStudentChange,
  submitChallan,
  showBulkGenerateModal,
  setShowBulkGenerateModal,
  submitBulkGenerate,
  showBulkUpdateModal,
  setShowBulkUpdateModal,
  submitBulkUpdate,
  bulkSelectedChallans,
  showPaymentModal,
  setShowPaymentModal,
  paymentData,
  setPaymentData,
  submitPayment,
  detailViewStudent
}) => {
  // Get student's monthly fees when student is selected
  const getStudentMonthlyFees = (studentId) => {
    if (!studentId) return 0;
    const student = students.find(s => s.id === studentId);
    return student ? student.monthlyFees || 0 : 0;
  };

  // Update amount when student changes
  const handleStudentChangeWithFees = (studentId) => {
    const monthlyFees = getStudentMonthlyFees(studentId);
    setChallanData({
      ...challanData,
      studentId,
      amount: monthlyFees
    });
  };

  // Get class-based fees for bulk generation
  const getClassBasedFees = (className) => {
    // This would typically come from a class configuration or fee structure
    // For now, we'll use a simple mapping based on common class fee structures
    const classFeeMap = {
      'Nursery': 1500,
      'Prep': 1800,
      '1st': 2000,
      '2nd': 2200,
      '3rd': 2400,
      '4th': 2600,
      '5th': 2800,
      '6th': 3000,
      '7th': 3200,
      '8th': 3400,
      '9th': 3600,
      '10th': 3800
    };
    
    return classFeeMap[className] || 2000; // Default to 2000 if class not found
  };

  // State for bulk generation form
  const [bulkGenerateData, setBulkGenerateData] = useState({
    month: new Date().toISOString().slice(0, 7),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: ''
  });

  // Handle bulk generate form changes
  const handleBulkGenerateChange = (field, value) => {
    setBulkGenerateData({
      ...bulkGenerateData,
      [field]: value
    });
  };

  // Submit bulk generate with class-based fees
  const submitBulkGenerateWithClassFees = (e) => {
    e.preventDefault();
    submitBulkGenerate(bulkGenerateData);
  };

  return (
    <>
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Process Payment</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                challanId: paymentData.challanId,
                paymentMethod: formData.get('paymentMethod'),
                paymentDate: formData.get('paymentDate')
              };
              submitPayment(data);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  defaultValue={paymentData.paymentMethod}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  defaultValue={paymentData.paymentDate}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <FaDollarSign className="mr-2" /> Process Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Challan Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Generate New Challan</h3>
            <form onSubmit={submitChallan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <SearchableStudentDropdown
                    students={students}
                    value={challanData.studentId}
                    onChange={handleStudentChangeWithFees}
                    placeholder="Select a student..."
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="month"
                    value={challanData.month}
                    onChange={(e) => setChallanData({...challanData, month: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Monthly Fees)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={challanData.amount}
                    onChange={(e) => setChallanData({...challanData, amount: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                  Auto-filled from student's class monthly fees: Rs {getStudentMonthlyFees(challanData.studentId)}. You can edit this amount if needed.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={challanData.dueDate}
                    onChange={(e) => setChallanData({...challanData, dueDate: e.target.value})}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={challanData.description}
                  onChange={(e) => setChallanData({...challanData, description: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description (optional)"
                  rows="2"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <FaReceipt className="mr-2" /> Generate Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showBulkGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Bulk Generate Challans</h3>
            <form onSubmit={submitBulkGenerateWithClassFees} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input
                  type="month"
                  value={bulkGenerateData.month}
                  onChange={(e) => handleBulkGenerateChange('month', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={bulkGenerateData.dueDate}
                  onChange={(e) => handleBulkGenerateChange('dueDate', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={bulkGenerateData.description}
                  onChange={(e) => handleBulkGenerateChange('description', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description (optional)"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Amounts will be automatically calculated based on each student's class fees structure.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkGenerateModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <FaReceipt className="mr-2" /> Generate Challans
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Bulk Update Challans</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                paymentMethod: formData.get('paymentMethod'),
                paymentDate: formData.get('paymentDate')
              };
              submitBulkUpdate(data);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  name="paymentDate"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkUpdateModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <FaCheck className="mr-2" /> Update {bulkSelectedChallans.length} Challans
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChallanModals;