import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const RoleSwitcher = () => {
  const { user, refreshUserProfile, setUserRole } = useAuth();
  const [isLender, setIsLender] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      
      try {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
          
        const hasLenderRole = roles?.some(r => r.role === 'lender');
        setIsLender(hasLenderRole);
      } catch (error) {
        console.error("Error checking role:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkRole();
  }, [user]);

  const handleRoleChange = async (checked: boolean) => {
    if (!user) return;
    
    try {
      const newRole = checked ? 'lender' : 'borrower';
      await setUserRole(newRole);
      setIsLender(checked);
      await refreshUserProfile();
    } catch (error: any) {
      console.error("Error updating role:", error);
      // Revert the switch if there was an error
      setIsLender(!checked);
    }
  };

  if (!user || isLoading) return null;

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="role-switch" className="text-sm text-gray-600">
        {isLender ? 'Lender' : 'Borrower'}
      </Label>
      <Switch
        id="role-switch"
        checked={isLender}
        onCheckedChange={handleRoleChange}
        className="data-[state=checked]:bg-blockloan-blue"
      />
    </div>
  );
};

export default RoleSwitcher; 