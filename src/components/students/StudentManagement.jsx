import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaUserCheck, FaUserTimes, FaUsers, FaUserPlus } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';
import StudentAvailabilityLists from './StudentAvailabilityLists';
import FamilyStudentsList from './FamilyStudentsList';

const StudentManagement = ({ onAddStudent }) => {
  const { students } = useSelector(state => state.students);
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'unavailable', 'left', 'family'

  // Get statistics for each category
  const getStudentStats = () => {
    // Available students (studying - all fees paid)
    const available = students.filter(student => {
      const totalFees = parseFloat(student.totalFees) || 0;
      const feesPaid = parseFloat(student.feesPaid) || 0;
      return feesPaid >= totalFees;
    });

    // Unavailable students (studying - pending fees)
    const unavailable = students.filter(student => {
      const totalFees = parseFloat(student.totalFees) || 0;
      const feesPaid = parseFloat(student.feesPaid) || 0;
      // Students who are not left but have pending fees
      const isLeft = student.status === 'left' || student.status === 'passed_out' || 
                    (student.class && student.class.includes('Passed'));
      return !isLeft && feesPaid < totalFees;
    });

    // Left students (passed out or left school)
    const left = students.filter(student => {
      const isLeft = student.status === 'left' || student.status === 'passed_out' || 
                    (student.class && student.class.includes('Passed')) || 
                    (student.graduationDate && new Date(student.graduationDate) < new Date());
      return isLeft;
    });

    // Family groups
    const familyGroups = {};
    students.forEach(student => {
      const familyId = student.familyId || `unknown-${student.id}`;
      if (!familyGroups[familyId]) {
        familyGroups[familyId] = [];
      }
      familyGroups[familyId].push(student);
    });
    const familyCount = Object.keys(familyGroups).length;

    return {
      available: available.length,
      unavailable: unavailable.length,
      left: left.length,
      families: familyCount
    };
  };

  const stats = getStudentStats();

  return (
    <>
      <PageHeader
        title="Student Management"
        subtitle="Manage and view students by availability and family relationships"
        actionButton={
          <button
            onClick={onAddStudent}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaUserPlus className="mr-2 h-4 w-4" />
            Add Student
          </button>
        }
      />

      {/* Tabs for different views */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap space-x-6">
            <button
              onClick={() => setActiveTab('available')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'available'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaUserCheck className="mr-2" />
                Available
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {stats.available}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('unavailable')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'unavailable'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaUserTimes className="mr-2" />
                Unavailable
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {stats.unavailable}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('left')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'left'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaUserTimes className="mr-2" />
                Left
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {stats.left}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('family')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'family'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FaUsers className="mr-2" />
                Families
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {stats.families}
                </span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      <div>
        {activeTab === 'available' || activeTab === 'unavailable' || activeTab === 'left' ? (
          <StudentAvailabilityLists activeTab={activeTab} />
        ) : (
          <FamilyStudentsList />
        )}
      </div>
    </>
  );
};

export default StudentManagement;