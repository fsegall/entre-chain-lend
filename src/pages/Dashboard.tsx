
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, loading, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isRoleSelectionVisible, setIsRoleSelectionVisible] = useState(false);
  
  useEffect(() => {
    console.log("Dashboard useEffect running with user:", user);
    
    if (!loading && !user) {
      console.log("No user found, redirecting to login");
      navigate("/login");
      return;
    }
    
    // Determine if we should show role selection
    if (user) {
      console.log("User data for role detection:", {
        id: user.id,
        roles: user.roles,
        role_selection: user.role_selection,
        is_onboarded: user.is_onboarded
      });
      
      // Show role selection if ANY of these conditions are true:
      // 1. User has visitor role
      // 2. User has no role_selection set
      // 3. User is not onboarded (is_onboarded is explicitly false)
      const hasVisitorRole = user.roles && user.roles.includes('visitor');
      const noRoleSelected = !user.role_selection;
      const needsOnboarding = user.is_onboarded === false;
      
      console.log("Role selection criteria:", {
        hasVisitorRole,
        noRoleSelected,
        needsOnboarding
      });
      
      const shouldShowRoleSelection = hasVisitorRole || noRoleSelected || needsOnboarding;
      
      console.log("Should show role selection:", shouldShowRoleSelection);
      setIsRoleSelectionVisible(shouldShowRoleSelection);
    }
  }, [user, loading, navigate]);

  const handleRoleSelection = async (role: 'lender' | 'borrower') => {
    if (!user) return;
    
    try {
      console.log("Setting user role to:", role);
      
      // Update profile with role selection
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role_selection: role,
          is_onboarded: true 
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Insert the new role (lender or borrower)
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: user.id,
          role: role 
        });
        
      if (roleError) throw roleError;
      
      // Remove the visitor role
      const { error: removeError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id)
        .eq('role', 'visitor');
        
      if (removeError) throw removeError;
      
      // Refresh user profile to get updated roles
      await refreshUserProfile();
      
      // Hide role selection UI
      setIsRoleSelectionVisible(false);
      
      toast.success(`You are now registered as a ${role}!`);
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error.message || "Failed to update your role");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blockloan-blue"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-blockloan-blue mb-6">
          Welcome, {user?.full_name || user?.email}
        </h1>
        
        {isRoleSelectionVisible && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-blockloan-blue mb-4">Complete Your Profile</h2>
            <p className="text-gray-600 mb-6">
              Please select your role on the BlockLoan platform to continue:
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <Button 
                size="lg"
                onClick={() => handleRoleSelection('lender')}
                className="bg-green-600 hover:bg-green-700"
              >
                I want to be a Lender
              </Button>
              <Button 
                size="lg"
                onClick={() => handleRoleSelection('borrower')}
                variant="outline"
                className="border-blockloan-blue text-blockloan-blue"
              >
                I want to be a Borrower
              </Button>
            </div>
          </div>
        )}
        
        {!isRoleSelectionVisible && (
          // Regular dashboard content for users who have selected a role
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blockloan-blue mb-4">Your Investments</h2>
              <p className="text-gray-600">No active investments yet.</p>
              <button className="mt-4 text-blockloan-teal hover:underline">
                Browse marketplace
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blockloan-blue mb-4">Your Loans</h2>
              <p className="text-gray-600">No active loans yet.</p>
              <button className="mt-4 text-blockloan-teal hover:underline">
                Apply for a loan
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
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
                <div className="pt-2 mt-2 border-t">
                  <span className="text-gray-600">Your Role:</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {user?.role_selection || "User"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
