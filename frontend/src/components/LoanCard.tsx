
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarIcon, Clock, InfoIcon, UserIcon } from "lucide-react";

export type LoanProps = {
  id: string;
  title: string;
  borrower: string;
  amount: number;
  funded: number;
  interestRate: number;
  term: number;
  category: string;
  riskScore: "A+" | "A" | "B+" | "B" | "C" | "D";
  deadline: string;
};

const getRiskColor = (risk: string) => {
  const riskColors = {
    "A+": "bg-green-500",
    "A": "bg-green-400",
    "B+": "bg-blue-500",
    "B": "bg-blue-400",
    "C": "bg-yellow-500",
    "D": "bg-red-500",
  };
  return riskColors[risk as keyof typeof riskColors] || "bg-gray-500";
};

const getCategoryColor = (category: string) => {
  const categoryColors = {
    "Retail": "bg-blue-100 text-blue-800",
    "Tech": "bg-purple-100 text-purple-800",
    "Food": "bg-green-100 text-green-800",
    "Service": "bg-yellow-100 text-yellow-800",
    "Manufacturing": "bg-orange-100 text-orange-800",
  };
  return categoryColors[category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800";
};

const LoanCard = ({ loan }: { loan: LoanProps }) => {
  const fundingPercentage = Math.floor((loan.funded / loan.amount) * 100);
  
  return (
    <Card className="overflow-hidden card-hover">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-blockloan-blue">{loan.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <UserIcon className="h-3 w-3 mr-1" />
              {loan.borrower}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`h-8 w-8 rounded-full ${getRiskColor(loan.riskScore)} text-white flex items-center justify-center font-semibold`}>
                  {loan.riskScore}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Risk Score: {loan.riskScore}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-3">
          <Badge className={`${getCategoryColor(loan.category)}`}>
            {loan.category}
          </Badge>
          <div className="flex items-center text-xs text-gray-500">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>{loan.term} months</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Amount</p>
            <p className="font-medium">${loan.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Interest</p>
            <p className="font-medium">{loan.interestRate}% APR</p>
          </div>
          <div>
            <div className="flex items-center">
              <p className="text-xs text-gray-500 mb-1">Expires</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-3 w-3 ml-1 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Funding deadline</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1 text-gray-500" />
              <p className="font-medium text-sm">{loan.deadline}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Funding Progress</span>
            <span className="font-medium">{fundingPercentage}%</span>
          </div>
          <Progress value={fundingPercentage} className="h-2" />
        </div>
        
        <div className="text-xs text-gray-500 flex justify-between">
          <span>Funded: ${loan.funded.toLocaleString()}</span>
          <span>Goal: ${loan.amount.toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-blockloan-teal hover:bg-blockloan-teal/90">Fund This Loan</Button>
      </CardFooter>
    </Card>
  );
};

export default LoanCard;
