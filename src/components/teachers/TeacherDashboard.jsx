import React from 'react';
import { FaChalkboardTeacher, FaUsers, FaClipboardList, FaFileAlt } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const TeacherDashboard = () => {
  // Mock data for teacher's classes
  const teacherClasses = [
    {
      id: 1,
      name: 'Class 10-A',
      studentCount: 35,
      subject: 'Mathematics'
    },
    {
      id: 2,
      name: 'Class 9-B',
      studentCount: 32,
      subject: 'Science'
    }
  ];

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'attendance',
      description: 'Marked attendance for Class 10-A',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'marks',
      description: 'Updated midterm marks for Class 9-B',
      time: '1 day ago'
    },
    {
      id: 3,
      type: 'notes',
      description: 'Added class notes for Mathematics',
      time: '2 days ago'
    }
  ];

  return (
    <div>
      <PageHeader
        title="Teacher Dashboard"
        subtitle="Welcome back! Here's what's happening with your classes today."
      />

      {/* Class Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {teacherClasses.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
                <p className="text-sm text-gray-500">{classItem.subject}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">{classItem.studentCount} students</span>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View Class
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <FaClipboardList className="text-blue-600 text-xl" />
            </div>
            <span className="text-sm font-medium text-gray-900">Take Attendance</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-green-100 p-3 rounded-full mb-2">
              <FaFileAlt className="text-green-600 text-xl" />
            </div>
            <span className="text-sm font-medium text-gray-900">Enter Marks</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-purple-100 p-3 rounded-full mb-2">
              <FaUsers className="text-purple-600 text-xl" />
            </div>
            <span className="text-sm font-medium text-gray-900">View Students</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-yellow-100 p-3 rounded-full mb-2">
              <FaChalkboardTeacher className="text-yellow-600 text-xl" />
            </div>
            <span className="text-sm font-medium text-gray-900">Lesson Plans</span>
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;