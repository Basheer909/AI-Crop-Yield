import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Sprout, Loader2, Wheat, Sun, Cloud } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account Exists",
            description: "This email is already registered. Please login instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Account Created!",
        description: "Welcome to AI Crop Yield Optimizer. You can now start using the app.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-mesh" />
      <div className="absolute inset-0 bg-background/40" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 opacity-20 animate-float">
        <Wheat className="h-24 w-24 text-primary" />
      </div>
      <div className="absolute top-40 right-20 opacity-15 animate-float" style={{ animationDelay: '2s' }}>
        <Sun className="h-32 w-32 text-accent" />
      </div>
      <div className="absolute bottom-32 left-1/4 opacity-15 animate-float" style={{ animationDelay: '4s' }}>
        <Cloud className="h-20 w-20 text-agricultural-sky" />
      </div>
      <div className="absolute bottom-20 right-1/4 opacity-20 animate-float" style={{ animationDelay: '1s' }}>
        <Sprout className="h-16 w-16 text-primary" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <Card className="shadow-strong border-0 bg-card/95 backdrop-blur-sm overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-1.5 bg-gradient-hero" />
            
            <CardHeader className="text-center space-y-6 pt-8 pb-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-soft" />
                  <div className="relative p-4 bg-gradient-primary rounded-2xl shadow-glow">
                    <Sprout className="h-10 w-10 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-display font-bold text-gradient-hero">
                  AI Crop Yield Optimizer
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Maximize your harvest with intelligent predictions
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50 rounded-xl">
                  <TabsTrigger 
                    value="login" 
                    className="rounded-lg font-medium data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="rounded-lg font-medium data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-6 animate-fade-in">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium text-foreground">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="farmer@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        required
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium text-foreground">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        required
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold rounded-xl shadow-glow hover:shadow-strong transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-6 animate-fade-in">
                  <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium text-foreground">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-12 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="farmer@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        required
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        required
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold rounded-xl shadow-glow hover:shadow-strong transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Feature highlights */}
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl">🌾</div>
                    <p className="text-xs text-muted-foreground">AI Predictions</p>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl">📊</div>
                    <p className="text-xs text-muted-foreground">Smart Analytics</p>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl">🌤️</div>
                    <p className="text-xs text-muted-foreground">Weather Data</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;