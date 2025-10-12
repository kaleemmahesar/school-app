import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FaCertificate, FaDownload, FaPrint } from 'react-icons/fa';
import { updateStudent } from '../../store/studentsSlice';
import PrintableCertificate from './PrintableCertificate';

const CertificateGenerator = ({ student, onClose }) => {
  const dispatch = useDispatch();
  const [certificateType, setCertificateType] = useState('leaving');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [characterDetails, setCharacterDetails] = useState('is a student of good moral character and has shown consistent academic performance throughout their time at our institution.');
  const [showPrintView, setShowPrintView] = useState(false);

  const handleGenerateCertificate = () => {
    // If generating a leaving certificate, update the student status
    if (certificateType === 'leaving') {
      const updatedStudent = {
        ...student,
        status: 'left',
        leavingDate: issueDate,
        leavingReason: reason
      };
      
      dispatch(updateStudent(updatedStudent));
    }
    
    // If generating a pass certificate, update the student status to passed_out
    if (certificateType === 'pass') {
      const updatedStudent = {
        ...student,
        status: 'passed_out',
        passDate: issueDate,
        passDetails: reason
      };
      
      dispatch(updateStudent(updatedStudent));
    }
    
    setShowPrintView(true);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (showPrintView) {
    return (
      <PrintableCertificate
        student={student}
        certificateType={certificateType}
        issueDate={issueDate}
        reason={reason}
        characterDetails={characterDetails}
        onClose={() => {
          setShowPrintView(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              <FaCertificate className="inline mr-2 text-blue-600" />
              Generate Certificate
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          
          <div className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900">Student Information</h4>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{student.firstName} {student.lastName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Student ID:</span>
                  <span className="ml-2 font-medium">{student.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Class:</span>
                  <span className="ml-2 font-medium">{student.class} - Section {student.section}</span>
                </div>
                <div>
                  <span className="text-gray-500">Admission Date:</span>
                  <span className="ml-2 font-medium">{formatDate(student.admissionDate)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Type
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setCertificateType('leaving')}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      certificateType === 'leaving'
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Leaving Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertificateType('pass')}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      certificateType === 'pass'
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Pass Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => setCertificateType('character')}
                    className={`px-4 py-2 border rounded-md text-sm font-medium ${
                      certificateType === 'character'
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Character Certificate
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  id="issueDate"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {certificateType === 'leaving' ? (
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Leaving (Optional)
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for leaving the school..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="characterDetails" className="block text-sm font-medium text-gray-700 mb-1">
                    Character Details
                  </label>
                  <textarea
                    id="characterDetails"
                    rows={4}
                    value={characterDetails}
                    onChange={(e) => setCharacterDetails(e.target.value)}
                    placeholder="Enter details about the student's character, conduct, and achievements..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Certificate Preview</h4>
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {certificateType === 'leaving' ? 'LEAVING CERTIFICATE' : 
                       certificateType === 'pass' ? 'PASS CERTIFICATE' : 
                       'CHARACTER CERTIFICATE'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">This is to certify that</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Student ID: {student.id}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Class: {student.class} - Section {student.section}
                    </p>
                    
                    {certificateType === 'leaving' ? (
                      <div className="mt-4 text-sm text-gray-700">
                        <p>
                          was a bonafide student of this school and has left the institution on{' '}
                          <span className="font-medium">{formatDate(issueDate)}</span>.
                        </p>
                        {reason && (
                          <p className="mt-2">
                            Reason: <span className="font-medium">{reason}</span>
                          </p>
                        )}
                      </div>
                    ) : certificateType === 'pass' ? (
                      <div className="mt-4 text-sm text-gray-700">
                        <p>
                          has successfully passed the final examination and is awarded this certificate on{' '}
                          <span className="font-medium">{formatDate(issueDate)}</span>.
                        </p>
                        {reason && (
                          <p className="mt-2">
                            Additional Details: <span className="font-medium">{reason}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 text-sm text-gray-700">
                        {characterDetails && (
                          <p className="mt-2 font-medium">{characterDetails}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-between text-sm text-gray-600">
                      <div>
                        <p>Date: {formatDate(issueDate)}</p>
                      </div>
                      <div>
                        <p>Principal's Signature</p>
                        <div className="mt-8 border-t border-gray-400 pt-2">Principal</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateCertificate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPrint className="mr-2" />
                Generate & Print Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;