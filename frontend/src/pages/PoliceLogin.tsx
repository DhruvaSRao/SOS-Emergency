import React, { useState } from "react";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const PoliceLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Invalid credentials"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-emergency glow-red mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            SOS<span className="text-emergency">Dispatch</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Emergency Response Command Center
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Officer Login
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Authorized personnel only
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-emergency/10 border border-emergency/20">
              <AlertTriangle className="h-4 w-4 text-emergency shrink-0" />
              <p className="text-xs text-emergency">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-muted-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="officer@police.gov"
                required
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                required
                className="bg-secondary border-border"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-emergency text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Access Dashboard
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6 font-mono">
          SECURE • ENCRYPTED • AUTHORIZED ACCESS ONLY
        </p>
      </div>
    </div>
  );
};

export default PoliceLogin;
