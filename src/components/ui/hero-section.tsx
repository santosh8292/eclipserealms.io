import { Button } from "@/components/ui/button";
import { Play, Download, Users, Star } from "lucide-react";
import heroImage from "@/assets/hero-eclipse-realms.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 starfield opacity-30"></div>
      
      {/* Hero background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Game title */}
        <div className="mb-8 float-animation">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4">
            <span className="text-gradient-eclipse">ECLIPSE</span>
            <br />
            <span className="text-gradient-rift">REALMS</span>
          </h1>
          <div className="w-32 h-1 bg-gradient-eclipse mx-auto rounded-full pulse-glow"></div>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-cosmic-white/90 mb-6 font-light tracking-wide">
          Where dimensions collide, legends are born
        </p>
        
        {/* Game description */}
        <p className="text-lg text-cosmic-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
          Run through mystical Eclipse Realms in this epic 3D endless runner! 
          Choose unique characters, avoid obstacles, collect cosmic coins, 
          and see how far you can go. <span className="text-eclipse-gold font-semibold">Play for free!</span>
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            asChild
            variant="eclipse" 
            size="lg" 
            className="text-lg px-8 py-6 cosmic-glow"
          >
            <a href="#game">
              <Play className="mr-2 h-5 w-5" />
              Play Eclipse Realms Now
            </a>
          </Button>
          <Button variant="cosmic" size="lg" className="text-lg px-8 py-6">
            <Download className="mr-2 h-5 w-5" />
            Download Full Game
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-eclipse-gold mb-2">500K+</div>
            <div className="text-cosmic-white/70">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rift-blue mb-2">∞</div>
            <div className="text-cosmic-white/70">Unique Realms</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-6 w-6 text-eclipse-gold mr-1" fill="currentColor" />
              <span className="text-3xl font-bold text-eclipse-gold">4.9</span>
            </div>
            <div className="text-cosmic-white/70">User Rating</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-eclipse-gold/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-eclipse-gold rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;