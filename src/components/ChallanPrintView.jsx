import React from 'react';
import { FaSchool, FaCalendar, FaDollarSign, FaUser, FaIdCard, FaPrint, FaDownload } from 'react-icons/fa';

const ChallanPrintView = ({ challan, student, schoolInfo, onPrint, onDownload }) => {
  // Add default values for safety
  const safeChallan = challan || {};
  const safeStudent = student || {};
  const safeSchoolInfo = schoolInfo || {
    name: "School Management System",
    address: "123 Education Street, Learning City",
    phone: "+1 (555) 123-4567"
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getPaymentStatus = () => {
    const status = safeChallan.status || 'pending';
    if (status === 'paid') {
      return (
        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
          PAID
        </div>
      );
    }
    return (
      <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
        PENDING
      </div>
    );
  };

  return (
    <div className="w-full mx-auto bg-white font-sans">
      {/* School Header */}
      <div className="text-center border-b border-gray-300 pb-2 mb-3">
        <div className="flex items-center justify-center mb-1">
          <FaSchool className="text-blue-600 text-lg mr-2" />
          <h1 className="text-lg font-bold text-gray-800">{safeSchoolInfo.name}</h1>
        </div>
        <p className="text-gray-600 text-xs mb-1">{safeSchoolInfo.address}</p>
        <p className="text-gray-600 text-xs">Phone: {safeSchoolInfo.phone}</p>
      </div>

      {/* Challan Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-800">Fee Challan</h2>
          <p className="text-gray-600 text-xs">ID: {safeChallan.id || 'N/A'}</p>
        </div>
        {getPaymentStatus()}
      </div>

      {/* Student Information */}
      <div className="mb-3">
        <h3 className="font-bold text-gray-800 mb-2 text-xs flex items-center">
          <FaUser className="mr-2 text-blue-600 text-xs" /> Student Information
        </h3>
        <div className="bg-gray-50 p-2 rounded">
          <div className="grid grid-cols-3 gap-1 text-xs">
            <span className="font-medium col-span-1">Name:</span>
            <span className="col-span-2">{safeStudent.firstName || ''} {safeStudent.lastName || ''}</span>
            
            <span className="font-medium col-span-1">Class:</span>
            <span className="col-span-2">{safeStudent.class || 'N/A'} - Section {safeStudent.section || 'N/A'}</span>
            
            <span className="font-medium col-span-1">Month:</span>
            <span className="col-span-2">{safeChallan.month || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Fee Details */}
      <div className="mb-3">
        <h3 className="font-bold text-gray-800 mb-2 text-xs">Fee Details</h3>
        <div className="border rounded">
          <div className="flex justify-between p-2 bg-gray-50 border-b text-xs">
            <span className="font-medium">Description</span>
            <span className="font-medium">Amount</span>
          </div>
          <div className="p-2 text-xs">
            <div className="flex justify-between mb-1">
              <span>Monthly Tuition Fee</span>
              <span>Rs {Math.round(safeChallan.amount) || '0'}</span>
            </div>
            {safeChallan.description && (
              <div className="flex justify-between mb-1">
                <span>{safeChallan.description}</span>
                <span>Rs 0</span>
              </div>
            )}
            <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 font-bold">
              <span>Total Amount</span>
              <span>Rs {Math.round(safeChallan.amount) || '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-1">Issue Date</h4>
          <div className="bg-gray-50 p-2 rounded border text-xs">
            {formatDate(safeChallan.date || new Date())}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-1">Due Date</h4>
          <div className="bg-gray-50 p-2 rounded border text-xs">
            {formatDate(safeChallan.dueDate)}
          </div>
        </div>
      </div>

      {/* Payment Information */}
      {safeChallan.status === 'paid' && safeChallan.paymentMethod && (
        <div className="mb-3">
          <h3 className="font-bold text-gray-800 mb-2 text-xs">Payment Information</h3>
          <div className="bg-green-50 p-2 rounded border border-green-200 text-xs">
            <div className="grid grid-cols-2 gap-1 mb-1">
              <div className="font-medium">Payment Method:</div>
              <div className="capitalize">{safeChallan.paymentMethod}</div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="font-medium">Payment Date:</div>
              <div>{formatDate(safeChallan.date)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Only show when not printing */}
      <div className="flex justify-center space-x-3 mt-4 mb-3 print:hidden">
        <button
          onClick={onPrint}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
        >
          <FaPrint className="mr-2" /> Print
        </button>
        <button
          onClick={onDownload}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
        >
          <FaDownload className="mr-2" /> Save PDF
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
        {safeChallan.status === 'paid' ? (
          <p>Thank you for your payment.</p>
        ) : (
          <p>Please pay by the due date.</p>
        )}
        <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default ChallanPrintView;