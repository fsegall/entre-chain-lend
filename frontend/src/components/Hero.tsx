
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blockloan-blue/5 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              <span className="block">Blockchain-Powered</span>
              <span className="gradient-text block">Business Lending</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-lg">
              Connect with lenders who believe in your small business vision. Secure transparent funding through our blockchain-powered platform.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-blockloan-blue text-white hover:bg-opacity-90">
                Apply for Funding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-blockloan-teal text-blockloan-teal hover:bg-blockloan-teal/10">
                Become a Lender
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6">
              {[
                { icon: Shield, label: "Secure Transactions", value: "100%" },
                { icon: Users, label: "Active Users", value: "5,000+" },
                { icon: BarChart3, label: "Funded in 2023", value: "$12M+" }
              ].map((stat, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blockloan-blue/10 text-blockloan-blue">
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-blockloan-blue">{stat.value}</div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-blockloan-teal/10 rounded-full blur-3xl"></div>
            <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-blockloan-blue text-lg">Smart Loan Contract</h3>
                  <p className="text-sm text-gray-500">Transparent & Secure</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Principal Amount</span>
                    <span className="text-sm font-medium">25,000 USDC</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Interest Rate</span>
                    <span className="text-sm font-medium">5.2% APR</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Term Length</span>
                    <span className="text-sm font-medium">24 months</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Monthly Payment</span>
                    <span className="text-sm font-medium">1,098 USDC</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button className="w-full bg-blockloan-blue">View Contract Details</Button>
              </div>
              
              <div className="mt-4 text-center">
                <span className="text-xs text-gray-400">Secured by Ethereum Smart Contract</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
