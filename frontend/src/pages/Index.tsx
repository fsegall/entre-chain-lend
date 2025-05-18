import { useState, useEffect, useCallback, memo } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import LoanCard, { LoanProps } from "@/components/LoanCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { handleApiError } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/UnifiedAuthProvider";

// Memoize the featured loans data
const FEATURED_LOANS: LoanProps[] = [
  {
    id: "loan1",
    title: "TechGrow Software Development",
    borrower: "TechGrow Inc.",
    amount: 50000,
    funded: 32500,
    interestRate: 5.8,
    term: 24,
    category: "Tech",
    riskScore: "A",
    deadline: "5 days"
  },
  {
    id: "loan2",
    title: "Fresh Eats Cafe Expansion",
    borrower: "Fresh Eats LLC",
    amount: 35000,
    funded: 15750,
    interestRate: 6.2,
    term: 18,
    category: "Food",
    riskScore: "B+",
    deadline: "3 days"
  },
  {
    id: "loan3",
    title: "Urban Apparel Manufacturing",
    borrower: "Urban Styles Co.",
    amount: 75000,
    funded: 52500,
    interestRate: 7.1,
    term: 36,
    category: "Manufacturing",
    riskScore: "B",
    deadline: "7 days"
  }
];

// Memoize the LoanCard component
const MemoizedLoanCard = memo(LoanCard);

const Index = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    // Any API calls that might be causing the error should be wrapped in try/catch
    const fetchData = async () => {
      try {
        console.log("Safely initializing application data");
        // If you're making API calls here, they should be wrapped in try/catch
      } catch (error) {
        handleApiError(error, "Failed to load application data");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero and Features sections */}
      <Hero />
      <Features />
      
      {/* Featured Loans Section */}
      <section className="py-16 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-blockloan-blue">Featured Loan Opportunities</h2>
              <p className="text-gray-600 mt-2">Browse some of our top small business funding opportunities</p>
            </div>
            <Link to="/loans">
              <Button variant="outline" className="border-blockloan-blue text-blockloan-blue">
                View All Loans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_LOANS.map((loan) => (
              <MemoizedLoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-blockloan-blue mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our platform today and start your journey in decentralized lending and borrowing.
          </p>
          <div className="flex justify-center gap-4">
            {!isLoggedIn ? (
              <>
                <Button 
                  variant="outline" 
                  className="border-blockloan-teal text-blockloan-teal"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-blockloan-blue text-white"
                  onClick={() => navigate('/signup')}
                >
                  Register
                </Button>
              </>
            ) : (
              <Button 
                className="bg-blockloan-blue text-white"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
