import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUsers, FaMoneyBillWave, FaChalkboardTeacher, FaBook, FaGraduationCap, FaChartLine, FaDollarSign, FaClipboardList, FaChevronDown, FaQrcode, FaUsersCog, FaFileInvoice, FaTasks, FaListOl, FaFileAlt, FaEdit, FaGraduationCap as FaGraduationCapIcon, FaCalendarAlt, FaCertificate, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { logoutUser } from '../store/usersSlice';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const students = useSelector(state => state.students.students);
  const expenses = useSelector(state => state.expenses.expenses);
  const staff = useSelector(state => state.staff.staff);
  const classes = useSelector(state => state.classes.classes);
  const currentUser = useSelector(state => state.users.currentUser);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Redirect to login if not authenticated (except for login page)
  useEffect(() => {
    if (!currentUser && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [currentUser, location.pathname, navigate]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container') && !e.target.closest('.user-menu')) {
        closeDropdowns();
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Navigation items configuration - Simplified for core features
  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <FaChartLine className="mr-2" />,
      exact: true
    },
    {
      name: 'Students',
      path: '/students',
      icon: <FaUsers className="mr-2" />
    },
    {
      name: 'Classes',
      path: '/classes',
      icon: <FaBook className="mr-2" />
    },
    {
      name: 'Staff',
      path: '/staff',
      icon: <FaChalkboardTeacher className="mr-2" />
    },
    {
      name: 'Expenses',
      path: '/expenses',
      icon: <FaMoneyBillWave className="mr-2" />
    },
    {
      name: 'Fees',
      path: '/fees',
      icon: <FaDollarSign className="mr-2" />
    },
    {
      name: 'Marksheets',
      path: '/marksheets',
      icon: <FaClipboardList className="mr-2" />
    },
    {
      name: 'Certificates',
      path: '/certificates',
      icon: <FaCertificate className="mr-2" />
    },
    // Only show settings for admin users
    ...(currentUser && currentUser.role === 'Administrator' ? [{
      name: 'Settings',
      path: '/settings',
      icon: <FaCog className="mr-2" />
    }] : [])
  ];

  // Don't show navigation for login page
  const isLoginPage = location.pathname === '/login';
  
  // If not authenticated and not on login page, don't render the layout content
  if (!currentUser && !isLoginPage) {
    return null;
  }

  // For login page, just render children without layout
  if (isLoginPage) {
    return <div>{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-2 rounded-xl">
                <FaGraduationCap className="text-white text-2xl" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">School Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="relative user-menu">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full">
                      <FaUser className="text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                      <p className="text-xs text-gray-500">{currentUser.role}</p>
                    </div>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                        <p className="text-xs text-gray-500">{currentUser.role}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <FaSignOutAlt className="mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-t border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex py-3 space-x-6 overflow-x-auto">
            
            {navItems.map((item, index) => (
              <div key={index} className="dropdown-container relative">
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={closeDropdowns}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;