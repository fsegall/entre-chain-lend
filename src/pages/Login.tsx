import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // TODO: Add actual login logic here
      console.log("Logging in with:", { email, password });
      
      // For now, just set logged in to true
      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-blockloan-blue dark:text-white">
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a
                  href="/forgot-password"
                  className="font-medium text-blockloan-teal hover:text-blockloan-teal/80 dark:text-blockloan-gold dark:hover:text-blockloan-gold/80"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blockloan-blue text-white hover:bg-blockloan-blue/90 dark:bg-blockloan-teal dark:hover:bg-blockloan-teal/90"
            >
              Sign in
            </Button>

            <div className="text-center text-sm">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-medium text-blockloan-teal hover:text-blockloan-teal/80 dark:text-blockloan-gold dark:hover:text-blockloan-gold/80"
              >
                Sign up
              </a>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
