import React from 'react';
import { FaEye } from 'react-icons/fa';

const StudentFeesView = ({ filteredStudents, onViewDetails }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {filteredStudents.map((student) => (
        <tr key={student.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {student.firstName} {student.lastName}
                </div>
                <div className="text-sm text-gray-500">ID: {student.id}</div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{student.class}</div>
            <div className="text-sm text-gray-500">Section {student.section}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{student.paidChallans}/{student.totalChallans}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">Rs {Math.round(student.paidAmount)}/{Math.round(student.totalAmount)}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${student.completionRate}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">{student.completionRate}%</span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              onClick={() => onViewDetails(student)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <FaEye className="mr-1" /> View Details
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default StudentFeesView;