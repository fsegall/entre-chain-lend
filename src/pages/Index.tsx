import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import LoanCard, { LoanProps } from "@/components/LoanCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { handleApiError } from "@/hooks/use-toast";
import Web3AuthInstructions from "@/components/wallet/Web3AuthInstructions";
import { useWeb3Auth } from "@/hooks/useWeb3Auth";

const Index = () => {
  console.log("Index page rendering");
  
  // Sample featured loans
  const [featuredLoans, setFeaturedLoans] = useState<LoanProps[]>([
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
  ]);

  // Add the configError from useWeb3Auth
  const { configError } = useWeb3Auth();

  useEffect(() => {
    // Any API calls that might be causing the error should be wrapped in try/catch
    const fetchData = async () => {
      try {
        console.log("Safely initializing application data");
        // If you're making API calls here, they should be wrapped in try/catch
        // For example:
        // const response = await fetch('/api/data');
        // const data = await response.json();
        // setFeaturedLoans(data);
      } catch (error) {
        handleApiError(error, "Failed to load application data");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      
      {/* Display Web3Auth instructions if there's a configuration error */}
      {configError && <Web3AuthInstructions />}
      
      {/* Featured Loans Section */}
      <section className="py-16 bg-white">
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
            {featuredLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blockloan-blue to-blockloan-teal py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Join our platform to connect with investors who believe in your vision or become a lender to support small business innovation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-blockloan-blue hover:bg-gray-100">
              Apply for Business Loan
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Become a Lender
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
