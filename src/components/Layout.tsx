import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Package, FolderTree, User, LogOut, Menu, X } from 'lucide-react';

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-blue-600">
                  ComponentLib
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
                >
                  <Home className="w-5 h-5 mr-2" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/components"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
                >
                  <Package className="w-5 h-5 mr-2" />
                  <span>Components</span>
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
                >
                  <FolderTree className="w-5 h-5 mr-2" />
                  <span>Categories</span>
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <Link
                to="/profile"
                className="inline-flex items-center px-3 py-2 text-gray-900 hover:text-gray-600"
              >
                <User className="w-5 h-5 mr-2" />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 text-gray-900 hover:text-gray-600"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>Sign Out</span>
              </button>
            </div>
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="flex items-center px-3 py-2 text-gray-900 hover:text-gray-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="w-5 h-5 mr-2" />
              <span>Home</span>
            </Link>
            <Link
              to="/components"
              className="flex items-center px-3 py-2 text-gray-900 hover:text-gray-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Package className="w-5 h-5 mr-2" />
              <span>Components</span>
            </Link>
            <Link
              to="/categories"
              className="flex items-center px-3 py-2 text-gray-900 hover:text-gray-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FolderTree className="w-5 h-5 mr-2" />
              <span>Categories</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center px-3 py-2 text-gray-900 hover:text-gray-600 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="w-5 h-5 mr-2" />
              <span>Profile</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-gray-900 hover:text-gray-600 hover:bg-gray-50"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}