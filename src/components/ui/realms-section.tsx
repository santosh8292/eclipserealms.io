import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Snowflake, 
  Sun, 
  Flame, 
  Cpu, 
  Skull,
  ArrowRight
} from "lucide-react";
import realmPortals from "@/assets/realm-portals.jpg";

const realms = [
  {
    name: "Frozen Wastes",
    icon: Snowflake,
    description: "Navigate through crystalline ice caverns and battle frost titans in sub-zero temperatures.",
    theme: "Ice & Snow",
    difficulty: "Hard",
    color: "frozen-blue",
    bgColor: "frozen-blue/10"
  },
  {
    name: "Celestial Gardens", 
    icon: Sun,
    description: "Soar through golden cloudscapes and harness divine light magic in the heavenly realm.",
    theme: "Divine Light",
    difficulty: "Medium",
    color: "celestial-gold", 
    bgColor: "celestial-gold/10"
  },
  {
    name: "Molten Core",
    icon: Flame,
    description: "Brave volcanic tunnels and defeat fire elementals in the heart of a dying star.",
    theme: "Fire & Lava",
    difficulty: "Expert",
    color: "lava-red",
    bgColor: "lava-red/10"
  },
  {
    name: "Neon District",
    icon: Cpu,
    description: "Hack through cyberpunk megacities and battle AI overlords in digital warfare.",
    theme: "Cyberpunk",
    difficulty: "Hard",
    color: "cyber-neon",
    bgColor: "cyber-neon/10"
  },
  {
    name: "Deadlands",
    icon: Skull,
    description: "Survive the wasteland ruins and face mutated horrors in the post-apocalyptic realm.",
    theme: "Post-Apocalyptic",
    difficulty: "Nightmare",
    color: "apocalypse-rust",
    bgColor: "apocalypse-rust/10"
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Medium": return "rift-blue";
    case "Hard": return "eclipse-gold";
    case "Expert": return "mystic-magenta";
    case "Nightmare": return "lava-red";
    default: return "cosmic-white";
  }
};

const RealmsSection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url(${realmPortals})`,
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-cosmic"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-rift-blue/20 text-rift-blue border-rift-blue/30">
            Dimensional Realms
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient-rift">Explore</span> Infinite{" "}
            <span className="text-gradient-eclipse">Realities</span>
          </h2>
          <p className="text-xl text-cosmic-white/70 max-w-3xl mx-auto">
            Each realm offers unique challenges, physics, and stories. Procedurally generated 
            with endless possibilities for exploration and discovery.
          </p>
        </div>

        {/* Realms showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Featured realm (larger card) */}
          <Card className="lg:row-span-2 bg-gradient-card border-mystic-purple/20 hover:border-eclipse-gold/40 transition-all duration-500 group overflow-hidden">
            <CardContent className="p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-xl bg-${realms[0].color}/20 group-hover:bg-${realms[0].color}/30 transition-colors duration-300`}>
                  {React.createElement(realms[0].icon, { className: `h-8 w-8 text-${realms[0].color}` })}
                </div>
                <Badge 
                  variant="outline" 
                  className={`border-${getDifficultyColor(realms[0].difficulty)}/40 text-${getDifficultyColor(realms[0].difficulty)}`}
                >
                  {realms[0].difficulty}
                </Badge>
              </div>
              
              <h3 className="text-2xl font-bold text-cosmic-white mb-3 group-hover:text-eclipse-gold transition-colors duration-300">
                {realms[0].name}
              </h3>
              
              <Badge className={`mb-4 w-fit bg-${realms[0].bgColor} text-${realms[0].color} border-${realms[0].color}/30`}>
                {realms[0].theme}
              </Badge>
              
              <p className="text-cosmic-white/70 mb-6 flex-grow leading-relaxed">
                {realms[0].description}
              </p>
              
              <Button variant="realm" className="w-full group-hover:border-eclipse-gold/60">
                Enter Realm
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>

          {/* Other realms (smaller cards) */}
          <div className="space-y-6">
            {realms.slice(1).map((realm, index) => (
              <Card 
                key={index} 
                className="bg-gradient-card border-mystic-purple/20 hover:border-eclipse-gold/40 transition-all duration-300 group cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-${realm.color}/20 group-hover:bg-${realm.color}/30 transition-colors duration-300 flex-shrink-0`}>
                      {React.createElement(realm.icon, { className: `h-5 w-5 text-${realm.color}` })}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-cosmic-white group-hover:text-eclipse-gold transition-colors duration-300">
                          {realm.name}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`border-${getDifficultyColor(realm.difficulty)}/40 text-${getDifficultyColor(realm.difficulty)} text-xs`}
                        >
                          {realm.difficulty}
                        </Badge>
                      </div>
                      
                      <Badge className={`mb-2 bg-${realm.bgColor} text-${realm.color} border-${realm.color}/30 text-xs`}>
                        {realm.theme}
                      </Badge>
                      
                      <p className="text-cosmic-white/70 text-sm leading-relaxed">
                        {realm.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center">
          <p className="text-cosmic-white/60 mb-6">
            New realms are discovered weekly. The multiverse is constantly expanding.
          </p>
          <Button variant="eclipse" size="lg" className="cosmic-glow">
            Discover All Realms
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RealmsSection;
