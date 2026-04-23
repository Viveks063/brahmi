import { Button } from "@/components/ui/button";
import { Upload, Sparkles, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-manuscript.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/90" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="text-secondary w-8 h-8 mr-3 animate-float" />
            <span className="font-modern text-secondary font-medium">Ancient Script • Modern Technology</span>
          </div>
          
          <h1 className="font-manuscript text-5xl md:text-7xl font-bold text-primary mb-6 leading-tight">
            Translate Ancient{" "}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Brahmi Script
            </span>
            {" "}into Modern Languages
          </h1>
          
          <p className="font-modern text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Unlock the secrets of ancient manuscripts with our AI-powered translator. 
            Convert Ancient Brahmi script images to Sanskrit and English instantly.
            Or learn to read Brahmi script yourself with our comprehensive tutorial.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/translator">
              <Button className="btn-hero group">
                <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Upload Image to Translate
              </Button>
            </Link>
            
            <Link to="/tutorial">
              <Button 
                variant="outline"
                className="font-modern px-6 py-3 border-primary text-primary hover:bg-primary/10 group"
              >
                <GraduationCap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Learn Brahmi Script
              </Button>
            </Link>
          </div>
          
          {/* Tutorial Preview Card */}
          <div className="mt-12 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border max-w-3xl mx-auto">
            <h3 className="font-manuscript text-2xl font-semibold text-primary mb-4">
              Master Ancient Brahmi Script
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="text-center">
                <div className="text-4xl mb-3">📜</div>
                <h4 className="font-modern font-semibold text-foreground mb-2">50+ Characters</h4>
                <p className="font-modern text-sm text-muted-foreground">
                  Complete vowels, consonants, and numerals with pronunciation guides
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">✍️</div>
                <h4 className="font-modern font-semibold text-foreground mb-2">Interactive Practice</h4>
                <p className="font-modern text-sm text-muted-foreground">
                  Trace characters on canvas with step-by-step guidance
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🏛️</div>
                <h4 className="font-modern font-semibold text-foreground mb-2">Historical Context</h4>
                <p className="font-modern text-sm text-muted-foreground">
                  Learn about Emperor Ashoka's edicts and ancient inscriptions
                </p>
              </div>
            </div>
            <Link to="/tutorial" className="inline-block mt-6">
              <Button size="sm" variant="outline" className="font-modern">
                Start Learning Journey →
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-border">
            {/* Your existing stats */}
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-secondary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-secondary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;