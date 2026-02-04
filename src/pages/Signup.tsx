import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, Users, Heart, Loader2 } from 'lucide-react';
import logoMark from '@/assets/logo-mark.png';

const roles: { value: UserRole; label: string; icon: typeof Building2; description: string }[] = [
  { value: 'restaurant', label: 'Restaurant', icon: Building2, description: 'Post surplus food for donation' },
  { value: 'ngo', label: 'NGO', icon: Users, description: 'Accept and distribute food donations' },
  { value: 'volunteer', label: 'Volunteer', icon: Heart, description: 'Help deliver food to those in need' },
];

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('restaurant');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signup(email, password, name, role);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex flex-col items-center gap-3">
            <img src={logoMark} alt="Resqmeal" className="h-16 w-16" />
            <span className="text-2xl font-bold text-foreground">Resqmeal</span>
          </Link>
        </div>

        <Card className="shadow-card-hover">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Join the food rescue movement today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                  {error}
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-3">
                <Label>I am a...</Label>
                <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <div className="grid gap-2">
                    {roles.map(({ value, label, icon: Icon, description }) => (
                      <label
                        key={value}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          role === value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <RadioGroupItem value={value} id={value} />
                        <div className={`p-2 rounded-lg ${role === value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  {role === 'restaurant' ? 'Restaurant Name' : role === 'ngo' ? 'Organization Name' : 'Full Name'}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={role === 'restaurant' ? 'Green Kitchen' : role === 'ngo' ? 'Food For All' : 'John Doe'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
