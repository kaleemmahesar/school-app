// Mock API functions for attendance operations

// Mock data
let mockAttendanceRecords = [
  {
    id: '1',
    date: '2025-10-01',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'present' },
      { studentId: '4', status: 'absent' },
    ]
  },
  {
    id: '2',
    date: '2025-10-02',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'present' },
      { studentId: '4', status: 'present' },
    ]
  },
  {
    id: '3',
    date: '2025-10-01',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'present' },
      { studentId: '5', status: 'late' },
    ]
  },
  {
    id: '4',
    date: '2025-10-02',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'present' },
      { studentId: '5', status: 'present' },
    ]
  },
  {
    id: '5',
    date: '2025-10-01',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'absent' },
      { studentId: '6', status: 'present' },
    ]
  },
  {
    id: '6',
    date: '2025-10-02',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'present' },
      { studentId: '6', status: 'present' },
    ]
  },
  {
    id: '7',
    date: '2025-10-01',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'late' },
      { studentId: '8', status: 'present' },
    ]
  },
  {
    id: '8',
    date: '2025-10-02',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'present' },
      { studentId: '8', status: 'present' },
    ]
  },
  {
    id: '9',
    date: '2025-10-01',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'present' },
      { studentId: '4', status: 'present' },
    ]
  },
  {
    id: '10',
    date: '2025-10-05',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'late' },
      { studentId: '4', status: 'present' },
    ]
  },
  {
    id: '11',
    date: '2025-10-10',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'present' },
      { studentId: '4', status: 'absent' },
    ]
  },
  {
    id: '12',
    date: '2023-09-15',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'present' },
      { studentId: '4', status: 'present' },
    ]
  },
  {
    id: '13',
    date: '2023-09-20',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'present' },
      { studentId: '4', status: 'present' },
    ]
  },
  {
    id: '14',
    date: '2023-09-25',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'late' },
      { studentId: '4', status: 'present' },
    ]
  },
  {
    id: '15',
    date: '2023-09-02',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'present' },
      { studentId: '5', status: 'present' },
    ]
  },
  {
    id: '16',
    date: '2023-09-07',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'absent' },
      { studentId: '5', status: 'present' },
    ]
  },
  {
    id: '17',
    date: '2023-09-12',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'present' },
      { studentId: '5', status: 'late' },
    ]
  },
  {
    id: '18',
    date: '2023-09-17',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'present' },
      { studentId: '5', status: 'present' },
    ]
  },
  {
    id: '19',
    date: '2023-09-22',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'present' },
      { studentId: '5', status: 'present' },
    ]
  },
  {
    id: '20',
    date: '2023-09-27',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'late' },
      { studentId: '5', status: 'present' },
    ]
  },
  {
    id: '21',
    date: '2023-09-03',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'present' },
      { studentId: '6', status: 'present' },
    ]
  },
  {
    id: '22',
    date: '2023-09-08',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'present' },
      { studentId: '6', status: 'absent' },
    ]
  },
  {
    id: '23',
    date: '2023-09-13',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'late' },
      { studentId: '6', status: 'present' },
    ]
  },
  {
    id: '24',
    date: '2023-09-18',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'present' },
      { studentId: '6', status: 'present' },
    ]
  },
  {
    id: '25',
    date: '2023-09-23',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'present' },
      { studentId: '6', status: 'present' },
    ]
  },
  {
    id: '26',
    date: '2023-09-28',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'present' },
      { studentId: '6', status: 'late' },
    ]
  },
  {
    id: '27',
    date: '2023-09-04',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'present' },
      { studentId: '8', status: 'present' },
    ]
  },
  {
    id: '28',
    date: '2023-09-09',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'present' },
      { studentId: '8', status: 'absent' },
    ]
  },
  {
    id: '29',
    date: '2023-09-14',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'late' },
      { studentId: '8', status: 'present' },
    ]
  },
  {
    id: '30',
    date: '2023-09-19',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'present' },
      { studentId: '8', status: 'present' },
    ]
  },
  {
    id: '31',
    date: '2023-09-24',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'present' },
      { studentId: '8', status: 'present' },
    ]
  },
  {
    id: '32',
    date: '2023-09-29',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'present' },
      { studentId: '8', status: 'late' },
    ]
  },
  {
    id: '33',
    date: '2023-11-01',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'present' },
      { studentId: '4', status: 'present' },
    ]
  },
  {
    id: '34',
    date: '2023-11-05',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'present' },
      { studentId: '4', status: 'late' },
    ]
  },
  {
    id: '35',
    date: '2023-11-10',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'present' },
      { studentId: '4', status: 'present' },
    ]
  },
  {
    id: '36',
    date: '2023-11-15',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'absent' },
      { studentId: '4', status: 'present' },
    ]
  },
  {
    id: '37',
    date: '2023-11-20',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'present' },
      { studentId: '4', status: 'present' },
    ]
  },
  {
    id: '38',
    date: '2023-11-25',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'present' },
      { studentId: '4', status: 'present' },
    ]
  },
  {
    id: '39',
    date: '2023-11-02',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'present' },
      { studentId: '5', status: 'present' },
    ]
  },
  {
    id: '40',
    date: '2023-11-07',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'present' },
      { studentId: '5', status: 'absent' },
    ]
  },
  {
    id: '41',
    date: '2023-11-12',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'late' },
      { studentId: '5', status: 'present' },
    ]
  },
  {
    id: '42',
    date: '2023-11-17',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'present' },
      { studentId: '5', status: 'present' },
    ]
  },
  {
    id: '43',
    date: '2023-11-22',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'present' },
      { studentId: '5', status: 'present' },
    ]
  },
  {
    id: '44',
    date: '2023-11-27',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'present' },
      { studentId: '5', status: 'late' },
    ]
  },
  {
    id: '45',
    date: '2023-11-03',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'present' },
      { studentId: '6', status: 'present' },
    ]
  },
  {
    id: '46',
    date: '2023-11-08',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'present' },
      { studentId: '6', status: 'present' },
    ]
  },
  {
    id: '47',
    date: '2023-11-13',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'absent' },
      { studentId: '6', status: 'present' },
    ]
  },
  {
    id: '48',
    date: '2023-11-18',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'present' },
      { studentId: '6', status: 'present' },
    ]
  },
  {
    id: '49',
    date: '2023-11-23',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'present' },
      { studentId: '6', status: 'late' },
    ]
  },
  {
    id: '50',
    date: '2023-11-28',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'present' },
      { studentId: '6', status: 'present' },
    ]
  },
  {
    id: '51',
    date: '2023-11-04',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'present' },
      { studentId: '8', status: 'present' },
    ]
  },
  {
    id: '52',
    date: '2023-11-09',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'present' },
      { studentId: '8', status: 'present' },
    ]
  },
  {
    id: '53',
    date: '2023-11-14',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'absent' },
      { studentId: '8', status: 'present' },
    ]
  },
  {
    id: '54',
    date: '2023-11-19',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'present' },
      { studentId: '8', status: 'late' },
    ]
  },
  {
    id: '55',
    date: '2023-11-24',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'present' },
      { studentId: '8', status: 'present' },
    ]
  },
  {
    id: '56',
    date: '2023-11-29',
    classId: 'Class 7',
    records: [
      { studentId: '7', status: 'present' },
      { studentId: '8', status: 'present' },
    ]
  },
  {
    id: '57',
    date: '2025-10-01',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'present' },
      { studentId: '4', status: 'present' },
      { studentId: '21', status: 'present' },
      { studentId: '24', status: 'absent' },
    ]
  },
  {
    id: '58',
    date: '2025-10-02',
    classId: 'Class 10',
    records: [
      { studentId: '1', status: 'present' },
      { studentId: '4', status: 'present' },
      { studentId: '21', status: 'present' },
      { studentId: '24', status: 'present' },
    ]
  },
  {
    id: '59',
    date: '2025-10-01',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'present' },
      { studentId: '5', status: 'late' },
      { studentId: '22', status: 'present' },
      { studentId: '25', status: 'present' },
    ]
  },
  {
    id: '60',
    date: '2025-10-02',
    classId: 'Class 9',
    records: [
      { studentId: '2', status: 'present' },
      { studentId: '5', status: 'present' },
      { studentId: '22', status: 'present' },
      { studentId: '25', status: 'present' },
    ]
  },
  {
    id: '61',
    date: '2025-10-01',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'present' },
      { studentId: '6', status: 'present' },
      { studentId: '23', status: 'present' },
    ]
  },
  {
    id: '62',
    date: '2025-10-02',
    classId: 'Class 8',
    records: [
      { studentId: '3', status: 'present' },
      { studentId: '6', status: 'present' },
      { studentId: '23', status: 'present' },
    ]
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch all attendance records
export const fetchAttendanceRecords = async () => {
  await delay(500);
  return mockAttendanceRecords;
};

// Add a new attendance record
export const addAttendanceRecord = async (attendanceData) => {
  await delay(500);
  const newRecord = {
    id: Date.now().toString(),
    ...attendanceData
  };
  mockAttendanceRecords.push(newRecord);
  return newRecord;
};

// Update an existing attendance record
export const updateAttendanceRecord = async (attendanceData) => {
  await delay(500);
  const index = mockAttendanceRecords.findIndex(record => record.id === attendanceData.id);
  if (index !== -1) {
    mockAttendanceRecords[index] = { ...mockAttendanceRecords[index], ...attendanceData };
    return mockAttendanceRecords[index];
  }
  // If record doesn't exist, create a new one
  const newRecord = {
    id: Date.now().toString(),
    ...attendanceData
  };
  mockAttendanceRecords.push(newRecord);
  return newRecord;
};

// Get attendance records by date and class
export const getAttendanceByDateAndClass = async (date, classId) => {
  await delay(500);
  return mockAttendanceRecords.filter(record => 
    record.date === date && record.classId === classId
  );
};

// Get attendance records by student
export const getAttendanceByStudent = async (studentId) => {
  await delay(500);
  return mockAttendanceRecords.filter(record => 
    record.records.some(r => r.studentId === studentId)
  );
};

// Generate attendance report
export const generateAttendanceReport = async (startDate, endDate, classId) => {
  await delay(500);
  const filteredRecords = mockAttendanceRecords.filter(record => 
    record.date >= startDate && record.date <= endDate && 
    (classId ? record.classId === classId : true)
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
    record.records.forEach(studentRecord => {
      switch (studentRecord.status) {
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