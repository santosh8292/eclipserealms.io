import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, Code, Trophy, Users } from "lucide-react";

const DeveloperSection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-cyber-neon/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-eclipse-gold/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-cyber-neon/20 text-cyber-neon border-cyber-neon/30">
            <Code className="w-3 h-3 mr-1" />
            Meet the Creator
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient-eclipse">Game</span>{" "}
            <span className="text-gradient-rift">Developer</span>
          </h2>
          <p className="text-xl text-cosmic-white/70 max-w-3xl mx-auto">
            The visionary behind Eclipse Realms, bringing innovative gaming experiences to life
          </p>
        </div>

        {/* Developer profile card */}
        <Card className="bg-gradient-card border-mystic-purple/20 hover:border-eclipse-gold/40 transition-all duration-300 max-w-4xl mx-auto">
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Developer photo */}
              <div className="relative">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-eclipse-gold/30 shadow-glow">
                  <img 
                    src="/lovable-uploads/244edbd0-46fa-47de-a6d2-a9d7b91a0b41.png"
                    alt="Santosh Khadka - Game Developer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <Badge className="bg-eclipse-gold/20 text-eclipse-gold border-eclipse-gold/40">
                    <Trophy className="w-3 h-3 mr-1" />
                    Founder
                  </Badge>
                </div>
              </div>

              {/* Developer info */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-bold text-cosmic-white mb-2">
                  Santosh Khadka
                </h3>
                <p className="text-xl text-eclipse-gold mb-4">
                  Game Developer & Founder
                </p>
                <p className="text-cosmic-white/70 mb-6 leading-relaxed">
                  Passionate game developer with a vision to create immersive, cross-platform gaming experiences. 
                  Eclipse Realms represents years of dedication to building innovative gameplay mechanics 
                  and engaging multiverse narratives that bring players together across all platforms.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-eclipse-gold">5+</div>
                    <div className="text-sm text-cosmic-white/60">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-rift-cyan">12</div>
                    <div className="text-sm text-cosmic-white/60">Realms Created</div>
                  </div>
                  <div className="text-center md:col-span-1 col-span-2">
                    <div className="text-2xl font-bold text-mystic-purple">1000+</div>
                    <div className="text-sm text-cosmic-white/60">Players Worldwide</div>
                  </div>
                </div>

                {/* Contact buttons */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-eclipse-gold/40 text-eclipse-gold hover:bg-eclipse-gold/20"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-cyber-neon/40 text-cyber-neon hover:bg-cyber-neon/20"
                    onClick={() => window.open('https://github.com/santosh892', '_blank')}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-rift-cyan/40 text-rift-cyan hover:bg-rift-cyan/20"
                    onClick={() => window.open('https://www.linkedin.com/in/santosh-khadka-11068126b', '_blank')}
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mission statement */}
        <div className="text-center mt-12">
          <p className="text-cosmic-white/60 italic max-w-2xl mx-auto">
            "My mission is to create games that break boundaries - where every player, 
            regardless of their platform, can share epic adventures together in truly infinite worlds."
          </p>
          <div className="w-24 h-0.5 bg-gradient-eclipse mx-auto mt-6 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default DeveloperSection;