// components/layout/Sidebar.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { menuData } from "../../utils/menuData";

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      // Close mobile menu when switching to desktop
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isMobileMenuOpen && !event.target.closest('.sidebar-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isMobileMenuOpen]);

  const toggleMenu = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.id];
    const IconComponent = item.icon;

    return (
      <div key={item.id} className="">
        {/* Parent Menu Item */}
        <div
          className={`flex items-center justify-between p-3 py-2 rounded-sm cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
            hasChildren ? 'text-gray-700' : 'text-gray-600 hover:text-gray-600'
          }`}
          onClick={() => hasChildren ? toggleMenu(item.id) : null}
        >
          {hasChildren ? (
            // Parent with children - clickable to toggle
            <div className="flex items-center flex-1">
              <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base truncate">{item.title}</span>
            </div>
          ) : (
            // Menu item without children - Link
            <Link 
              to={item.url} 
              className="flex items-center flex-1 text-decoration-none"
              onClick={closeMobileMenu}
            >
              <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base truncate">{item.title}</span>
            </Link>
          )}
          
          {/* Collapse/Expand Arrow */}
          {hasChildren && (
            <ChevronDown
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          )}
        </div>

        {/* Children Menu Items */}
        {hasChildren && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="ml-4 sm:ml-6 mt-1 space-y-1">
              {item.children.map((child) => {
                const ChildIconComponent = child.icon;
                return (
                  <Link
                    key={child.id}
                    to={child.url}
                    className="flex items-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-decoration-none"
                    onClick={closeMobileMenu}
                  >
                    <ChildIconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{child.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        className="md:hidden fixed top-16 left-4 z-50 p-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`sidebar-container
          ${/* Mobile styles */ ''}
          fixed md:sticky top-14 left-0 z-40 
          ${/* Width responsive */ ''}
          w-64 sm:w-72 md:w-55 lg:w-64 xl:w-72
          ${/* Height */ ''}
          h-[calc(100vh-3.5rem)]
          ${/* Background and border */ ''}
          bg-white md:bg-gray-100 border-r border-gray-200 
          ${/* Shadow */ ''}
          shadow-lg md:shadow-none
          ${/* Visibility and transitions */ ''}
          transform transition-transform duration-300 ease-in-out
          ${isMobile ? 
            (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 
            'translate-x-0'
          }
          ${/* Overflow */ ''}
          overflow-y-auto
        `}
      >
        {/* Header - Mobile only */}
        <div className="md:hidden p-7 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800"></h2>
        </div>

        {/* Menu Items */}
        <div className="p-1 sm:p-2">
          {menuData.map((item) => renderMenuItem(item))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;