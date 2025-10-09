import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaHistory, FaSearch, FaFilter, FaSignInAlt, FaSignOutAlt, FaTimesCircle } from 'react-icons/fa';
import PageHeader from '../common/PageHeader';

const LoginHistory = () => {
  const { users } = useSelector(state => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Get all login records from all users
  const getAllLoginRecords = () => {
    const allRecords = [];
    users.forEach(user => {
      if (user.loginHistory) {
        user.loginHistory.forEach(record => {
          allRecords.push({
            ...record,
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          });
        });
      }
    });
    
    // Sort by timestamp descending
    return allRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Filter login records based on search term, user, and date range
  const filteredRecords = getAllLoginRecords().filter(record => {
    const matchesSearch = 
      record.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = !selectedUser || record.userId === selectedUser;
    
    const recordDate = new Date(record.timestamp);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date
    
    const matchesDateRange = recordDate >= startDate && recordDate <= endDate;
    
    return matchesSearch && matchesUser && matchesDateRange;
  });

  // Get unique users for dropdown
  const uniqueUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email
  }));

  // Get login statistics
  const getLoginStatistics = () => {
    const allRecords = getAllLoginRecords();
    const filtered = filteredRecords;
    
    const totalLogins = filtered.length;
    const successfulLogins = filtered.filter(record => record.status === 'success').length;
    const failedLogins = filtered.filter(record => record.status === 'failed').length;
    
    return { totalLogins, successfulLogins, failedLogins };
  };

  const { totalLogins, successfulLogins, failedLogins } = getLoginStatistics();

  return (
    <>
      <PageHeader
        title="Login History"
        subtitle="View user login, logout, and failed attempt records"
        actionButton={null}
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by username, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Login Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Logins</p>
              <p className="text-3xl font-bold mt-1">{totalLogins}</p>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
              <FaHistory size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Successful</p>
              <p className="text-3xl font-bold mt-1">{successfulLogins}</p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
              <FaSignInAlt size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Failed Attempts</p>
              <p className="text-3xl font-bold mt-1">{failedLogins}</p>
            </div>
            <div className="p-3 bg-red-400 bg-opacity-30 rounded-full">
              <FaTimesCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Login History Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Login History ({filteredRecords.length} records)
        </h3>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.username}</div>
                    <div className="text-sm text-gray-500">{record.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status === 'success' ? (
                        <FaSignInAlt className="mr-1" />
                      ) : (
                        <FaTimesCircle className="mr-1" />
                      )}
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No login records found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginHistory;