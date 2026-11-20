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
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Auto-open parent menus when child is active
  useEffect(() => {
    const currentPath = location.pathname;
    const newOpenMenus = { ...openMenus };

    menuData.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) =>
            child.url === currentPath ||
            currentPath.startsWith(child.url + "/")
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
      if (
        isMobile &&
        isMobileMenuOpen &&
        !event.target.closest(".sidebar-container")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isMobileMenuOpen]);

  const isPathActive = (url) => {
    return (
      location.pathname === url || location.pathname.startsWith(url + "/")
    );
  };

  const hasActiveChild = (item) => {
    if (!item.children) return false;
    return item.children.some((child) => isPathActive(child.url));
  };

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
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
      text: "You'll be logged out from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ac1f67",
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
      <div key={item.id}>
        {/* Parent Menu Item */}
        <div
          className="flex items-center justify-between p-3 py-2 rounded-md cursor-pointer transition-all duration-200"
          style={
            hasChildren
              ? isParentActive
                ? {
                    background: "linear-gradient(135deg, rgba(172,31,103,0.12), rgba(60,135,200,0.10))",
                    color: "#ac1f67",
                    borderLeft: "4px solid #ac1f67",
                  }
                : { color: "#4a5568" }
              : isDirectActive
              ? {
                  background: "linear-gradient(135deg, rgba(172,31,103,0.12), rgba(60,135,200,0.10))",
                  color: "#ac1f67",
                  borderLeft: "4px solid #ac1f67",
                }
              : { color: "#4a5568" }
          }
          onMouseEnter={(e) => {
            if (
              !(hasChildren ? isParentActive : isDirectActive)
            ) {
              e.currentTarget.style.backgroundColor = "rgba(172,31,103,0.06)";
            }
          }}
          onMouseLeave={(e) => {
            if (
              !(hasChildren ? isParentActive : isDirectActive)
            ) {
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
          onClick={() => (hasChildren ? toggleMenu(item.id) : null)}
        >
          {hasChildren ? (
            <div className="flex items-center flex-1">
              <IconComponent
                className="w-5 h-5 mr-3 flex-shrink-0"
                style={{ color: isParentActive ? "#ac1f67" : "#6b7280" }}
              />
              <span
                className="text-sm sm:text-base truncate"
                style={{
                  fontWeight: isParentActive ? "700" : "500",
                  color: isParentActive ? "#ac1f67" : "inherit",
                }}
              >
                {item.title}
              </span>
            </div>
          ) : (
            <Link
              to={item.url}
              className="flex items-center flex-1"
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={closeMobileMenu}
            >
              <IconComponent
                className="w-5 h-5 mr-3 flex-shrink-0"
                style={{ color: isDirectActive ? "#ac1f67" : "#6b7280" }}
              />
              <span
                className="text-sm sm:text-base truncate"
                style={{
                  fontWeight: isDirectActive ? "700" : "500",
                  color: isDirectActive ? "#ac1f67" : "inherit",
                }}
              >
                {item.title}
              </span>
            </Link>
          )}

          {hasChildren && (
            <ChevronDown
              className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
              style={{ color: isParentActive ? "#ac1f67" : "#9ca3af" }}
            />
          )}
        </div>

        {/* Children Menu Items */}
        {hasChildren && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
                    className="flex items-center p-2 rounded-md transition-all duration-200"
                    style={
                      isChildActive
                        ? {
                            background: "rgba(60,135,200,0.10)",
                            color: "#3c87c8",
                            fontWeight: "600",
                            borderRight: "4px solid #3c87c8",
                            textDecoration: "none",
                          }
                        : {
                            color: "#6b7280",
                            textDecoration: "none",
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isChildActive) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(60,135,200,0.06)";
                        e.currentTarget.style.color = "#3c87c8";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isChildActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#6b7280";
                      }
                    }}
                    onClick={closeMobileMenu}
                  >
                    <ChildIconComponent
                      className="w-4 h-4 mr-3 flex-shrink-0"
                      style={{
                        color: isChildActive ? "#3c87c8" : "#9ca3af",
                      }}
                    />
                    <span className="text-xs sm:text-sm truncate">
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
        className="md:hidden fixed top-2 left-2 z-[999999999999999] hover:opacity-80 transition-opacity"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
        style={{ color: "white", background: "transparent", border: "none" }}
      >
        {isMobileMenuOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <Menu className="w-8 h-8" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ backgroundColor: "rgba(172,31,103,0.15)" }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-container flex flex-col
          fixed md:sticky top-14 left-0 z-40 
          w-64 sm:w-72 md:w-55 lg:w-60 xl:w-60
          h-[calc(100vh-3.5rem)]
          border-r shadow-lg md:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${
            isMobile
              ? isMobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          }
        `}
        style={{
          backgroundColor: "#fefefe",
          borderColor: "rgba(172,31,103,0.15)",
        }}
      >
        {/* Top Accent Bar */}
        <div
          className="h-1 w-full flex-shrink-0"
          style={{
            background: "linear-gradient(90deg, #ac1f67, #3c87c8, #f3911f)",
          }}
        />

        {/* Menu Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-1 sm:p-2">
          {menuData.map((item) => renderMenuItem(item))}
        </div>

        {/* Logout Button - Fixed at Bottom */}
        <div
          className="p-2 sm:p-3"
          style={{
            borderTop: "1px solid rgba(172,31,103,0.15)",
            backgroundColor: "#fefefe",
          }}
        >
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 py-2 rounded-md transition-all duration-200 group"
            style={{
              color: "#6b7280",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(172,31,103,0.08)";
              e.currentTarget.style.color = "#ac1f67";
              const icon = e.currentTarget.querySelector(".logout-icon");
              if (icon) icon.style.color = "#ac1f67";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#6b7280";
              const icon = e.currentTarget.querySelector(".logout-icon");
              if (icon) icon.style.color = "#6b7280";
            }}
          >
            <LogOut
              className="w-5 h-5 mr-3 flex-shrink-0 logout-icon"
              style={{ color: "#6b7280" }}
            />
            <span className="font-medium text-sm sm:text-base">Logout</span>
          </button>
        </div>

        {/* Bottom Accent Bar */}
        <div
          className="h-1 w-full flex-shrink-0"
          style={{
            background: "linear-gradient(90deg, #f3911f, #3c87c8, #ac1f67)",
          }}
        />
      </div>
    </>
  );
};

export default Sidebar;