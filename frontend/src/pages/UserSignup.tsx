import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";

const UserSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password });
      toast({ title: "Account created! Please login." });
      navigate("/login");
    } catch (err: any) {
      toast({ title: err.response?.data?.message || "Signup failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full gradient-emergency flex items-center justify-center mb-4 glow-red">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join SOSGuard for silent protection</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="h-11 bg-secondary border-border"
          />
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="h-11 bg-secondary border-border"
          />
          <div className="relative">
            <Input
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="h-11 bg-secondary border-border pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Input
            type="password"
            placeholder="Confirm Password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
            className="h-11 bg-secondary border-border"
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 gradient-emergency border-0 font-bold text-base"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-emergency hover:underline font-medium">
            Login
          </Link>
        </p>
        <Link
          to="/"
          className="block text-center text-xs text-muted-foreground/50 mt-4 hover:text-muted-foreground transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
};

export default UserSignup;
