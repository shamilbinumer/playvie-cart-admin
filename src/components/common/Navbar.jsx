import { useState } from "react";
import { Search, User, X } from "lucide-react";
import SearchBar from "../layout/SearchBar";
import { useSelector } from "react-redux";

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useSelector((state) => state.auth)
  console.log(user);
  

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <>
      <nav className="bg-[#81184e] border-b border-gray-200 fixed top-0 w-full h-14 z-[99999999]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex-shrink-0 lg:w-48 ml-9 md:ml-0">
              <img src="/Images/Playviecart.png" className="w-20 h-auto" alt="" />
            </div>

            {/* Center Search Bar - Only visible on md+ screens */}
            <div className="hidden md:flex flex-1 justify-center max-w-lg mx-4">
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>

            {/* Right Side - Desktop User Profile */}
            <div className="hidden md:flex items-center space-x-4 lg:w-48 justify-end">
              <div className="flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors cursor-pointer">
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="hidden lg:block">
                  <div className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-white">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Mobile Icons - Search and User */}
            <div className="md:hidden flex items-center space-x-3">
              {/* Search Icon */}
              <button
                onClick={toggleSearch}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#6d1442] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <Search className="h-6 w-6" />
              </button>

              {/* User Icon */}
              <button className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#6d1442] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <User className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="md:hidden fixed top-14 left-0 w-full bg-white border-b border-gray-200 shadow-lg z-[99999998]">
          <div className="px-4 py-3 flex items-center space-x-3">
            <div className="flex-1">
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            <button
              onClick={toggleSearch}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}