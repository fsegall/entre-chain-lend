import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
  const { isLoggedIn, setIsLoggedIn, role, setRole } = useAuth();

  const handleRoleToggle = (checked: boolean) => {
    setRole(checked ? 'lender' : 'borrower');
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-dark border-solid border border-blockloan-teal rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-blockloan-blue mb-4">
            Welcome to ZKfinance! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            We're excited to have you on board. Let's get started with your lending journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-dark border-solid border border-blockloan-teal p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-blockloan-blue mb-4">Your Investments</h2>
            <p className="text-gray-600">No active investments yet.</p>
            <button className="mt-4 text-blockloan-teal hover:underline">
              Browse marketplace
            </button>
          </div>
          
          <div className="bg-dark border-solid border border-blockloan-teal p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-blockloan-blue mb-4">Your Loans</h2>
            <p className="text-gray-600">No active loans yet.</p>
            <button className="mt-4 text-blockloan-teal hover:underline">
              Apply for a loan
            </button>
          </div>
          
          <div className="bg-dark border-solid border border-blockloan-teal p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-blockloan-blue mb-4">Account Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Available Balance</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Invested</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Borrowed</span>
                <span className="font-medium">$0.00</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="role-toggle" className="text-gray-600">
                  Switch to {role === 'lender' ? 'Borrower' : 'Lender'} Mode
                </Label>
                <Switch
                  id="role-toggle"
                  checked={role === 'lender'}
                  onCheckedChange={handleRoleToggle}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {role === 'lender' 
                  ? "Currently in Lender mode - you can invest in loans"
                  : "Currently in Borrower mode - you can apply for loans"}
              </p>
            </div>

            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="mt-4 w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
