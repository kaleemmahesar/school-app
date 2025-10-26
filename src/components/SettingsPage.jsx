import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSchoolInfo, fetchSchoolInfo } from '../store/settingsSlice';
import { FaSchool, FaCog, FaBuilding, FaUpload, FaSave, FaUndo, FaHandHoldingUsd, FaMoneyBillWave, FaSearch, FaBook, FaQuestionCircle, FaGraduationCap, FaSitemap, FaPrint, FaMagic } from 'react-icons/fa';
import AppGuideModal from './settings/AppGuideModal';
import FirstRunWizard from './onboarding/FirstRunWizard';
import RoleBasedGuide from './onboarding/RoleBasedGuide';
import FaqSection from './help/FaqSection';
import Glossary from './help/Glossary';
import VisualFlowcharts from './help/VisualFlowcharts';
import QuickReference from './help/QuickReference';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { schoolInfo, loading, error } = useSelector(state => state.settings);
  const currentUser = useSelector(state => state.users.currentUser);
  
  const [formData, setFormData] = useState({
    name: '',
    level: 'primary',
    fundingType: 'ngo',
    logo: null,
    theme: 'light',
    sidebarCollapsed: false,
    dateFormat: 'DD/MM/YYYY',
    currency: 'PKR',
  });
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isRoleGuideOpen, setIsRoleGuideOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isFlowchartsOpen, setIsFlowchartsOpen] = useState(false);
  const [isQuickReferenceOpen, setIsQuickReferenceOpen] = useState(false);

  // Initialize form with school info
  useEffect(() => {
    dispatch(fetchSchoolInfo());
  }, [dispatch]);

  useEffect(() => {
    if (schoolInfo) {
      setFormData({
        name: schoolInfo.name || '',
        level: schoolInfo.level || 'primary',
        fundingType: schoolInfo.fundingType || 'ngo',
        logo: schoolInfo.logo || null,
        theme: schoolInfo.theme || 'light',
        sidebarCollapsed: schoolInfo.sidebarCollapsed || false,
        dateFormat: schoolInfo.dateFormat || 'DD/MM/YYYY',
        currency: schoolInfo.currency || 'PKR',
      });
      setLogoPreview(schoolInfo.logo || null);
    }
  }, [schoolInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          logo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateSchoolInfo(formData)).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update school info:', err);
    }
  };

  const handleReset = () => {
    if (schoolInfo) {
      setFormData({
        name: schoolInfo.name || '',
        level: schoolInfo.level || 'primary',
        fundingType: schoolInfo.fundingType || 'ngo',
        logo: schoolInfo.logo || null,
        theme: schoolInfo.theme || 'light',
        sidebarCollapsed: schoolInfo.sidebarCollapsed || false,
        dateFormat: schoolInfo.dateFormat || 'DD/MM/YYYY',
        currency: schoolInfo.currency || 'PKR',
      });
      setLogoPreview(schoolInfo.logo || null);
    }
    setIsEditing(false);
  };

  const handleWizardComplete = (schoolData) => {
    setFormData(prev => ({
      ...prev,
      ...schoolData
    }));
    setIsWizardOpen(false);
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
        <p className="text-gray-600 mt-1">Manage your school's information and preferences</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaCog className="text-gray-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">School Information</h2>
            </div>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaQuestionCircle className="mr-1.5 h-4 w-4" />
              App Guide
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* School Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter school name"
                />
              </div>

              {/* Logo Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Logo
                </label>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    {logoPreview ? (
                      <img 
                        className="h-16 w-16 rounded-md object-contain" 
                        src={logoPreview} 
                        alt="School logo preview" 
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                        <FaBuilding className="text-gray-400 h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span className="flex items-center">
                        <FaUpload className="mr-2" />
                        Upload a file
                      </span>
                      <input 
                        type="file" 
                        className="sr-only" 
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* School Level */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Level
                </label>
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

              {/* Funding Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Funding Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.fundingType === 'traditional' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, fundingType: 'traditional' }))}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="traditional"
                        name="fundingType"
                        value="traditional"
                        checked={formData.fundingType === 'traditional'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="traditional" className="ml-3 block text-sm font-medium text-gray-700">
                        <div className="flex items-center">
                          <FaMoneyBillWave className="mr-2 text-green-500" />
                          Traditional School
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Collects fees from students
                        </p>
                      </label>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.fundingType === 'ngo' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, fundingType: 'ngo' }))}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="ngo"
                        name="fundingType"
                        value="ngo"
                        checked={formData.fundingType === 'ngo'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="ngo" className="ml-3 block text-sm font-medium text-gray-700">
                        <div className="flex items-center">
                          <FaHandHoldingUsd className="mr-2 text-blue-500" />
                          NGO Funded School
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Funded by quarterly NGO subsidies
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Preferences */}
              <div className="md:col-span-2 border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Display Preferences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Theme
                    </label>
                    <select
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  
                  {/* Date Format */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Format
                    </label>
                    <select
                      name="dateFormat"
                      value={formData.dateFormat}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD MMM YYYY">DD MMM YYYY</option>
                    </select>
                  </div>
                  
                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="PKR">PKR (₨)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  
                  {/* Sidebar Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sidebar
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sidebarCollapsed"
                        name="sidebarCollapsed"
                        checked={formData.sidebarCollapsed}
                        onChange={(e) => setFormData(prev => ({ ...prev, sidebarCollapsed: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sidebarCollapsed" className="ml-2 block text-sm text-gray-900">
                        Keep sidebar collapsed by default
                      </label>
                    </div>
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

      {/* Help & Documentation Section */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <FaBook className="mr-2" />
            Help & Documentation
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Access guides, tutorials, and support resources
          </p>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white hover:from-blue-600 hover:to-indigo-700 transition-all flex flex-col items-center justify-center"
            >
              <FaMagic className="text-2xl mb-2" />
              <h3 className="font-bold mb-1">Setup Wizard</h3>
              <p className="text-blue-100 text-sm text-center">Step-by-step school configuration</p>
            </button>
            
            <button
              onClick={() => setIsRoleGuideOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white hover:from-green-600 hover:to-emerald-700 transition-all flex flex-col items-center justify-center"
            >
              <FaGraduationCap className="text-2xl mb-2" />
              <h3 className="font-bold mb-1">Role Guide</h3>
              <p className="text-green-100 text-sm text-center">Role-specific instructions</p>
            </button>
            
            <button
              onClick={() => setIsFaqOpen(true)}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg p-4 text-white hover:from-yellow-600 hover:to-amber-700 transition-all flex flex-col items-center justify-center"
            >
              <FaQuestionCircle className="text-2xl mb-2" />
              <h3 className="font-bold mb-1">FAQ</h3>
              <p className="text-yellow-100 text-sm text-center">Frequently asked questions</p>
            </button>
            
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg p-4 text-white hover:from-purple-600 hover:to-violet-700 transition-all flex flex-col items-center justify-center"
            >
              <FaBook className="text-2xl mb-2" />
              <h3 className="font-bold mb-1">Glossary</h3>
              <p className="text-purple-100 text-sm text-center">Education and system terms</p>
            </button>
            
            <button
              onClick={() => setIsFlowchartsOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg p-4 text-white hover:from-pink-600 hover:to-rose-700 transition-all flex flex-col items-center justify-center"
            >
              <FaSitemap className="text-2xl mb-2" />
              <h3 className="font-bold mb-1">Flowcharts</h3>
              <p className="text-pink-100 text-sm text-center">Visual process diagrams</p>
            </button>
            
            <button
              onClick={() => setIsQuickReferenceOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-sky-600 rounded-lg p-4 text-white hover:from-cyan-600 hover:to-sky-700 transition-all flex flex-col items-center justify-center"
            >
              <FaPrint className="text-2xl mb-2" />
              <h3 className="font-bold mb-1">Quick Reference</h3>
              <p className="text-cyan-100 text-sm text-center">Printable cheat sheets</p>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Preview</h2>
        </div>
        <div className="px-6 py-4">
          <div className="flex items-center">
            {logoPreview ? (
              <img 
                className="h-12 w-12 rounded-md object-contain mr-4" 
                src={logoPreview} 
                alt="School logo" 
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center mr-4">
                <FaBuilding className="text-gray-400 h-6 w-6" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900">{formData.name || 'School Name'}</h3>
              <p className="text-sm text-gray-500">{getLevelDescription(formData.level)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {formData.fundingType === 'ngo' ? 'NGO Funded School' : 'Traditional School'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search & Filter Demo */}
      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <FaSearch className="mr-2" />
            Search & Filter Features
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Universal search and advanced filtering capabilities are now available throughout the application
          </p>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-blue-900">Universal Search</h3>
              <p className="text-sm text-blue-700 mt-1">
                Search across all modules from the header search bar
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h3 className="font-medium text-green-900">Multi-column Sorting</h3>
              <p className="text-sm text-green-700 mt-1">
                Sort any table by clicking on column headers
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <h3 className="font-medium text-purple-900">Advanced Filtering</h3>
              <p className="text-sm text-purple-700 mt-1">
                Apply multiple filters with real-time results
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AppGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <FirstRunWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onComplete={handleWizardComplete}
      />
      <RoleBasedGuide 
        isOpen={isRoleGuideOpen} 
        onClose={() => setIsRoleGuideOpen(false)} 
        userRole={currentUser?.role}
      />
      <FaqSection isOpen={isFaqOpen} onClose={() => setIsFaqOpen(false)} />
      <Glossary isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
      <VisualFlowcharts isOpen={isFlowchartsOpen} onClose={() => setIsFlowchartsOpen(false)} />
      <QuickReference isOpen={isQuickReferenceOpen} onClose={() => setIsQuickReferenceOpen(false)} />
    </div>
  );
};

export default SettingsPage;