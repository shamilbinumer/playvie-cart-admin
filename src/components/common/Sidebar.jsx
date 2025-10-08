import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X, LogOut } from "lucide-react";
import { menuData } from "../../utils/menuData";
import { logout } from "../../redux/slices/authSlice";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  // Auto-open parent menus when child is active
  useEffect(() => {
    const currentPath = location.pathname;
    const newOpenMenus = { ...openMenus };

    menuData.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(child =>
          child.url === currentPath || currentPath.startsWith(child.url + '/')
        );
        if (hasActiveChild) {
          newOpenMenus[item.id] = true;
        }
      }
    });

    setOpenMenus(newOpenMenus);
  }, [location.pathname]);

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

  // Helper function to check if a path is active
  const isPathActive = (url) => {
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  // Helper function to check if a parent has active children
  const hasActiveChild = (item) => {
    if (!item.children) return false;
    return item.children.some(child => isPathActive(child.url));
  };

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

  const handleLogout = () => {
  Swal.fire({
    title: "Are you sure?",
    text: "You’ll be logged out from your account.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#81184e",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Logout",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("authToken");
      dispatch(logout());
      navigate("/login");
      closeMobileMenu();

      Swal.fire({
        title: "Logged out!",
        text: "You have been successfully logged out.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
};

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.id];
    const IconComponent = item.icon;
    const isParentActive = hasActiveChild(item);
    const isDirectActive = !hasChildren && isPathActive(item.url);

    return (
      <div key={item.id} className="">
        {/* Parent Menu Item */}
        <div
          className={`flex items-center justify-between p-3 py-2 rounded-sm cursor-pointer transition-all duration-200 ${hasChildren
            ? `${isParentActive
              ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
              : 'text-gray-700 hover:bg-blue-50'
            }`
            : `${isDirectActive
              ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
              : 'text-gray-600 hover:text-gray-600 hover:bg-blue-50'
            }`
            }`}
          onClick={() => hasChildren ? toggleMenu(item.id) : null}
        >
          {hasChildren ? (
            // Parent with children - clickable to toggle
            <div className="flex items-center flex-1">
              <IconComponent className={`w-5 h-5 mr-3 flex-shrink-0 ${isParentActive ? 'text-blue-600' : ''
                }`} />
              <span className={`font-medium text-sm sm:text-base truncate ${isParentActive ? 'text-blue-700 font-semibold' : ''
                }`}>
                {item.title}
              </span>
            </div>
          ) : (
            // Menu item without children - Link
            <Link
              to={item.url}
              className="flex items-center flex-1 text-decoration-none"
              onClick={closeMobileMenu}
            >
              <IconComponent className={`w-5 h-5 mr-3 flex-shrink-0 ${isDirectActive ? 'text-blue-600' : ''
                }`} />
              <span className={`font-medium text-sm sm:text-base truncate ${isDirectActive ? 'text-blue-700 font-semibold' : ''
                }`}>
                {item.title}
              </span>
            </Link>
          )}

          {/* Collapse/Expand Arrow */}
          {hasChildren && (
            <ChevronDown
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'
                } ${isParentActive ? 'text-blue-600' : ''}`}
            />
          )}
        </div>

        {/* Children Menu Items */}
        {hasChildren && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="ml-4 sm:ml-6 mt-1 space-y-1">
              {item.children.map((child) => {
                const ChildIconComponent = child.icon;
                const isChildActive = isPathActive(child.url);

                return (
                  <Link
                    key={child.id}
                    to={child.url}
                    className={`flex items-center p-1 rounded-sm transition-all duration-200 text-decoration-none ${isChildActive
                      ? 'text-blue-700 bg-blue-50 font-medium border-r-4 border-blue-500'
                      : 'text-gray-600 hover:text-gray-600 hover:bg-gray-200'
                      }`}
                    onClick={closeMobileMenu}
                  >
                    <ChildIconComponent className={`w-4 h-4 mr-3 flex-shrink-0 ${isChildActive ? 'text-blue-600' : ''
                      }`} />
                    <span className={`text-xs sm:text-sm truncate ${isChildActive ? 'font-medium' : ''
                      }`}>
                      {child.title}
                    </span>
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
        className="md:hidden fixed top-2 left-2 z-[999999999999999] text-white hover:bg-gray-50 transition-colors"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <Menu className="w-8 h-8 text-white" />
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
        className={`sidebar-container flex flex-col
          ${/* Mobile styles */ ''}
          fixed md:sticky top-14 left-0 z-40 
          ${/* Width responsive */ ''}
          w-64 sm:w-72 md:w-55 lg:w-60 xl:w-60
          ${/* Height */ ''}
          h-[calc(100vh-3.5rem)]
          ${/* Background and border */ ''}
          bg-white md:bg-gray-50 border-r border-gray-200 
          ${/* Shadow */ ''}
          shadow-lg md:shadow-none
          ${/* Visibility and transitions */ ''}
          transform transition-transform duration-300 ease-in-out
          ${isMobile ?
            (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') :
            'translate-x-0'
          }
        `}
      >
        {/* Menu Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-1 sm:p-2">
          {menuData.map((item) => renderMenuItem(item))}
        </div>

        {/* Logout Button - Fixed at Bottom */}
        <div className="border-t border-gray-200 p-2 sm:p-3 bg-white md:bg-gray-50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 py-2 rounded-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0 group-hover:text-red-600" />
            <span className="font-medium text-sm sm:text-base">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;