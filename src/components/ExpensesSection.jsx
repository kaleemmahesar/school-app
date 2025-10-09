import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpenses, addExpense, updateExpense, deleteExpense, addCategory } from '../store/expensesSlice';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaMoneyBillWave, FaTag, FaCalendar, FaList, FaChartBar } from 'react-icons/fa';
import PageHeader from './common/PageHeader';
import ExpenseFormModal from './ExpenseFormModal';
import CategoryFormModal from './CategoryFormModal';

const ExpensesSection = () => {
  const dispatch = useDispatch();
  const { expenses, categories, loading, error } = useSelector(state => state.expenses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  const handleEdit = (expense) => {
    setCurrentExpense(expense);
    setShowExpenseModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      dispatch(deleteExpense(id));
    }
  };

  const handleExpenseSubmit = (expenseData) => {
    if (currentExpense) {
      dispatch(updateExpense({ ...currentExpense, ...expenseData }));
    } else {
      dispatch(addExpense(expenseData));
    }
    setShowExpenseModal(false);
    setCurrentExpense(null);
  };

  const handleCategorySubmit = (categoryName) => {
    dispatch(addCategory(categoryName));
    setShowCategoryModal(false);
  };

  const filteredExpenses = expenses.filter(expense => {
    // Text search
    const matchesSearch = 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    
    // Date range filter
    const expenseDate = new Date(expense.date);
    const matchesDateRange = 
      (!dateRange.start || expenseDate >= new Date(dateRange.start)) &&
      (!dateRange.end || expenseDate <= new Date(dateRange.end));
    
    // Amount range filter
    const expenseAmount = parseFloat(expense.amount);
    const matchesAmountRange = 
      (!amountRange.min || expenseAmount >= parseFloat(amountRange.min)) &&
      (!amountRange.max || expenseAmount <= parseFloat(amountRange.max));
    
    return matchesSearch && matchesCategory && matchesDateRange && matchesAmountRange;
  });

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Group expenses by category for summary
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = { total: 0, count: 0 };
    }
    acc[expense.category].total += parseFloat(expense.amount);
    acc[expense.category].count += 1;
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">Error: {error}</p>
      </div>
    </div>
  </div>;

  return (
    // Removed the outer div with className "space-y-6" since Layout provides the styling
    <>
      <PageHeader
        title="Expenses Management"
        subtitle="Track and manage all school expenses"
        actionButton={
          <button
            onClick={() => {
              setCurrentExpense(null);
              setShowExpenseModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <FaPlus className="mr-2" /> Add Expense
          </button>
        }
        secondaryButton={
          <button
            onClick={() => setShowCategoryModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            <FaPlus className="mr-2" /> Add Category
          </button>
        }
      />

      {/* Summary Statistics */}
      <div className="my-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Total Expenses</p>
                <p className="text-2xl font-bold mt-1">Rs {Math.round(totalExpenses)}</p>
              </div>
              <div className="p-2 bg-blue-400 bg-opacity-30 rounded-full">
                <FaMoneyBillWave size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">Categories</p>
                <p className="text-2xl font-bold mt-1">{categories.length}</p>
              </div>
              <div className="p-2 bg-green-400 bg-opacity-30 rounded-full">
                <FaTag size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">Total Records</p>
                <p className="text-2xl font-bold mt-1">{expenses.length}</p>
              </div>
              <div className="p-2 bg-purple-400 bg-opacity-30 rounded-full">
                <FaChartBar size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters - Move inside table section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Advanced Filters */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <input
                type="date"
                placeholder="Start Date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <input
                type="date"
                placeholder="End Date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMoneyBillWave className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  placeholder="Min Amount"
                  value={amountRange.min}
                  onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <span className="text-gray-500">to</span>
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMoneyBillWave className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  placeholder="Max Amount"
                  value={amountRange.max}
                  onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setDateRange({ start: '', end: '' });
                  setAmountRange({ min: '', max: '' });
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Expenses by Category */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(expensesByCategory).map(([category, data]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">{category}</h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {data.count} items
                </span>
              </div>
              <p className="mt-2 text-lg font-bold text-gray-900">Rs {Math.round(data.total)}</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(data.total / totalExpenses) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Expenses Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Rs {Math.round(parseFloat(expense.amount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="text-center py-12">
              <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      

      {/* Expense Form Modal */}
      {showExpenseModal && (
        <ExpenseFormModal
          onClose={() => {
            setShowExpenseModal(false);
            setCurrentExpense(null);
          }}
          onSubmit={handleExpenseSubmit}
          expenseData={currentExpense}
          categories={categories}
        />
      )}

      {/* Category Form Modal */}
      {showCategoryModal && (
        <CategoryFormModal
          onClose={() => setShowCategoryModal(false)}
          onSubmit={handleCategorySubmit}
        />
      )}
    </>
  );
};

export default ExpensesSection;