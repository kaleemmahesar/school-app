import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage = 8,
  totalItems,
  className = '' 
}) => {
  // Calculate start and end item indices
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show around current page
    const range = [];
    const rangeWithDots = [];
    
    // Always include first page
    range.push(1);
    
    // Add dots if there's a gap between first page and current range
    if (currentPage - delta > 2) {
      range.push('left-dots');
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    
    // Add dots if there's a gap between current range and last page
    if (currentPage + delta < totalPages - 1) {
      range.push('right-dots');
    }
    
    // Always include last page if there's more than one page
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    // Convert to range with dots
    let lastPage = 0;
    for (const page of range) {
      if (page === 'left-dots' || page === 'right-dots') {
        rangeWithDots.push(
          <span key={page} className="px-2 py-1 text-gray-400">
            ...
          </span>
        );
      } else {
        if (page - lastPage > 1) {
          rangeWithDots.push(
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          );
        }
        lastPage = page;
      }
    }
    
    return rangeWithDots;
  };

  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return (
      <div className={`flex justify-center text-sm text-gray-500 ${className}`}>
        Showing {totalItems} of {totalItems} results
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{startIndex}</span> to <span className="font-medium">{endIndex}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-md ${
            currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="First page"
        >
          <FaAngleDoubleLeft />
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-md ${
            currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Previous page"
        >
          <FaChevronLeft />
        </button>
        
        <div className="flex items-center space-x-1">
          {getPageNumbers()}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md ${
            currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Next page"
        >
          <FaChevronRight />
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md ${
            currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Last page"
        >
          <FaAngleDoubleRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;