
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import WalletConnect from "./WalletConnect";
import RoleSwitcher from "./RoleSwitcher";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blockloan-blue">
                ZK<span className="text-blockloan-teal">finance</span>
              </span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-blockloan-blue hover:text-blockloan-teal">
                  Home
                </Link>
                <Link to="/loans" className="px-3 py-2 rounded-md text-sm font-medium text-blockloan-gray hover:text-blockloan-teal">
                  Marketplace
                </Link>
                <Link to="/about" className="px-3 py-2 rounded-md text-sm font-medium text-blockloan-gray hover:text-blockloan-teal">
                  How It Works
                </Link>
                {user && (
                  <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-blockloan-gray hover:text-blockloan-teal">
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-4">
              {user && <RoleSwitcher />}
              <WalletConnect />
              
              {user ? (
                <Button 
                  variant="outline" 
                  className="border-blockloan-teal text-blockloan-teal hover:bg-blockloan-teal/10"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="border-blockloan-teal text-blockloan-teal hover:bg-blockloan-teal/10"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="bg-blockloan-blue text-white hover:bg-blockloan-blue/90"
                    onClick={() => navigate('/signup')}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blockloan-gray hover:text-blockloan-blue focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-blockloan-blue hover:text-blockloan-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/loans" 
              className="block px-3 py-2 rounded-md text-base font-medium text-blockloan-gray hover:text-blockloan-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link 
              to="/about" 
              className="block px-3 py-2 rounded-md text-base font-medium text-blockloan-gray hover:text-blockloan-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className="block px-3 py-2 rounded-md text-base font-medium text-blockloan-gray hover:text-blockloan-teal"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <div className="pt-4 flex flex-col gap-2">
              {user && <RoleSwitcher />}
              <WalletConnect />
              
              {user ? (
                <Button 
                  variant="outline" 
                  className="border-blockloan-teal text-blockloan-teal w-full"
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="border-blockloan-teal text-blockloan-teal w-full"
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="bg-blockloan-blue text-white w-full"
                    onClick={() => {
                      navigate('/signup');
                      setIsMenuOpen(false);
                    }}
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
