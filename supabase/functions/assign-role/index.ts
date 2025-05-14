
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
    }});
  }

  try {
    const { user_id, role_name } = await req.json();
    
    if (!user_id || !role_name) {
      return new Response(
        JSON.stringify({ error: 'user_id and role_name are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create Supabase admin client (uses service role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Check if user already has this role
    const { data: existingRole, error: checkError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', user_id)
      .eq('role', role_name)
      .maybeSingle();
      
    if (checkError) {
      return new Response(
        JSON.stringify({ error: `Error checking role: ${checkError.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // If user already has the role, return success
    if (existingRole) {
      return new Response(
        JSON.stringify({ message: `User already has role: ${role_name}` }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Insert the new role
    const { error: insertError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id, role: role_name });
    
    if (insertError) {
      return new Response(
        JSON.stringify({ error: `Error assigning role: ${insertError.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ message: `Successfully assigned role: ${role_name}` }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
