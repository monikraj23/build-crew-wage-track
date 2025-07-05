<<<<<<< HEAD
// src/pages/LoginPage.tsx
=======
>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
<<<<<<< HEAD
=======
import { useToast } from "@/hooks/use-toast";
>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Login failed: " + error.message);
    } else {
      navigate("/"); // Redirect to daily entry form
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-8 bg-white rounded shadow w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold text-center">Supervisor Login</h1>
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button className="w-full bg-blue-600" onClick={handleLogin}>
          Login
=======
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md space-y-5">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Supervisor Login
        </h1>

        <div className="space-y-2">
          <label className="text-sm text-gray-700 font-medium">Email</label>
          <Input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-700 font-medium">Password</label>
          <Input
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
>>>>>>> 9f4c065 (Updated dashboard UI and added cost/worker metrics)
        </Button>
      </div>
    </div>
  );
}