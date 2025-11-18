import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSchoolInfo, fetchSchoolInfo } from '../store/settingsSlice';
import { FaSchool, FaGraduationCap, FaToggleOn, FaToggleOff, FaSave, FaUndo } from 'react-icons/fa';
import { SCHOOL_CONFIG } from '../config/schoolConfig';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { schoolInfo, loading, error } = useSelector(state => state.settings);
  
  const [formData, setFormData] = useState({
    level: SCHOOL_CONFIG.level,
    hasPG: SCHOOL_CONFIG.hasPG,
    hasNursery: SCHOOL_CONFIG.hasNursery,
    hasKG: SCHOOL_CONFIG.hasKG,
  });

  // Initialize form with school info
  useEffect(() => {
    dispatch(fetchSchoolInfo());
  }, [dispatch]);

  useEffect(() => {
    if (schoolInfo) {
      setFormData({
        level: schoolInfo.level || SCHOOL_CONFIG.level,
        hasPG: schoolInfo.hasPG !== undefined ? schoolInfo.hasPG : SCHOOL_CONFIG.hasPG,
        hasNursery: schoolInfo.hasNursery !== undefined ? schoolInfo.hasNursery : SCHOOL_CONFIG.hasNursery,
        hasKG: schoolInfo.hasKG !== undefined ? schoolInfo.hasKG : SCHOOL_CONFIG.hasKG,
      });
    }
  }, [schoolInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateSchoolInfo(formData)).unwrap();
    } catch (err) {
      console.error('Failed to update school info:', err);
    }
  };

  const handleReset = () => {
    setFormData({
      level: SCHOOL_CONFIG.level,
      hasPG: SCHOOL_CONFIG.hasPG,
      hasNursery: SCHOOL_CONFIG.hasNursery,
      hasKG: SCHOOL_CONFIG.hasKG,
    });
  };

  const getLevelDescription = (level) => {
    switch (level) {
      case 'primary': return 'Primary School (Grades 1-5)';
      case 'middle': return 'Middle School (Grades 6-8)';
      case 'high': return 'High School (Grades 9-10)';
      default: return 'Primary School (Grades 1-5)';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">School Settings</h1>
        <p className="text-gray-600 mt-1">Configure your school's basic information</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <FaSchool className="text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">School Configuration</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <div className="space-y-8">
              {/* School Level Section */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FaGraduationCap className="mr-2 text-blue-500" />
                  School Level
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['primary', 'middle', 'high'].map((level) => (
                    <div 
                      key={level}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.level === level 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, level }))}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={level}
                          name="level"
                          value={level}
                          checked={formData.level === level}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={level} className="ml-3 block text-sm font-medium text-gray-700">
                          {getLevelDescription(level)}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Early Childhood Education Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Early Childhood Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.hasPG 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleToggleChange('hasPG')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Play Group (PG)</span>
                      {formData.hasPG ? 
                        <FaToggleOn className="text-green-500 text-xl" /> : 
                        <FaToggleOff className="text-gray-400 text-xl" />
                      }
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Enable Play Group class
                    </p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.hasNursery 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleToggleChange('hasNursery')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Nursery</span>
                      {formData.hasNursery ? 
                        <FaToggleOn className="text-green-500 text-xl" /> : 
                        <FaToggleOff className="text-gray-400 text-xl" />
                      }
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Enable Nursery class
                    </p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.hasKG 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleToggleChange('hasKG')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Kindergarten (KG)</span>
                      {formData.hasKG ? 
                        <FaToggleOn className="text-green-500 text-xl" /> : 
                        <FaToggleOff className="text-gray-400 text-xl" />
                      }
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Enable Kindergarten class
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaUndo className="mr-2 -ml-1 h-4 w-4" />
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2 -ml-1 h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;