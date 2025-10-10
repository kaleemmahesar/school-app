import React from 'react';
import { FaSchool } from 'react-icons/fa';

const CertificateTemplate = ({ 
  student, 
  certificateType, 
  issueDate, 
  reason = '', 
  characterDetails = '',
  schoolName = 'ABC Public School',
  schoolAddress = '123 Education Street, City, State 12345',
  principalName = 'Dr. John Smith'
}) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto border-4 border-blue-800 rounded-lg p-8 bg-white">
        {/* Certificate Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FaSchool className="text-4xl text-blue-800" />
          </div>
          <h1 className="text-3xl font-bold text-blue-800 uppercase tracking-wider">
            {schoolName}
          </h1>
          <p className="text-gray-600 mt-2">{schoolAddress}</p>
          <div className="border-b-2 border-blue-800 mt-4 mx-auto w-32"></div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 border-2 border-gray-900 inline-block px-6 py-2">
            {certificateType === 'leaving' ? 'LEAVING CERTIFICATE' : 'CHARACTER CERTIFICATE'}
          </h2>
        </div>

        {/* Certificate Content */}
        <div className="mb-10">
          <p className="text-lg text-gray-700 text-center mb-6">
            This is to certify that
          </p>
          
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-gray-600">
              Student ID: <span className="font-medium">{student.id}</span>
            </p>
            <p className="text-gray-600">
              Class: <span className="font-medium">{student.class} - Section {student.section}</span>
            </p>
            <p className="text-gray-600">
              Admission Date: <span className="font-medium">{formatDate(student.admissionDate)}</span>
            </p>
          </div>

          {certificateType === 'leaving' ? (
            <div className="text-lg text-gray-700 mb-8 leading-relaxed">
              <p className="text-center mb-4">
                was a bonafide student of this school and has left the institution on{' '}
                <span className="font-bold">{formatDate(issueDate)}</span>.
              </p>
              {reason && (
                <p className="text-center">
                  Reason for leaving: <span className="font-medium">{reason}</span>
                </p>
              )}
              <p className="text-center mt-6">
                We wish {student.firstName} all the best in their future endeavors.
              </p>
            </div>
          ) : (
            <div className="text-lg text-gray-700 mb-8 leading-relaxed">
              <p className="text-center mb-4">
                was a bonafide student of this school and during the period of study
                maintained good conduct and character.
              </p>
              {characterDetails && (
                <p className="text-center mb-4 font-medium">
                  {characterDetails}
                </p>
              )}
              <p className="text-center">
                We recommend {student.firstName} as a student of good moral character.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end mt-12">
          <div>
            <p className="text-gray-600">Date: {formatDate(issueDate)}</p>
          </div>
          <div className="text-center">
            <div className="mb-12">_________________________</div>
            <p className="font-bold text-gray-900">{principalName}</p>
            <p className="text-gray-600">Principal</p>
          </div>
        </div>

        {/* Certificate Number and Seal */}
        <div className="flex justify-between items-end mt-8 pt-4 border-t border-gray-300">
          <p className="text-sm text-gray-500">
            Certificate No: CERT-{student.id}-{new Date().getFullYear()}
          </p>
          <p className="text-sm text-gray-500">
            Issued on: {formatDate(issueDate)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;