import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUsers, FaUser, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import { addStudent, updateStudent } from '../../store/studentsSlice';

const FamilyManagement = () => {
  const dispatch = useDispatch();
  const { students } = useSelector(state => state.students);
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'manage'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showEditFamilyModal, setShowEditFamilyModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [newFamilyData, setNewFamilyData] = useState({
    familyId: '',
    familyName: '',
    headMemberId: ''
  });

  // Group students by family
  const groupStudentsByFamily = () => {
    const familyGroups = {};
    
    students.forEach(student => {
      const familyId = student.familyId || `unknown-${student.id}`;
      
      if (!familyGroups[familyId]) {
        familyGroups[familyId] = {
          familyInfo: student.familyId ? {
            id: student.familyId,
            name: `Family ${student.familyId}`
          } : {
            id: `unknown-${student.id}`,
            name: 'Unknown Family'
          },
          members: []
        };
      }
      
      familyGroups[familyId].members.push(student);
    });
    
    // Enhance family info with head of family
    Object.values(familyGroups).forEach(familyGroup => {
      const familyHead = familyGroup.members.find(member => !member.parentId) || familyGroup.members[0];
      familyGroup.familyInfo.name = `${familyHead.firstName} ${familyHead.lastName} Family`;
      familyGroup.familyInfo.head = familyHead;
    });
    
    return familyGroups;
  };

  const familyGroups = groupStudentsByFamily();

  // Get unique families for dropdown
  const uniqueFamilies = Object.values(familyGroups).map(familyGroup => ({
    id: familyGroup.familyInfo.id,
    name: familyGroup.familyInfo.name,
    memberCount: familyGroup.members.length
  }));

  // Filter families based on search term and selected family
  const filterFamilies = () => {
    const filtered = {};
    
    Object.entries(familyGroups).forEach(([familyId, familyGroup]) => {
      // Filter members based on search
      const filteredMembers = familyGroup.members.filter(student => {
        const matchesSearch = 
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.class.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFamily = !selectedFamily || familyId === selectedFamily;
        
        return matchesSearch && matchesFamily;
      });
      
      // Only include families that have matching members
      if (filteredMembers.length > 0) {
        filtered[familyId] = {
          ...familyGroup,
          members: filteredMembers
        };
      }
    });
    
    return filtered;
  };

  const filteredFamilies = filterFamilies();

  // Handle adding a new family
  const handleAddFamily = (e) => {
    e.preventDefault();
    
    // Generate a unique family ID if not provided
    const familyId = newFamilyData.familyId || `family-${Date.now()}`;
    
    // Find the head member
    const headMember = students.find(s => s.id === newFamilyData.headMemberId);
    
    if (headMember) {
      // Update the head member with the new family ID
      dispatch(updateStudent({
        id: headMember.id,
        updates: {
          familyId: familyId,
          relationship: 'self',
          parentId: null
        }
      }));
      
      // Close modal and reset form
      setShowAddFamilyModal(false);
      setNewFamilyData({
        familyId: '',
        familyName: '',
        headMemberId: ''
      });
    }
  };

  // Handle editing a family
  const handleEditFamily = (family) => {
    setEditingFamily(family);
    setNewFamilyData({
      familyId: family.familyInfo.id,
      familyName: family.familyInfo.name,
      headMemberId: family.familyInfo.head?.id || ''
    });
    setShowEditFamilyModal(true);
  };

  // Handle updating a family
  const handleUpdateFamily = (e) => {
    e.preventDefault();
    
    if (editingFamily && newFamilyData.headMemberId) {
      // Update the head member
      const headMember = students.find(s => s.id === newFamilyData.headMemberId);
      
      if (headMember) {
        dispatch(updateStudent({
          id: headMember.id,
          updates: {
            familyId: newFamilyData.familyId,
            relationship: 'self',
            parentId: null
          }
        }));
        
        // Close modal and reset form
        setShowEditFamilyModal(false);
        setEditingFamily(null);
        setNewFamilyData({
          familyId: '',
          familyName: '',
          headMemberId: ''
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Family Management</h2>
        <button
          onClick={() => setShowAddFamilyModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaPlus className="mr-2 h-4 w-4" />
          Add New Family
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('view')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'view'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaUsers className="mr-2 inline" />
            View Families
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaEdit className="mr-2 inline" />
            Manage Families
          </button>
        </nav>
      </div>

      {activeTab === 'view' ? (
        <>
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by student name, email, or class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-400" />
                  <select
                    value={selectedFamily}
                    onChange={(e) => setSelectedFamily(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Families</option>
                    {uniqueFamilies.map((family) => (
                      <option key={family.id} value={family.id}>{family.name} ({family.memberCount})</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedFamily('');
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Family Groups */}
          <div className="space-y-6">
            {Object.entries(filteredFamilies).length > 0 ? (
              Object.entries(filteredFamilies).map(([familyId, familyGroup]) => (
                <div key={familyId} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaUsers className="text-gray-600 text-lg mr-3" />
                        <h3 className="text-lg font-medium text-gray-900">{familyGroup.familyInfo.name}</h3>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {familyGroup.members.length} {familyGroup.members.length === 1 ? 'Member' : 'Members'}
                      </span>
                    </div>
                    {familyGroup.familyInfo.head && (
                      <p className="text-sm text-gray-500 mt-1">
                        Head: {familyGroup.familyInfo.head.firstName} {familyGroup.familyInfo.head.lastName}
                      </p>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {familyGroup.members.map((student) => (
                        <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex-shrink-0" />
                            <div className="ml-4 flex-1">
                              <div className="flex justify-between">
                                <h4 className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</h4>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {student.relationship || 'Family Member'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">ID: {student.id}</p>
                              <div className="mt-2">
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">Class:</span> {student.class} - Section {student.section}
                                </p>
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">Contact:</span> {student.phone}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No family groups found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaUsers className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">How to Manage Families</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Families in this system are automatically created when students are added with the same Family ID.</p>
                <p className="mt-2">To create a new family:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Click the "Add New Family" button above</li>
                  <li>Enter a unique Family ID (or leave blank to auto-generate)</li>
                  <li>Select a student to be the head of the family</li>
                  <li>Add other family members by editing their records and assigning the same Family ID</li>
                </ol>
                <p className="mt-2">To add a student to an existing family:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Go to the Students section</li>
                  <li>Find the student you want to add to a family</li>
                  <li>Edit their record</li>
                  <li>Enter the Family ID of the family you want to add them to</li>
                  <li>Specify their relationship to the family head (e.g., brother, sister)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Family Modal */}
      {showAddFamilyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Family</h3>
            <form onSubmit={handleAddFamily} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family ID (Optional)</label>
                <input
                  type="text"
                  value={newFamilyData.familyId}
                  onChange={(e) => setNewFamilyData({...newFamilyData, familyId: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave blank to auto-generate"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Family Head</label>
                <select
                  value={newFamilyData.headMemberId}
                  onChange={(e) => setNewFamilyData({...newFamilyData, headMemberId: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} - {student.class} {student.section}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddFamilyModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaPlus className="mr-2" /> Create Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Family Modal */}
      {showEditFamilyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit Family</h3>
            <form onSubmit={handleUpdateFamily} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family ID</label>
                <input
                  type="text"
                  value={newFamilyData.familyId}
                  onChange={(e) => setNewFamilyData({...newFamilyData, familyId: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
                <input
                  type="text"
                  value={newFamilyData.familyName}
                  onChange={(e) => setNewFamilyData({...newFamilyData, familyName: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Family Head</label>
                <select
                  value={newFamilyData.headMemberId}
                  onChange={(e) => setNewFamilyData({...newFamilyData, headMemberId: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} - {student.class} {student.section}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditFamilyModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FaEdit className="mr-2" /> Update Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManagement;