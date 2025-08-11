import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sword,
  Zap,
  Clock,
  Cpu,
  ArrowRight,
  Shield,
  Target,
  Sparkles
} from "lucide-react";
import characterClasses from "@/assets/character-classes.jpg";

const classes = [
  {
    id: "shadowmancer",
    name: "Shadowmancer",
    icon: Sparkles,
    role: "Mage",
    difficulty: "Expert",
    description: "Masters of shadow magic who manipulate darkness and void energy to devastate enemies.",
    abilities: [
      { name: "Void Rift", description: "Tear reality to deal massive damage", type: "Ultimate" },
      { name: "Shadow Step", description: "Teleport through shadows instantly", type: "Mobility" },
      { name: "Dark Barrier", description: "Absorb incoming damage as shadow energy", type: "Defense" },
      { name: "Soul Drain", description: "Heal by draining enemy life force", type: "Sustain" }
    ],
    stats: { damage: 95, defense: 30, mobility: 80, complexity: 90 },
    color: "mystic-purple"
  },
  {
    id: "riftblade",
    name: "Riftblade",
    icon: Sword,
    role: "Warrior",
    difficulty: "Medium",
    description: "Dimensional warriors who slice through reality itself with energy-infused weapons.",
    abilities: [
      { name: "Reality Slash", description: "Cut through space-time dealing true damage", type: "Ultimate" },
      { name: "Dimensional Dash", description: "Phase through enemies while striking", type: "Mobility" },
      { name: "Rift Guard", description: "Block attacks by bending space", type: "Defense" },
      { name: "Energy Surge", description: "Empower next attacks with rift energy", type: "Buff" }
    ],
    stats: { damage: 85, defense: 70, mobility: 75, complexity: 60 },
    color: "rift-blue"
  },
  {
    id: "techshaman",
    name: "Tech Shaman",
    icon: Cpu,
    role: "Support",
    difficulty: "Hard",
    description: "Fusion of ancient mysticism and advanced technology, bridging magic and science.",
    abilities: [
      { name: "Quantum Heal", description: "Restore allies using probability manipulation", type: "Ultimate" },
      { name: "Tech Spirit", description: "Deploy AI familiars to assist party", type: "Summon" },
      { name: "Data Shield", description: "Create protective barriers of pure information", type: "Defense" },
      { name: "System Override", description: "Disable enemy abilities temporarily", type: "Debuff" }
    ],
    stats: { damage: 60, defense: 85, mobility: 65, complexity: 85 },
    color: "cyber-neon"
  },
  {
    id: "chronoarcher",
    name: "Chrono-Archer",
    icon: Clock,
    role: "Assassin",
    difficulty: "Expert",
    description: "Time-bending marksmen who manipulate temporal flow to strike with perfect precision.",
    abilities: [
      { name: "Time Stop", description: "Freeze time to line up the perfect shot", type: "Ultimate" },
      { name: "Temporal Echo", description: "Leave time copies that repeat actions", type: "Clone" },
      { name: "Rewind", description: "Undo recent damage by reversing time", type: "Heal" },
      { name: "Future Sight", description: "See enemy actions before they happen", type: "Vision" }
    ],
    stats: { damage: 90, defense: 45, mobility: 95, complexity: 95 },
    color: "eclipse-gold"
  }
];

const getStatColor = (value: number) => {
  if (value >= 80) return "eclipse-gold";
  if (value >= 60) return "rift-blue";
  if (value >= 40) return "mystic-purple";
  return "cosmic-white/50";
};

const getAbilityTypeColor = (type: string) => {
  switch (type) {
    case "Ultimate": return "lava-red";
    case "Mobility": return "rift-blue";
    case "Defense": return "cosmic-white";
    case "Sustain": case "Heal": return "celestial-gold";
    case "Buff": return "eclipse-gold";
    case "Debuff": return "mystic-purple";
    case "Summon": case "Clone": return "cyber-neon";
    case "Vision": return "mystic-magenta";
    default: return "cosmic-white";
  }
};

const CharactersSection = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url(${characterClasses})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-cosmic opacity-90"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-eclipse-gold/20 text-eclipse-gold border-eclipse-gold/30">
            Character Classes
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient-eclipse">Master</span> Your{" "}
            <span className="text-gradient-rift">Destiny</span>
          </h2>
          <p className="text-xl text-cosmic-white/70 max-w-3xl mx-auto">
            Choose from unique classes, each with distinctive playstyles, abilities, 
            and progression paths across the multiverse.
          </p>
        </div>

        {/* Character class tabs */}
        <Tabs defaultValue="shadowmancer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-card/50 border border-mystic-purple/20">
            {classes.map((cls) => (
              <TabsTrigger 
                key={cls.id} 
                value={cls.id}
                className="data-[state=active]:bg-gradient-card data-[state=active]:text-eclipse-gold"
              >
                <cls.icon className="h-4 w-4 mr-2" />
                {cls.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {classes.map((cls) => (
            <TabsContent key={cls.id} value={cls.id} className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Class info */}
                <Card className="bg-gradient-card border-mystic-purple/20">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-4 rounded-xl bg-${cls.color}/20`}>
                        <cls.icon className={`h-8 w-8 text-${cls.color}`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-cosmic-white">{cls.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className={`text-${cls.color} border-${cls.color}/40`}>
                            {cls.role}
                          </Badge>
                          <Badge variant="outline" className="text-cosmic-white/60 border-cosmic-white/20">
                            {cls.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-cosmic-white/70 mb-8 leading-relaxed">
                      {cls.description}
                    </p>

                    {/* Stats */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-cosmic-white">Combat Stats</h4>
                      {Object.entries(cls.stats).map(([stat, value]) => (
                        <div key={stat} className="flex items-center justify-between">
                          <span className="text-cosmic-white/80 capitalize">{stat}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-void-dark rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-${getStatColor(value)} transition-all duration-500`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                            <span className={`text-${getStatColor(value)} text-sm font-medium w-8`}>
                              {value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Abilities */}
                <Card className="bg-gradient-card border-mystic-purple/20">
                  <CardContent className="p-8">
                    <h4 className="text-lg font-semibold text-cosmic-white mb-6">Signature Abilities</h4>
                    <div className="space-y-4">
                      {cls.abilities.map((ability, index) => (
                        <div key={index} className="p-4 bg-void-dark/50 rounded-lg border border-mystic-purple/10">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-cosmic-white font-medium">{ability.name}</h5>
                            <Badge 
                              variant="outline" 
                              className={`text-${getAbilityTypeColor(ability.type)} border-${getAbilityTypeColor(ability.type)}/40 text-xs`}
                            >
                              {ability.type}
                            </Badge>
                          </div>
                          <p className="text-cosmic-white/70 text-sm">{ability.description}</p>
                        </div>
                      ))}
                    </div>

                    <Button variant="eclipse" className="w-full mt-6 cosmic-glow">
                      Play as {cls.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Bottom section */}
        <div className="text-center mt-16">
          <p className="text-cosmic-white/60 mb-6">
            Unlock new abilities and customize your playstyle as you progress through the realms.
          </p>
          <Button variant="cosmic" size="lg">
            View All Classes & Builds
            <Target className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CharactersSection;