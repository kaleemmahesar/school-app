import React from 'react';
import { FaUser, FaCheck, FaTimes } from 'react-icons/fa';

const FeesStats = ({ filteredStudents }) => {
  return (
    <div className="my-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium">Total Students</p>
              <p className="text-2xl font-bold mt-1">{filteredStudents.length}</p>
            </div>
            <div className="p-2 bg-blue-400 bg-opacity-30 rounded-full">
              <FaUser size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs font-medium">Fully Paid</p>
              <p className="text-2xl font-bold mt-1">{filteredStudents.filter(s => s.completionRate === 100).length}</p>
            </div>
            <div className="p-2 bg-green-400 bg-opacity-30 rounded-full">
              <FaCheck size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs font-medium">Pending</p>
              <p className="text-2xl font-bold mt-1">{filteredStudents.filter(s => s.completionRate < 100).length}</p>
            </div>
            <div className="p-2 bg-red-400 bg-opacity-30 rounded-full">
              <FaTimes size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesStats;