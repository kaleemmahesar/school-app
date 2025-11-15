import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { createAsyncThunkWithToast, createAddThunk, createUpdateThunk, createDeleteThunk } from '../utils/asyncThunkUtils';
import { API_BASE_URL } from '../utils/apiConfig';

/**
 * Mock data for students with enhanced fees structure and family relationships
 */
const mockStudents = [
  {
    id: '1',
    photo: '',
    grNo: 'GR001',
    firstName: 'Ahmed',
    lastName: 'Khan',
    fatherName: 'Muhammad Khan',
    religion: 'Islam',
    address: '123 Main Street, Karachi, Sindh',
    dateOfBirth: '2005-05-15',
    birthPlace: 'Aga Khan Hospital',
    lastSchoolAttended: 'Karachi Grammar School',
    dateOfAdmission: '2025-11-05',
    class: 'Class 10',
    section: 'A',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: '',
    monthlyFees: 4000,
    admissionFees: 5000,
    feesPaid: 13000,
    totalFees: 9000,
    familyId: 'family-1', // Family identifier for tracing family relationships
    relationship: 'self',
    parentId: null,
    status: 'studying',
    feesHistory: [
      { 
        id: 'challan-1-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: true,
        date: '2025-09-01',
        dueDate: '2025-09-01',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-1-1', 
        month: 'September 2025', 
        amount: 4000, 
        paid: true, 
        date: '2025-09-15',
        dueDate: '2025-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-1-2', 
        month: 'October 2025', 
        amount: 4000, 
        paid: true, 
        date: '2025-11-08',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-1-3', 
        month: 'November 2025', 
        amount: 4000, 
        paid: true, 
        date: '2025-11-15',
        dueDate: '2025-12-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '2',
    photo: '',
    grNo: 'GR002',
    firstName: 'Fatima',
    lastName: 'Ahmed',
    fatherName: 'Ali Ahmed',
    religion: 'Islam',
    address: '456 Oak Avenue, Lahore, Punjab',
    dateOfBirth: '2006-08-22',
    birthPlace: 'Shalamar Hospital',
    lastSchoolAttended: 'Lahore Grammar School',
    dateOfAdmission: '2025-11-05',
    class: 'Class 9',
    section: 'B',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: '',
    monthlyFees: 3500,
    admissionFees: 4500,
    feesPaid: 8000,
    totalFees: 8000,
    familyId: 'family-1',
    relationship: 'sister',
    parentId: '1',
    status: 'studying',
    feesHistory: [
      { 
        id: 'challan-2-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2025-09-05',
        dueDate: '2025-09-05',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-2-1', 
        month: 'September 2025', 
        amount: 3500, 
        paid: false, 
        date: null,
        dueDate: '2025-10-10',
        status: 'pending',
        type: 'monthly'
      },
      { 
        id: 'challan-2-2', 
        month: 'October 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-11-12',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-2-3', 
        month: 'November 2025', 
        amount: 3500, 
        paid: false, 
        date: null,
        dueDate: '2025-12-10',
        status: 'pending',
        type: 'monthly'
      },
    ]
  },
  {
    id: '3',
    photo: '',
    grNo: 'GR003',
    firstName: 'Bilal',
    lastName: 'Malik',
    fatherName: 'Usman Malik',
    religion: 'Islam',
    address: '789 Pine Road, Islamabad, Capital',
    dateOfBirth: '2007-03-10',
    birthPlace: 'Kambar Shahdadkot',
    lastSchoolAttended: 'Islamabad Model School',
    dateOfAdmission: '2025-11-05',
    class: 'Class 8',    section: 'A',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Good student',
    monthlyFees: 3000,
    admissionFees: 4000,
    feesPaid: 7000,
    totalFees: 7000,
    familyId: 'family-2',
    relationship: 'self',
    parentId: null,
    status: 'left',
    leavingDate: '2025-10-15',
    leavingReason: 'Family moved to another city',
    feesHistory: [
      { 
        id: 'challan-3-0',
        month: 'Admission Fees',
        amount: 4000,
        paid: true,
        date: '2025-08-20',
        dueDate: '2025-08-20',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-3-1', 
        month: 'August 2025', 
        amount: 3000, 
        paid: true, 
        date: '2025-08-25',
        dueDate: '2025-09-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-3-2', 
        month: 'September 2025', 
        amount: 3000, 
        paid: true, 
        date: '2025-09-12',
        dueDate: '2025-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-3-3', 
        month: 'October 2025', 
        amount: 3000, 
        paid: false, 
        date: null,
        dueDate: '2025-11-10',
        status: 'pending',
        type: 'monthly'
      },
    ]
  },
  {
    id: '4',
    photo: '',
    grNo: 'GR004',
    firstName: 'Ayesha',
    lastName: 'Raza',
    fatherName: 'Hassan Raza',
    religion: 'Islam',
    address: '101 Maple Drive, Rawalpindi, Punjab',
    dateOfBirth: '2005-12-05',
    birthPlace: 'Benazir Bhutto Hospital',
    lastSchoolAttended: 'Rawalpindi Public School',
    dateOfAdmission: '2025-09-10',
    class: 'Class 10',
    section: 'B',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: '',
    monthlyFees: 4000,
    admissionFees: 5000,
    feesPaid: 9000,
    totalFees: 9000,
    familyId: 'family-3',
    relationship: 'self',
    parentId: null,
    status: 'studying',
    feesHistory: [
      { 
        id: 'challan-4-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: true,
        date: '2025-09-10',
        dueDate: '2025-09-10',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-4-1', 
        month: 'September 2025', 
        amount: 4000, 
        paid: false, 
        date: null,
        dueDate: '2025-10-10',
        status: 'pending',
        type: 'monthly'
      },
      { 
        id: 'challan-4-2', 
        month: 'October 2025', 
        amount: 4000, 
        paid: true, 
        date: '2025-11-05',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-4-3', 
        month: 'November 2025', 
        amount: 4000, 
        paid: false, 
        date: null,
        dueDate: '2025-12-10',
        status: 'pending',
        type: 'monthly'
      },
    ]
  },
  {
    id: '5',
    photo: '',
    grNo: 'GR005',
    firstName: 'Omar',
    lastName: 'Sheikh',
    fatherName: 'Farid Sheikh',
    religion: 'Islam',
    address: '202 Elm Street, Peshawar, KPK',
    dateOfBirth: '2006-07-18',
    birthPlace: 'Lady Reading Hospital',
    lastSchoolAttended: 'Peshawar Model School',
    dateOfAdmission: '2025-08-15',
    class: 'Class 9',
    section: 'A',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Needs extra attention',
    monthlyFees: 3500,
    admissionFees: 4500,
    feesPaid: 11500,
    totalFees: 8000,
    familyId: 'family-4',
    relationship: 'self',
    parentId: null,
    status: 'studying',
    feesHistory: [
      { 
        id: 'challan-5-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2025-08-15',
        dueDate: '2025-08-15',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-5-1', 
        month: 'August 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-08-20',
        dueDate: '2025-09-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-5-2', 
        month: 'September 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-09-18',
        dueDate: '2025-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-5-3', 
        month: 'October 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-11-07',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-5-4', 
        month: 'November 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-11-18',
        dueDate: '2025-12-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '6',
    photo: '',
    grNo: 'GR006',
    firstName: 'Zainab',
    lastName: 'Hussain',
    fatherName: 'Tariq Hussain',
    religion: 'Islam',
    address: '303 Cedar Lane, Quetta, Balochistan',
    dateOfBirth: '2007-01-25',
    birthPlace: 'Civil Hospital Quetta',
    lastSchoolAttended: 'Quetta Public School',
    dateOfAdmission: '2025-10-05',
    class: 'Class 8',
    section: 'B',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: '',
    monthlyFees: 3000,
    admissionFees: 4500,
    feesPaid: 7500,
    totalFees: 7500,
    familyId: 'family-5',
    relationship: 'self',
    parentId: null,
    status: 'studying',
    feesHistory: [
      { 
        id: 'challan-6-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2025-10-05',
        dueDate: '2025-10-05',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-6-1', 
        month: 'October 2025', 
        amount: 3000, 
        paid: true, 
        date: '2025-10-15',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '7',
    photo: '',
    grNo: 'GR007',
    firstName: 'Hassan',
    lastName: 'Qureshi',
    fatherName: 'Imran Qureshi',
    religion: 'Islam',
    address: '404 Birch Boulevard, Multan, Punjab',
    dateOfBirth: '2005-04-30',
    birthPlace: 'Nishtar Hospital',
    lastSchoolAttended: 'Multan Public School',
    dateOfAdmission: '2025-08-01',
    class: 'Class 10',
    section: 'A',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Excellent performance',
    monthlyFees: 4000,
    admissionFees: 5000,
    feesPaid: 9000,
    totalFees: 9000,
    familyId: 'family-6',
    relationship: 'self',
    parentId: null,
    status: 'studying',
    feesHistory: [
      { 
        id: 'challan-7-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: true,
        date: '2025-08-01',
        dueDate: '2025-08-01',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-7-1', 
        month: 'August 2025', 
        amount: 4000, 
        paid: true, 
        date: '2025-08-08',
        dueDate: '2025-09-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-7-2', 
        month: 'September 2025', 
        amount: 4000, 
        paid: true, 
        date: '2025-09-12',
        dueDate: '2025-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-7-3', 
        month: 'October 2025', 
        amount: 4000, 
        paid: true, 
        date: '2025-11-09',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '8',
    photo: '',
    grNo: 'GR008',
    firstName: 'Mariam',
    lastName: 'Butt',
    fatherName: 'Asif Butt',
    religion: 'Islam',
    address: '505 Spruce Court, Faisalabad, Punjab',
    dateOfBirth: '2006-11-12',
    birthPlace: 'Allied Hospital',
    lastSchoolAttended: 'Faisalabad Public School',
    dateOfAdmission: '2025-09-20',
    class: 'Class 9',
    section: 'B',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: '',
    monthlyFees: 3500,
    admissionFees: 4500,
    feesPaid: 4500,
    totalFees: 8000,
    familyId: 'family-7',
    relationship: 'self',
    parentId: null,
    status: 'studying',
    feesHistory: [
      { 
        id: 'challan-8-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2025-09-20',
        dueDate: '2025-09-20',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-8-1', 
        month: 'September 2025', 
        amount: 3500, 
        paid: false, 
        date: null,
        dueDate: '2025-10-10',
        status: 'pending',
        type: 'monthly'
      },
      { 
        id: 'challan-8-2', 
        month: 'October 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-11-06',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '9',
    photo: '',
    grNo: 'GR009',
    firstName: 'Saad',
    lastName: 'Mirza',
    fatherName: 'Rashid Mirza',
    religion: 'Islam',
    address: '606 Willow Street, Hyderabad, Sindh',
    dateOfBirth: '2007-02-14',
    birthPlace: 'Hyderabad',
    lastSchoolAttended: 'Hyderabad Grammar School',
    dateOfAdmission: '2025-08-25',
    class: 'Class 8',
    section: 'A',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Active participant',
    monthlyFees: 3000,
    admissionFees: 4000,
    feesPaid: 7000,
    totalFees: 7000,
    familyId: 'family-8',
    relationship: 'self',
    parentId: null,
    status: 'studying',
    feesHistory: [
      { 
        id: 'challan-9-0',
        month: 'Admission Fees',
        amount: 4000,
        paid: true,
        date: '2025-08-25',
        dueDate: '2025-08-25',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-9-1', 
        month: 'August 2025', 
        amount: 3000, 
        paid: true, 
        date: '2025-08-30',
        dueDate: '2025-09-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-9-2', 
        month: 'September 2025', 
        amount: 3000, 
        paid: true, 
        date: '2025-09-15',
        dueDate: '2025-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-9-3', 
        month: 'October 2025', 
        amount: 3000, 
        paid: false, 
        date: null,
        dueDate: '2025-11-10',
        status: 'pending',
        type: 'monthly'
      },
    ]
  },
  {
    id: '10',
    photo: '',
    grNo: 'GR010',
    firstName: 'Sana',
    lastName: 'Javed',
    fatherName: 'Waqar Javed',
    religion: 'Islam',
    address: '707 Poplar Avenue, Gujranwala, Punjab',
    dateOfBirth: '2005-09-08',
    birthPlace: 'Gujranwala',
    lastSchoolAttended: 'Gujranwala Public School',
    dateOfAdmission: '2025-09-15',
    class: 'Class 10',
    section: 'B',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Top performer',
    monthlyFees: 4000,
    admissionFees: 5000,
    feesPaid: 9000,
    totalFees: 9000,
    familyId: 'family-9',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-10-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: true,
        date: '2025-09-15',
        dueDate: '2025-09-15',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-10-1', 
        month: 'September 2025', 
        amount: 4000, 
        paid: true, 
        date: '2025-09-20',
        dueDate: '2025-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-10-2', 
        month: 'October 2025', 
        amount: 4000, 
        paid: true, 
        date: '2025-11-03',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '11',
    photo: '',
    grNo: 'GR011',
    firstName: 'Ali',
    lastName: 'Rizvi',
    fatherName: 'Naveed Rizvi',
    religion: 'Islam',
    address: '808 Oakwood Drive, Sialkot, Punjab',
    dateOfBirth: '2006-04-22',
    birthPlace: 'Sialkot General Hospital',
    lastSchoolAttended: 'Sialkot Model School',
    dateOfAdmission: '2025-08-30',
    class: 'Class 9',
    section: 'A',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Creative thinker',
    monthlyFees: 3500,
    admissionFees: 4500,
    feesPaid: 8000,
    totalFees: 8000,
    familyId: 'family-10',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-11-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2025-08-30',
        dueDate: '2025-08-30',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-11-1', 
        month: 'August 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-09-05',
        dueDate: '2025-09-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-11-2', 
        month: 'September 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-09-20',
        dueDate: '2025-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-11-3', 
        month: 'October 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-11-11',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '12',
    photo: '',
    grNo: 'GR012',
    firstName: 'Hina',
    lastName: 'Abbasi',
    fatherName: 'Shahid Abbasi',
    religion: 'Islam',
    address: '909 Cedar Road, Bahawalpur, Punjab',
    dateOfBirth: '2007-06-30',
    birthPlace: 'Bahawal Victoria Hospital',
    lastSchoolAttended: 'Bahawalpur Public School',
    dateOfAdmission: '2025-10-10',
    class: 'Class 8',
    section: 'B',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Artistic talent',
    monthlyFees: 3000,
    admissionFees: 4500,
    feesPaid: 7500,
    totalFees: 7500,
    familyId: 'family-11',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-12-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2025-10-10',
        dueDate: '2025-10-10',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-12-1', 
        month: 'October 2025', 
        amount: 3000, 
        paid: true, 
        date: '2025-10-20',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '13',
    photo: '',
    grNo: 'GR013',
    firstName: 'Usman',
    lastName: 'Tariq',
    fatherName: 'Khalid Tariq',
    religion: 'Islam',
    address: '1010 Maple Lane, Sukkur, Sindh',
    dateOfBirth: '2005-11-17',
    birthPlace: 'Sukkur Civil Hospital',
    lastSchoolAttended: 'Sukkur Grammar School',
    dateOfAdmission: '2025-09-05',
    class: 'Class 10',
    section: 'A',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Sports enthusiast',
    monthlyFees: 4000,
    admissionFees: 5000,
    feesPaid: 5000,
    totalFees: 9000,
    familyId: 'family-12',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-13-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: true,
        date: '2025-09-05',
        dueDate: '2025-09-05',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-13-1', 
        month: 'September 2025', 
        amount: 4000, 
        paid: false, 
        date: null,
        dueDate: '2025-10-10',
        status: 'pending',
        type: 'monthly'
      },
      { 
        id: 'challan-13-2', 
        month: 'October 2025', 
        amount: 4000, 
        paid: true, 
        date: '2025-11-04',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '14',
    photo: '',
    grNo: 'GR014',
    firstName: 'Nida',
    lastName: 'Farooq',
    fatherName: 'Irfan Farooq',
    religion: 'Islam',
    address: '1111 Pine Street, Mardan, KPK',
    dateOfBirth: '2006-03-25',
    birthPlace: 'Mardan Civil Hospital',
    lastSchoolAttended: 'Mardan Public School',
    dateOfAdmission: '2025-11-05',
    class: 'Class 9',
    section: 'B',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Diligent worker',
    monthlyFees: 3500,
    admissionFees: 4500,
    feesPaid: 8000,
    totalFees: 8000,
    familyId: 'family-13',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-14-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2025-08-20',
        dueDate: '2025-08-20',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-14-1', 
        month: 'August 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-08-25',
        dueDate: '2025-09-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-14-2', 
        month: 'September 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-09-18',
        dueDate: '2025-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-14-3', 
        month: 'October 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-11-02',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '15',
    photo: '',
    grNo: 'GR015',
    firstName: 'Taha',
    lastName: 'Siddiqui',
    fatherName: 'Adil Siddiqui',
    religion: 'Islam',
    address: '1212 Elm Avenue, Mirpur Khas, Sindh',
    dateOfBirth: '2007-07-12',
    birthPlace: 'Mirpur Khas Civil Hospital',
    lastSchoolAttended: 'Mirpur Khas Model School',
    dateOfAdmission: '2025-10-01',
    class: 'Class 8',
    section: 'A',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Quick learner',
    monthlyFees: 3000,
    admissionFees: 4500,
    feesPaid: 7500,
    totalFees: 7500,
    familyId: 'family-14',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-15-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2025-10-01',
        dueDate: '2025-10-01',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-15-1', 
        month: 'October 2025', 
        amount: 3000, 
        paid: true, 
        date: '2025-10-10',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '16',
    photo: '',
    grNo: 'GR016',
    firstName: 'Sadia',
    lastName: 'Hashmi',
    fatherName: 'Faisal Hashmi',
    religion: 'Islam',
    address: '1313 Birch Road, Jhang, Punjab',
    dateOfBirth: '2005-12-28',
    birthPlace: 'Jhang Civil Hospital',
    lastSchoolAttended: 'Jhang Public School',
    dateOfAdmission: '2025-09-12',
    class: 'Class 10',
    section: 'B',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Excellent in literature',
    monthlyFees: 4000,
    admissionFees: 5000,
    feesPaid: 5000,
    totalFees: 9000,
    familyId: 'family-15',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-16-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: true,
        date: '2025-09-12',
        dueDate: '2025-09-12',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-16-1', 
        month: 'September 2025', 
        amount: 4000, 
        paid: false, 
        date: null,
        dueDate: '2025-10-10',
        status: 'pending',
        type: 'monthly'
      },
      { 
        id: 'challan-16-2', 
        month: 'October 2025', 
        amount: 4000, 
        paid: true, 
        date: '2025-11-01',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '17',
    photo: '',
    grNo: 'GR017',
    firstName: 'Kamran',
    lastName: 'Chaudhry',
    fatherName: 'Nasir Chaudhry',
    religion: 'Islam',
    address: '1414 Spruce Drive, Sahiwal, Punjab',
    dateOfBirth: '2006-05-03',
    birthPlace: 'Sahiwal General Hospital',
    lastSchoolAttended: 'Sahiwal Model School',
    dateOfAdmission: '2025-08-28',
    class: 'Class 9',
    section: 'A',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Tech enthusiast',
    monthlyFees: 3500,
    admissionFees: 4500,
    feesPaid: 8000,
    totalFees: 8000,
    familyId: 'family-16',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-17-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2025-08-28',
        dueDate: '2025-08-28',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-17-1', 
        month: 'August 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-09-02',
        dueDate: '2025-09-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-17-2', 
        month: 'September 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-09-15',
        dueDate: '2025-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-17-3', 
        month: 'October 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-11-13',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '18',
    photo: '',
    grNo: 'GR018',
    firstName: 'Rabia',
    lastName: 'Iqbal',
    fatherName: 'Shakeel Iqbal',
    religion: 'Islam',
    address: '1515 Willow Street, Dera Ghazi Khan, Punjab',
    dateOfBirth: '2007-08-19',
    birthPlace: 'DG Khan Civil Hospital',
    lastSchoolAttended: 'DG Khan Public School',
    dateOfAdmission: '2025-10-15',
    class: 'Class 8',
    section: 'B',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Musical talent',
    monthlyFees: 3000,
    admissionFees: 4500,
    feesPaid: 7500,
    totalFees: 7500,
    familyId: 'family-17',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-18-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2025-10-15',
        dueDate: '2025-10-15',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-18-1', 
        month: 'October 2025', 
        amount: 3000, 
        paid: true, 
        date: '2025-10-25',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '19',
    photo: '',
    grNo: 'GR019',
    firstName: 'Junaid',
    lastName: 'Aslam',
    fatherName: 'Tahir Aslam',
    religion: 'Islam',
    address: '1616 Poplar Avenue, Nawabshah, Sindh',
    dateOfBirth: '2005-10-11',
    birthPlace: 'Nawabshah Civil Hospital',
    lastSchoolAttended: 'Nawabshah Grammar School',
    dateOfAdmission: '2025-09-08',
    class: 'Class 10',
    section: 'A',
    dateOfLeaving: null,
    classInWhichLeft: '',
    reasonOfLeaving: '',
    remarks: 'Leadership qualities',
    monthlyFees: 4000,
    admissionFees: 5000,
    feesPaid: 9000,
    totalFees: 9000,
    familyId: 'family-18',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-19-0',
        month: 'Admission Fees',
        amount: 5000,
        paid: true,
        date: '2025-09-08',
        dueDate: '2025-09-08',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-19-1', 
        month: 'September 2025', 
        amount: 4000, 
        paid: true, 
        date: '2025-09-18',
        dueDate: '2025-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-19-2', 
        month: 'October 2025', 
        amount: 4000, 
        paid: true, 
        date: '2025-11-07',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  {
    id: '20',
    photo: '',
    grNo: 'GR020',
    firstName: 'Amina',
    lastName: 'Zafar',
    fatherName: 'Shahbaz Zafar',
    religion: 'Islam',
    address: '1717 Oakwood Drive, Rahim Yar Khan, Punjab',
    dateOfBirth: '2006-01-23',
    birthPlace: 'RYK Civil Hospital',
    lastSchoolAttended: 'RYK Public School',
    dateOfAdmission: '2025-08-18',
    class: 'Class 9',
    section: 'B',
    dateOfLeaving: '2025-10-15',
    classInWhichLeft: 'Class 9',
    reasonOfLeaving: 'Family moved to another city',
    remarks: 'Science prodigy',
    monthlyFees: 3500,
    admissionFees: 4500,
    feesPaid: 8000,
    totalFees: 8000,
    familyId: 'family-19',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-20-0',
        month: 'Admission Fees',
        amount: 4500,
        paid: true,
        date: '2025-08-18',
        dueDate: '2025-08-18',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-20-1', 
        month: 'August 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-08-23',
        dueDate: '2025-09-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-20-2', 
        month: 'September 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-09-12',
        dueDate: '2025-10-10',
        status: 'paid',
        type: 'monthly'
      },
      { 
        id: 'challan-20-3', 
        month: 'October 2025', 
        amount: 3500, 
        paid: true, 
        date: '2025-11-09',
        dueDate: '2025-11-10',
        status: 'paid',
        type: 'monthly'
      },
    ]
  },
  // New students admitted in November 2025
  {
    id: '21',
    photo: '',
    grNo: 'GR021',
    firstName: 'Usman',
    lastName: 'Ahmed',
    fatherName: 'Tariq Ahmed',
    religion: 'Islam',
    address: '1818 Maple Street, Lahore, Punjab',
    dateOfBirth: '2007-03-15',
    birthPlace: 'Lahore General Hospital',
    lastSchoolAttended: 'Lahore Public School',
    dateOfAdmission: '2025-11-05',
    class: 'Class 8',
    section: 'A',
    monthlyFees: 3200,
    admissionFees: 4200,
    feesPaid: 4200,
    totalFees: 7400,
    familyId: 'family-21',
    relationship: 'self',
    parentId: null,
    feesHistory: [
      { 
        id: 'challan-21-0',
        month: 'Admission Fees',
        amount: 4200,
        paid: true,
        date: '2025-11-05',
        dueDate: '2025-11-05',
        status: 'paid',
        type: 'admission'
      },
      { 
        id: 'challan-21-1', 
        month: 'November 2025', 
        amount: 3200, 
        paid: false, 
        date: null,
        dueDate: '2025-12-10',
        status: 'pending',
        type: 'monthly'
      },
    ]
  }
];

/**
 * Initial state for the students slice
 */
const initialState = {
  students: mockStudents,
  loading: false,
  error: null,
};

/**
 * Async thunk to fetch students from the server
 * @returns {Promise<Array>} Promise that resolves to an array of students
 */
export const fetchStudents = createAsyncThunkWithToast(
  'students/fetchStudents',
  async () => {
    return mockStudents;
  },
  {
    delay: 500
  }
);

/**
 * Async thunk to add a new student
 * @param {Object} studentData - The student data to add
 * @returns {Promise<Object>} Promise that resolves to the new student object
 */
export const addStudent = createAddThunk(
  'students/addStudent',
  async (studentData) => {
    // Calculate totalFees if not provided
    let totalFees = parseFloat(studentData.totalFees) || 0;
    const monthlyFees = parseFloat(studentData.monthlyFees) || 0;
    const admissionFees = parseFloat(studentData.admissionFees) || 0;
    const feesPaid = parseFloat(studentData.feesPaid) || 0;
    
    // If totalFees is not provided or is 0, calculate it from monthly and admission fees
    if (totalFees <= 0) {
      totalFees = monthlyFees + admissionFees;
    }
    
    // Create fees history with admission fees
    const feesHistory = [];
    
    // Add admission fees record if admission fees are specified
    if (admissionFees > 0) {
      feesHistory.push({
        id: `challan-${Date.now()}-0`,
        month: 'Admission Fees',
        amount: admissionFees,
        paid: feesPaid >= admissionFees,
        date: studentData.dateOfAdmission || new Date().toISOString().split('T')[0],
        dueDate: studentData.dateOfAdmission || new Date().toISOString().split('T')[0],
        status: feesPaid >= admissionFees ? 'paid' : 'pending',
        type: 'admission'
      });
    }
    
    // Generate a family ID if not provided (for new families)
    const familyId = studentData.familyId || `family-${Date.now()}`;
    
    const newStudent = {
      id: Date.now().toString(),
      ...studentData,
      monthlyFees,
      admissionFees,
      feesPaid,
      totalFees,
      familyId,
      feesHistory,
    };
    
    console.log('New student object:', newStudent);
    return newStudent;
  },
  {
    successMessage: 'Student added successfully',
    errorMessage: 'Failed to add student',
    delay: 500
  }
);

/**
 * Async thunk to update an existing student
 * @param {Object} studentData - The updated student data
 * @returns {Promise<Object>} Promise that resolves to the updated student object
 */
export const updateStudent = createUpdateThunk(
  'students/updateStudent',
  async (studentData) => {
    return studentData;
  },
  {
    successMessage: 'Student updated successfully',
    errorMessage: 'Failed to update student',
    delay: 500
  }
);

/**
 * Async thunk to delete a student
 * @param {string} studentId - The ID of the student to delete
 * @returns {Promise<string>} Promise that resolves to the deleted student ID
 */
export const deleteStudent = createDeleteThunk(
  'students/deleteStudent',
  async (studentId) => {
    return studentId;
  },
  {
    successMessage: 'Student deleted successfully',
    errorMessage: 'Failed to delete student',
    delay: 500
  }
);

/**
 * Async thunk to pay student fees
 * @param {Object} paymentData - The payment data
 * @param {string} paymentData.studentId - The student ID
 * @param {number} paymentData.amount - The amount paid
 * @param {string} paymentData.month - The month for which fees are paid
 * @param {string} paymentData.paymentMethod - The payment method
 * @param {string} paymentData.paymentDate - The payment date
 * @returns {Promise<Object>} Promise that resolves to the payment data
 */
export const payFees = createAsyncThunkWithToast(
  'students/payFees',
  async ({ challanId, paymentMethod, paymentDate }) => {
    return { challanId, paymentMethod, paymentDate };
  },
  {
    successMessage: 'Fees paid successfully',
    errorMessage: 'Failed to pay fees',
    delay: 500
  }
);

/**
 * Async thunk to generate a challan for a student
 * @param {Object} challanData - The challan data
 * @returns {Promise<Object>} Promise that resolves to the challan data
 */
export const generateChallan = createAsyncThunkWithToast(
  'students/generateChallan',
  async (challanData) => {
    return challanData;
  },
  {
    successMessage: 'Challan generated successfully',
    errorMessage: 'Failed to generate challan',
    delay: 500
  }
);

/**
 * Async thunk to bulk generate challans for multiple students
 * @param {Object} bulkData - The bulk challan data
 * @param {Array<string>} bulkData.studentIds - Array of student IDs
 * @param {Object} bulkData.challanTemplate - The challan template
 * @returns {Promise<Object>} Promise that resolves to the bulk challan data
 */
export const bulkGenerateChallans = createAsyncThunkWithToast(
  'students/bulkGenerateChallans',
  async ({ studentIds, challanTemplate }) => {
    return { studentIds, challanTemplate };
  },
  {
    successMessage: 'Challans generated successfully',
    errorMessage: 'Failed to generate challans',
    delay: 1000
  }
);

/**
 * Async thunk to bulk update challan statuses
 * @param {Object} updateData - The update data
 * @param {Array<Object>} updateData.challanUpdates - Array of challan updates
 * @returns {Promise<Object>} Promise that resolves to the update data
 */
export const bulkUpdateChallanStatuses = createAsyncThunkWithToast(
  'students/bulkUpdateChallanStatuses',
  async ({ challanUpdates }) => {
    return { challanUpdates };
  },
  {
    successMessage: 'Challan statuses updated successfully',
    errorMessage: 'Failed to update challan statuses',
    delay: 1000
  }
);

/**
 * Async thunk to mark a student as left
 * @param {Object} studentData - The student data with leaving information
 * @returns {Promise<Object>} Promise that resolves to the updated student object
 */
export const markStudentAsLeft = createAsyncThunkWithToast(
  'students/markStudentAsLeft',
  async (studentData) => {
    return studentData;
  },
  {
    successMessage: 'Student marked as left successfully',
    errorMessage: 'Failed to mark student as left',
    delay: 500
  }
);

/**
 * Redux slice for managing students state
 */
const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        console.log('Adding student to state:', action.payload);
        state.students.push(action.payload);
        console.log('Students array after adding:', state.students);
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const index = state.students.findIndex(student => student.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(student => student.id !== action.payload);
      })
      .addCase(payFees.fulfilled, (state, action) => {
        const { challanId, paymentMethod, paymentDate } = action.payload;
        // Find the student who has this challan
        const student = state.students.find(s => 
          s.feesHistory && s.feesHistory.some(f => f.id === challanId)
        );
        if (student) {
          const feeRecord = student.feesHistory.find(f => f.id === challanId);
          if (feeRecord) {
            feeRecord.paid = true;
            feeRecord.status = 'paid';
            feeRecord.date = paymentDate || new Date().toISOString().split('T')[0];
            feeRecord.paymentMethod = paymentMethod || 'cash'; // Default to cash if not provided
            
            // Update total fees paid
            student.feesPaid = (parseFloat(student.feesPaid) || 0) + parseFloat(feeRecord.amount || 0);
          }
        }
      })
      .addCase(generateChallan.fulfilled, (state, action) => {
        const { studentId, month, amount, dueDate, description } = action.payload;
        const student = state.students.find(s => s.id === studentId);
        if (student) {
          // Convert month format from YYYY-MM to Month YYYY
          const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
          const [year, monthIndex] = (month || '2025-01').split('-');
          const monthName = monthNames[parseInt(monthIndex) - 1] || 'Unknown';
          const formattedMonth = `${monthName} ${year}`;
          
          const newChallan = {
            id: `challan-${studentId}-${Date.now()}`,
            month: formattedMonth,
            amount: amount || student.monthlyFees || 0,
            dueDate: dueDate || new Date().toISOString().split('T')[0],
            description: description || '',
            paid: false,
            date: null,
            status: 'pending',
            type: 'monthly'
          };
          if (!student.feesHistory) {
            student.feesHistory = [];
          }
          student.feesHistory.push(newChallan);
        }
      })
      .addCase(bulkGenerateChallans.fulfilled, (state, action) => {
        const { studentIds, challanTemplate } = action.payload;
        const { month, dueDate, description } = challanTemplate || {};
        
        // Convert month format from YYYY-MM to Month YYYY
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        
        // Default to current month if not provided
        const monthToUse = month || new Date().toISOString().slice(0, 7);
        const [year, monthIndex] = monthToUse.split('-');
        const monthName = monthNames[parseInt(monthIndex) - 1] || 'Unknown';
        const formattedMonth = `${monthName} ${year}`;
        
        // Array to store generated challans for return
        const generatedChallans = [];
        
        // Generate challans for each student
        studentIds.forEach(studentId => {
          const student = state.students.find(s => s.id === studentId);
          if (student) {
            const newChallan = {
              id: `challan-${studentId}-${Date.now()}`,
              month: formattedMonth,
              amount: student.monthlyFees || 0,
              dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 7 days from now
              description: description || '',
              paid: false,
              date: null,
              status: 'pending',
              type: 'monthly'
            };
            if (!student.feesHistory) {
              student.feesHistory = [];
            }
            student.feesHistory.push(newChallan);
            
            // Add to generated challans array
            generatedChallans.push({
              ...newChallan,
              studentId: student.id
            });
          }
        });
        
        // Add generated challans to the action payload for use in components
        action.payload.generatedChallans = generatedChallans;
      })
      .addCase(bulkUpdateChallanStatuses.fulfilled, (state, action) => {
        const { challanUpdates } = action.payload;
        
        // Update each challan status
        challanUpdates.forEach(update => {
          const { studentId, challanId, paymentMethod, paymentDate } = update || {};
          if (!studentId || !challanId) return; // Skip if required data is missing
          
          const student = state.students.find(s => s.id === studentId);
          if (student) {
            const feeRecord = student.feesHistory.find(f => f.id === challanId);
            if (feeRecord) {
              feeRecord.paid = true;
              feeRecord.status = 'paid';
              feeRecord.date = paymentDate || new Date().toISOString().split('T')[0];
              feeRecord.paymentMethod = paymentMethod || 'cash'; // Default to cash if not provided
              
              // Update total fees paid
              student.feesPaid = (parseFloat(student.feesPaid) || 0) + parseFloat(feeRecord.amount || 0);
            }
          }
        });
      })
      .addCase(markStudentAsLeft.fulfilled, (state, action) => {
        const index = state.students.findIndex(student => student.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      });
  },
});

export default studentsSlice.reducer;