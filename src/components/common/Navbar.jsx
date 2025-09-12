import { useState } from "react";
import { Menu, X, User } from "lucide-react";
import SearchBar from "../layout/SearchBar";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-[#81184e] border-b border-gray-200 fixed top-0 w-full h-14 z-[99999999]">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0 lg:w-48">
            <img src="/Images/Playviecart.png" className="w-20 h-auto" alt="" />
          </div>

          {/* Center Search Bar - Only visible on md+ screens */}
          <div className="hidden md:flex flex-1 justify-center max-w-lg mx-4">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>

          {/* Right Side - User Profile */}
          <div className="hidden md:flex items-center space-x-4 lg:w-48 justify-end">
            <div className="flex items-center space-x-3  rounded-lg px-3 py-2 transition-colors cursor-pointer">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="hidden lg:block">
                <div className="text-sm font-medium text-white">John Doe</div>
                <div className="text-xs text-white">john@example.com</div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            {/* ✅ Reusing the same SearchBar component */}
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            {/* Mobile User Profile */}
            <div className="flex items-center space-x-3  rounded-lg px-3 py-3">
              <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">John Doe</div>
                <div className="text-xs text-gray-500">john@example.com</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
