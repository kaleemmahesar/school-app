// API functions for attendance operations using fetch

const API_BASE_URL = 'http://localhost:3001';

// Fetch all attendance records
export const fetchAttendanceRecords = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/studentsAttendance`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    throw error;
  }
};

// Save attendance record (either add new or update existing)
export const addAttendanceRecord = async (attendanceData) => {
  try {
    // First, check if a record already exists for this date and class
    const existingResponse = await fetch(`${API_BASE_URL}/studentsAttendance?date=${attendanceData.date}&classId=${attendanceData.classId}`);
    
    if (!existingResponse.ok) {
      throw new Error(`HTTP error! status: ${existingResponse.status}`);
    }
    
    const existingRecords = await existingResponse.json();
    
    if (existingRecords && existingRecords.length > 0) {
      // Update existing record
      const existingRecord = existingRecords[0];
      const updatedData = {
        ...existingRecord,
        records: attendanceData.records
      };
      
      const updateResponse = await fetch(`${API_BASE_URL}/studentsAttendance/${existingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`);
      }
      
      const updatedRecord = await updateResponse.json();
      return updatedRecord;
    } else {
      // Add new record
      const response = await fetch(`${API_BASE_URL}/studentsAttendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newRecord = await response.json();
      return newRecord;
    }
  } catch (error) {
    console.error('Error saving attendance record:', error);
    throw error;
  }
};

// Update an existing attendance record
export const updateAttendanceRecord = async (attendanceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/studentsAttendance/${attendanceData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attendanceData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const updatedRecord = await response.json();
    return updatedRecord;
  } catch (error) {
    console.error('Error updating attendance record:', error);
    throw error;
  }
};

// Get attendance records by date and class
export const getAttendanceByDateAndClass = async (date, classId) => {
  try {
    console.log(`Fetching attendance for date=${date}, classId=${classId}`);
    const response = await fetch(`${API_BASE_URL}/studentsAttendance?date=${date}&classId=${classId}`);
    console.log('API Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching attendance by date and class:', error);
    throw error;
  }
};

// Get attendance records by student
export const getAttendanceByStudent = async (studentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/studentsAttendance`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const allRecords = await response.json();
    
    // Filter records that contain the student
    const studentRecords = allRecords.filter(record => 
      record.records.some(r => r.studentId === studentId)
    );
    
    return studentRecords;
  } catch (error) {
    console.error('Error fetching attendance by student:', error);
    throw error;
  }
};

// Generate attendance report
export const generateAttendanceReport = async (startDate, endDate, classId) => {
  try {
    let url = `${API_BASE_URL}/studentsAttendance?`;
    
    if (startDate && endDate) {
      // For simplicity, we'll fetch all records and filter on client side
      // In a real application, you might want to implement server-side filtering
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    let filteredRecords = await response.json();
    
    // Apply date range filter
    if (startDate && endDate) {
      filteredRecords = filteredRecords.filter(record => 
        record.date >= startDate && record.date <= endDate
      );
    }
    
    // Apply class filter
    if (classId) {
      filteredRecords = filteredRecords.filter(record => 
        record.classId === classId
      );
    }
    
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
  } catch (error) {
    console.error('Error generating attendance report:', error);
    throw error;
  }
};