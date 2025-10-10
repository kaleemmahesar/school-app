import React, { useState } from 'react';
import { FaDollarSign, FaMoneyBillWave } from 'react-icons/fa';

const StaffFinancialModal = ({ staffMember, onClose, onAddAdvance, onPaySalary }) => {
  const [actionType, setActionType] = useState('advance'); // 'advance' or 'salary'
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceReason, setAdvanceReason] = useState('');
  const [salaryMonth, setSalaryMonth] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (actionType === 'advance') {
      if (advanceAmount && advanceReason) {
        onAddAdvance({
          staffId: staffMember.id,
          advanceAmount,
          reason: advanceReason
        });
        onClose();
      }
    } else {
      if (salaryMonth && paymentMethod) {
        onPaySalary({
          staffId: staffMember.id,
          month: salaryMonth,
          paymentMethod
        });
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {actionType === 'advance' ? 'Add Advance' : 'Pay Salary'} - {staffMember.firstName} {staffMember.lastName}
        </h3>
        
        <div className="mb-4">
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              className={`py-2 px-4 text-sm font-medium ${actionType === 'advance' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActionType('advance')}
            >
              <FaMoneyBillWave className="inline mr-2" /> Advance
            </button>
            <button
              type="button"
              className={`py-2 px-4 text-sm font-medium ${actionType === 'salary' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActionType('salary')}
            >
              <FaDollarSign className="inline mr-2" /> Salary
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {actionType === 'advance' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advance Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaDollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={advanceReason}
                  onChange={(e) => setAdvanceReason(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Reason for advance"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Month</label>
                <input
                  type="month"
                  value={salaryMonth}
                  onChange={(e) => setSalaryMonth(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {actionType === 'advance' ? 'Add Advance' : 'Pay Salary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFinancialModal;