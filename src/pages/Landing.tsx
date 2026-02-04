import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Building2, Users, Heart, ArrowRight, Leaf, TrendingUp } from 'lucide-react';
import logoFull from '@/assets/logo-full.png';
import logoMark from '@/assets/logo-mark.png';

// Mock public stats - in real app, fetch from /api/impact/public
const publicStats = {
  mealsSaved: 124892,
  foodSavedKg: 87420,
  co2Reduced: 218550,
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoMark} alt="Resqmeal" className="h-9 w-9" />
            <span className="text-xl font-bold text-foreground">Resqmeal</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container relative z-10 py-20 md:py-32">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 animate-fade-in">
              <img
                src={logoFull}
                alt="Resqmeal - Turning surplus into sustenance"
                className="h-32 md:h-40 w-auto mx-auto"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Turning surplus into{' '}
              <span className="text-primary">sustenance</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Connect restaurants with surplus food to NGOs and volunteers who can deliver it to those in need. Together, we reduce food waste and fight hunger.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button variant="hero" asChild>
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero-secondary" asChild>
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Collective Impact
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Every meal rescued makes a difference. See what our community has achieved together.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-8 text-center shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                <UtensilsCrossed className="h-8 w-8" />
              </div>
              <p className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {formatNumber(publicStats.mealsSaved)}
              </p>
              <p className="text-muted-foreground font-medium">Meals Saved</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-8 text-center shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <p className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {formatNumber(publicStats.foodSavedKg)}
                <span className="text-2xl ml-1">kg</span>
              </p>
              <p className="text-muted-foreground font-medium">Food Saved</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-8 text-center shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 text-secondary mb-4">
                <Leaf className="h-8 w-8" />
              </div>
              <p className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {formatNumber(publicStats.co2Reduced)}
                <span className="text-2xl ml-1">kg</span>
              </p>
              <p className="text-muted-foreground font-medium">CO₂ Reduced</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Resqmeal Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A simple, powerful platform connecting those with surplus food to those who need it most.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-6 shadow-resq">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Restaurants Post</h3>
              <p className="text-muted-foreground">
                Restaurants list surplus food with details like quantity, type, and pickup time. Our system calculates urgency scores automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary text-secondary-foreground mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">NGOs Accept</h3>
              <p className="text-muted-foreground">
                NGOs view matched food donations based on their capacity and location. They accept what they can distribute effectively.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent text-accent-foreground mb-6">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Volunteers Deliver</h3>
              <p className="text-muted-foreground">
                Volunteers pick up food from restaurants and deliver to NGOs. They upload proof photos to complete deliveries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to make a difference?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
            Join thousands of restaurants, NGOs, and volunteers already using Resqmeal to reduce food waste and feed communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/signup">
                Join Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/impact">View Impact</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src={logoMark} alt="Resqmeal" className="h-8 w-8" />
              <span className="text-lg font-bold text-foreground">Resqmeal</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Resqmeal. Turning surplus into sustenance.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign Up
              </Link>
              <Link to="/impact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Impact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
