
import { CheckCircle, LockIcon, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: <LockIcon className="h-10 w-10 text-blockloan-blue dark:text-white" />,
      title: "Secure Smart Contracts",
      description: "Our EVM-compatible smart contracts ensure secure, transparent, and tamper-proof loan agreements between parties."
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-blockloan-teal" />,
      title: "Competitive Interest Rates",
      description: "Access better rates than traditional banks due to our reduced overhead and peer-to-peer lending structure."
    },
    {
      icon: <Zap className="h-10 w-10 text-blockloan-gold" />,
      title: "Fast Approval Process",
      description: "Get funds quickly with our streamlined approval process, typically within 48-72 hours upon verification."
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-green-500" />,
      title: "Flexible Loan Terms",
      description: "Choose from a variety of loan terms and conditions that best suit your small business needs."
    }
  ];

  return (
    <div className="bg-blockloan-light py-16 md:py-24 dark:bg-[#0F0F10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-blockloan-blue mb-4 dark:text-white">Why Choose BlockLoan?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Our platform leverages blockchain technology to create a transparent, efficient, and secure environment for small business lending.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="card-hover border-t-4 border-t-blockloan-teal dark:bg-gray-900">
              <CardHeader className="pb-2">
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl font-bold dark:text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-20 bg-gradient-to-r from-blockloan-blue to-blockloan-teal rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">How Our Blockchain Lending Works</h3>
              <p className="mb-6">
                Our platform utilizes smart contracts on the Ethereum blockchain to create transparent, 
                immutable loan agreements that protect both borrowers and lenders.
              </p>
              
              <div className="space-y-4">
                {[
                  "Borrowers create loan requests with their terms and business information",
                  "Lenders browse available opportunities and fund loans that match their criteria",
                  "Smart contracts automatically manage repayment schedules and interest",
                  "All transactions are recorded immutably on the blockchain for transparency"
                ].map((step, i) => (
                  <div key={i} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white text-blockloan-blue flex items-center justify-center mr-3">
                      <span className="font-bold text-sm">{i+1}</span>
                    </div>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <h4 className="font-bold text-lg mb-4">Platform Benefits</h4>
              <ul className="space-y-3">
                {[
                  "Lower fees than traditional banking",
                  "No intermediaries or hidden charges",
                  "Automated compliance and reduced paperwork",
                  "Global access to capital and investors",
                  "Complete transparency of all transactions",
                  "Immutable record of all agreements"
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-blockloan-gold" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
