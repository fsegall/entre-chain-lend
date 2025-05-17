import { supabase } from "@/integrations/supabase/client";

// Cache for profile data
const profileCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

// Cache TTL in milliseconds (5 seconds)
const CACHE_TTL = 5000;

export const fetchUserProfile = async (userId: string) => {
  try {
    // Check cache first
    const cached = profileCache.get(userId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      console.log("Using cached profile for user:", userId);
      return cached.data;
    }
    
    console.log("Fetching profile for user:", userId);
    
    // Get the user's profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error("Profile fetch error:", profileError);
      throw profileError;
    }
    
    // Get user's roles
    const { data: roles, error: rolesError } = await supabase
      .rpc('get_user_roles', { _user_id: userId });
      
    if (rolesError) {
      console.error("Roles fetch error:", rolesError);
      throw rolesError;
    }
    
    const result = { profile, roles: roles || [] };
    
    // Update cache
    profileCache.set(userId, {
      data: result,
      timestamp: now
    });
    
    console.log("Fetched profile and roles:", result);
    
    return result;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Clear cache for a specific user
export const clearProfileCache = (userId: string) => {
  profileCache.delete(userId);
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
      
    if (error) throw error;
    
    // Clear cache after update
    clearProfileCache(userId);
    
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
