import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import LoanCard, { LoanProps } from "@/components/LoanCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { handleApiError } from "@/hooks/use-toast";
import Web3AuthInstructions from "@/components/wallet/Web3AuthInstructions";
import { useWeb3Auth } from "@/hooks/useWeb3Auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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

  // Get the configError and domainError from useWeb3Auth
  const { configError, domainError } = useWeb3Auth();
  
  console.log("Web3Auth state:", { 
    configError: configError ? "Error present" : "No error",
    domainError
  });

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
      
      {/* Show technical error alert about RPC issues */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-4 sticky top-16 z-40">
        <Alert variant="warning" className="border-amber-300 max-w-4xl mx-auto">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <AlertTitle className="text-lg text-amber-800">Web3Auth RPC Provider Updated</AlertTitle>
          <AlertDescription className="text-amber-800">
            <p className="mb-3">The RPC provider has been updated to use a public Goerli testnet endpoint instead of Infura to resolve unauthorized access errors.</p>
            <p>You still need to whitelist your domain in the Web3Auth dashboard as explained below.</p>
          </AlertDescription>
        </Alert>
      </div>
      
      {/* Show domain error alert prominently at the top if domain error exists */}
      {domainError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-4 sticky top-32 z-40">
          <Alert variant="destructive" className="border-red-300 max-w-4xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-lg">Domain Not Whitelisted</AlertTitle>
            <AlertDescription>
              <p className="mb-3">Your domain (<code className="bg-red-100 px-1 py-0.5 rounded">{window.location.origin}</code>) needs to be added to Web3Auth's allowed list.</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => window.open("https://dashboard.web3auth.io/", "_blank")}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Go to Web3Auth Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-300 text-red-700"
                  onClick={() => {
                    const text = window.location.origin;
                    navigator.clipboard.writeText(text);
                    alert("Domain copied to clipboard!");
                  }}
                >
                  Copy Your Domain
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Always show Web3Auth instructions if there's a configuration error or domain error */}
      {(configError || domainError) && (
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Web3Auth Configuration Required</h2>
            <Web3AuthInstructions />
          </div>
        </div>
      )}
      
      {/* Always show Hero and Features sections regardless of errors */}
      <Hero />
      <Features />
      
      {/* Featured Loans Section - always show */}
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
      
      {/* CTA Section - always show */}
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
