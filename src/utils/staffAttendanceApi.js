// Mock API functions for staff attendance operations

// Mock data
let mockStaffAttendanceRecords = [
  {
    id: '1',
    date: '2025-10-01',
    records: [
      { staffId: '1', status: 'present' },
      { staffId: '2', status: 'absent' },
    ]
  },
  {
    id: '2',
    date: '2025-10-02',
    records: [
      { staffId: '1', status: 'present' },
      { staffId: '2', status: 'present' },
    ]
  },
  {
    id: '3',
    date: '2025-10-01',
    records: [
      { staffId: '3', status: 'present' },
      { staffId: '4', status: 'late' },
    ]
  },
  {
    id: '4',
    date: '2025-10-02',
    records: [
      { staffId: '3', status: 'present' },
      { staffId: '4', status: 'present' },
    ]
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch all staff attendance records
export const fetchStaffAttendanceRecords = async () => {
  await delay(500);
  return mockStaffAttendanceRecords;
};

// Add a new staff attendance record
export const addStaffAttendanceRecord = async (attendanceData) => {
  await delay(500);
  const newRecord = {
    id: Date.now().toString(),
    ...attendanceData
  };
  mockStaffAttendanceRecords.push(newRecord);
  return newRecord;
};

// Update an existing staff attendance record
export const updateStaffAttendanceRecord = async (attendanceData) => {
  await delay(500);
  const index = mockStaffAttendanceRecords.findIndex(record => record.id === attendanceData.id);
  if (index !== -1) {
    mockStaffAttendanceRecords[index] = { ...mockStaffAttendanceRecords[index], ...attendanceData };
    return mockStaffAttendanceRecords[index];
  }
  // If record doesn't exist, create a new one
  const newRecord = {
    id: Date.now().toString(),
    ...attendanceData
  };
  mockStaffAttendanceRecords.push(newRecord);
  return newRecord;
};

// Get staff attendance records by date
export const getStaffAttendanceByDate = async (date) => {
  await delay(500);
  return mockStaffAttendanceRecords.filter(record => record.date === date);
};

// Get staff attendance records by staff member
export const getStaffAttendanceByStaff = async (staffId) => {
  await delay(500);
  return mockStaffAttendanceRecords.filter(record => 
    record.records.some(r => r.staffId === staffId)
  );
};

// Get staff attendance records by date range
export const getStaffAttendanceByDateRange = async (staffId, startDate, endDate) => {
  await delay(500);
  const staffRecords = [];
  
  mockStaffAttendanceRecords.forEach(record => {
    if (record.date >= startDate && record.date <= endDate) {
      const staffRecord = record.records.find(r => r.staffId === staffId);
      if (staffRecord) {
        staffRecords.push({
          date: record.date,
          status: staffRecord.status
        });
      }
    }
  });
  
  return staffRecords;
};

// Generate staff attendance report
export const generateStaffAttendanceReport = async (startDate, endDate, department) => {
  await delay(500);
  const filteredRecords = mockStaffAttendanceRecords.filter(record => 
    record.date >= startDate && record.date <= endDate
  );
  
  // Calculate statistics
  const stats = {
    totalDays: filteredRecords.length,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0
  };
  
  filteredRecords.forEach(record => {
    record.records.forEach(staffRecord => {
      switch (staffRecord.status) {
        case 'present':
          stats.present++;
          break;
        case 'absent':
          stats.absent++;
          break;
        case 'late':
          stats.late++;
          break;
        case 'leave':
          stats.leave++;
          break;
      }
    });
  });
  
  return {
    records: filteredRecords,
    stats
  };
};