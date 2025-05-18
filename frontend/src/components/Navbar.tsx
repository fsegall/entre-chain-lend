import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import DarkModeToggle from "./DarkModeToggle";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import WalletConnect from './wallet/WalletConnect';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, role, setRole } = useAuth();

  const handleSignOut = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleRoleToggle = (checked: boolean) => {
    setRole(checked ? 'lender' : 'borrower');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 dark:bg-[#0F0F10] dark:border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blockloan-blue dark:text-white">
                ZK<span className="text-blockloan-teal dark:text-blockloan-gold">finance</span>
              </span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-blockloan-blue hover:text-blockloan-teal dark:text-white dark:hover:text-blockloan-gold">
                  Home
                </Link>
                <Link to="/loans" className="px-3 py-2 rounded-md text-sm font-medium text-blockloan-gray hover:text-blockloan-teal dark:text-gray-300 dark:hover:text-blockloan-gold">
                  Marketplace
                </Link>
                <Link to="/about" className="px-3 py-2 rounded-md text-sm font-medium text-blockloan-gray hover:text-blockloan-teal dark:text-gray-300 dark:hover:text-blockloan-gold">
                  How It Works
                </Link>
                {isLoggedIn && (
                  <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-blockloan-gray hover:text-blockloan-teal dark:text-gray-300 dark:hover:text-blockloan-gold">
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <DarkModeToggle />
            <WalletConnect />
            {isLoggedIn && (
              <div className="flex items-center space-x-2 mr-4">
                <Label htmlFor="role-toggle" className="text-sm text-gray-600 dark:text-gray-300">
                  {role === 'lender' ? 'Lender' : 'Borrower'}
                </Label>
                <Switch
                  id="role-toggle"
                  checked={role === 'lender'}
                  onCheckedChange={handleRoleToggle}
                />
              </div>
            )}
            {isLoggedIn ? (
              <Button 
                variant="outline" 
                className="border-blockloan-teal text-blockloan-teal dark:border-blockloan-gold dark:text-blockloan-gold"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="border-blockloan-teal text-blockloan-teal dark:border-blockloan-gold dark:text-blockloan-gold"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-blockloan-blue text-white dark:bg-blockloan-teal"
                  onClick={() => navigate('/signup')}
                >
                  Register
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blockloan-teal dark:hover:bg-gray-800"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-blockloan-blue hover:text-blockloan-teal dark:text-white dark:hover:text-blockloan-gold"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/loans"
              className="block px-3 py-2 rounded-md text-base font-medium text-blockloan-gray hover:text-blockloan-teal dark:text-gray-300 dark:hover:text-blockloan-gold"
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-blockloan-gray hover:text-blockloan-teal dark:text-gray-300 dark:hover:text-blockloan-gold"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            {isLoggedIn && (
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-blockloan-gray hover:text-blockloan-teal dark:text-gray-300 dark:hover:text-blockloan-gold"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-5">
              <DarkModeToggle />
            </div>
            <div className="mt-3 px-2 space-y-1">
              <WalletConnect />
              {isLoggedIn && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="role-toggle-mobile" className="text-sm text-gray-600 dark:text-gray-300">
                    {role === 'lender' ? 'Lender' : 'Borrower'}
                  </Label>
                  <Switch
                    id="role-toggle-mobile"
                    checked={role === 'lender'}
                    onCheckedChange={handleRoleToggle}
                  />
                </div>
              )}
              {isLoggedIn ? (
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-blockloan-teal text-blockloan-teal dark:border-blockloan-gold dark:text-blockloan-gold"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 border-blockloan-teal text-blockloan-teal dark:border-blockloan-gold dark:text-blockloan-gold"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="w-full mt-2 bg-blockloan-blue text-white dark:bg-blockloan-teal"
                    onClick={() => navigate('/signup')}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
