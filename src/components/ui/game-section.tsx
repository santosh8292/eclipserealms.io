import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Gamepad2, 
  Zap, 
  Heart,
  Shield,
  Sword,
  Sparkles
} from "lucide-react";

interface GameState {
  health: number;
  energy: number;
  score: number;
  level: number;
  isPlaying: boolean;
  enemies: Enemy[];
  player: Player;
  powerups: Powerup[];
}

interface Player {
  x: number;
  y: number;
  class: string;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
  type: string;
}

interface Powerup {
  id: number;
  x: number;
  y: number;
  type: string;
}

const GAME_WIDTH = 400;
const GAME_HEIGHT = 300;

const GameSection = () => {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    energy: 100,
    score: 0,
    level: 1,
    isPlaying: false,
    enemies: [],
    player: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 40, class: "Shadowmancer" },
    powerups: []
  });

  const [keys, setKeys] = useState<Set<string>>(new Set());

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        const newState = { ...prev };
        
        // Move player based on keys
        if (keys.has('ArrowLeft') && newState.player.x > 20) {
          newState.player.x -= 5;
        }
        if (keys.has('ArrowRight') && newState.player.x < GAME_WIDTH - 20) {
          newState.player.x += 5;
        }
        if (keys.has('ArrowUp') && newState.player.y > 20) {
          newState.player.y -= 5;
        }
        if (keys.has('ArrowDown') && newState.player.y < GAME_HEIGHT - 20) {
          newState.player.y += 5;
        }

        // Spawn enemies
        if (Math.random() < 0.02) {
          newState.enemies.push({
            id: Date.now(),
            x: Math.random() * (GAME_WIDTH - 40) + 20,
            y: -20,
            health: 50,
            type: "Void Wraith"
          });
        }

        // Move enemies
        newState.enemies = newState.enemies
          .map(enemy => ({ ...enemy, y: enemy.y + 2 }))
          .filter(enemy => enemy.y < GAME_HEIGHT + 50);

        // Spawn powerups
        if (Math.random() < 0.01) {
          newState.powerups.push({
            id: Date.now(),
            x: Math.random() * (GAME_WIDTH - 40) + 20,
            y: -20,
            type: Math.random() < 0.5 ? "health" : "energy"
          });
        }

        // Move powerups
        newState.powerups = newState.powerups
          .map(powerup => ({ ...powerup, y: powerup.y + 1 }))
          .filter(powerup => powerup.y < GAME_HEIGHT + 50);

        // Check collisions with enemies
        newState.enemies.forEach(enemy => {
          const distance = Math.sqrt(
            Math.pow(enemy.x - newState.player.x, 2) + 
            Math.pow(enemy.y - newState.player.y, 2)
          );
          if (distance < 25) {
            newState.health -= 10;
            newState.enemies = newState.enemies.filter(e => e.id !== enemy.id);
          }
        });

        // Check collisions with powerups
        newState.powerups.forEach(powerup => {
          const distance = Math.sqrt(
            Math.pow(powerup.x - newState.player.x, 2) + 
            Math.pow(powerup.y - newState.player.y, 2)
          );
          if (distance < 25) {
            if (powerup.type === "health" && newState.health < 100) {
              newState.health = Math.min(100, newState.health + 20);
            } else if (powerup.type === "energy" && newState.energy < 100) {
              newState.energy = Math.min(100, newState.energy + 30);
            }
            newState.score += 50;
            newState.powerups = newState.powerups.filter(p => p.id !== powerup.id);
          }
        });

        // Attack with spacebar
        if (keys.has(' ') && newState.energy >= 10) {
          newState.energy -= 10;
          newState.enemies = newState.enemies.filter(enemy => {
            const distance = Math.sqrt(
              Math.pow(enemy.x - newState.player.x, 2) + 
              Math.pow(enemy.y - newState.player.y, 2)
            );
            if (distance < 60) {
              newState.score += 100;
              return false;
            }
            return true;
          });
        }

        // Regenerate energy
        if (newState.energy < 100) {
          newState.energy = Math.min(100, newState.energy + 0.5);
        }

        // Increase score over time
        newState.score += 1;

        // Level up
        const newLevel = Math.floor(newState.score / 1000) + 1;
        if (newLevel > newState.level) {
          newState.level = newLevel;
          toast({
            title: "Level Up!",
            description: `Welcome to Level ${newLevel}`,
          });
        }

        // Game over
        if (newState.health <= 0) {
          newState.isPlaying = false;
          toast({
            title: "Game Over!",
            description: `Final Score: ${newState.score}`,
            variant: "destructive"
          });
        }

        return newState;
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameState.isPlaying, keys]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set([...prev, e.key]));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key);
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
    toast({
      title: "Eclipse Realms Started!",
      description: "Use arrow keys to move, spacebar to attack",
    });
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const resetGame = () => {
    setGameState({
      health: 100,
      energy: 100,
      score: 0,
      level: 1,
      isPlaying: false,
      enemies: [],
      player: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 40, class: "Shadowmancer" },
      powerups: []
    });
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-eclipse-gold/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-mystic-purple/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10" id="game">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-eclipse-gold/20 text-eclipse-gold border-eclipse-gold/30">
            <Gamepad2 className="w-3 h-3 mr-1" />
            Play Now - Free!
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient-eclipse">Eclipse Realms</span>{" "}
            <span className="text-gradient-rift">Demo</span>
          </h2>
          <p className="text-xl text-cosmic-white/70 max-w-3xl mx-auto">
            Experience the Eclipse Realms universe right in your browser. Free to play!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Canvas */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-mystic-purple/20">
              <CardHeader>
                <CardTitle className="text-cosmic-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-eclipse-gold" />
                  Eclipse Realms - Shadowmancer Quest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative bg-cosmic-black border-2 border-eclipse-gold/30 rounded-lg mx-auto"
                  style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
                  tabIndex={0}
                >
                  {/* Background effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-mystic-purple/20 to-cosmic-black rounded-lg"></div>
                  
                  {/* Player */}
                  <div
                    className="absolute w-6 h-6 bg-eclipse-gold rounded-full shadow-glow transition-all duration-100"
                    style={{
                      left: gameState.player.x - 12,
                      top: gameState.player.y - 12,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-eclipse-gold to-rift-cyan rounded-full animate-pulse"></div>
                  </div>

                  {/* Enemies */}
                  {gameState.enemies.map(enemy => (
                    <div
                      key={enemy.id}
                      className="absolute w-5 h-5 bg-lava-red rounded-full shadow-glow"
                      style={{
                        left: enemy.x - 10,
                        top: enemy.y - 10,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-lava-red to-mystic-magenta rounded-full animate-pulse"></div>
                    </div>
                  ))}

                  {/* Powerups */}
                  {gameState.powerups.map(powerup => (
                    <div
                      key={powerup.id}
                      className={`absolute w-4 h-4 rounded-full shadow-glow animate-bounce ${
                        powerup.type === 'health' ? 'bg-green-400' : 'bg-rift-cyan'
                      }`}
                      style={{
                        left: powerup.x - 8,
                        top: powerup.y - 8,
                      }}
                    />
                  ))}

                  {/* Game Over Overlay */}
                  {!gameState.isPlaying && gameState.health <= 0 && (
                    <div className="absolute inset-0 bg-cosmic-black/80 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-lava-red mb-2">Game Over</h3>
                        <p className="text-cosmic-white/70 mb-4">Final Score: {gameState.score}</p>
                      </div>
                    </div>
                  )}

                  {/* Start Game Overlay */}
                  {!gameState.isPlaying && gameState.health > 0 && gameState.score === 0 && (
                    <div className="absolute inset-0 bg-cosmic-black/80 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-eclipse-gold mb-2">Ready to Play?</h3>
                        <p className="text-cosmic-white/70 mb-4">Click Start to begin your journey</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Game Controls */}
                <div className="flex gap-2 mt-4 justify-center">
                  {!gameState.isPlaying ? (
                    <Button 
                      onClick={startGame}
                      className="bg-gradient-to-r from-eclipse-gold to-rift-cyan hover:from-eclipse-gold/80 hover:to-rift-cyan/80 text-cosmic-white border-0"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Game
                    </Button>
                  ) : (
                    <Button 
                      onClick={pauseGame}
                      variant="outline"
                      className="border-mystic-purple/40 text-mystic-purple hover:bg-mystic-purple/20"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  
                  <Button 
                    onClick={resetGame}
                    variant="outline"
                    className="border-lava-red/40 text-lava-red hover:bg-lava-red/20"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Controls Guide */}
                <div className="mt-4 text-center text-sm text-cosmic-white/60">
                  <p>Arrow Keys: Move • Spacebar: Attack • Avoid red enemies • Collect powerups</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Stats */}
          <div className="space-y-4">
            {/* Player Stats */}
            <Card className="bg-gradient-card border-mystic-purple/20">
              <CardHeader>
                <CardTitle className="text-cosmic-white text-sm">Player Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cosmic-white/70 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-green-400" />
                      Health
                    </span>
                    <span className="text-sm text-cosmic-white">{gameState.health}/100</span>
                  </div>
                  <div className="w-full bg-cosmic-black/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${gameState.health}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cosmic-white/70 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-rift-cyan" />
                      Energy
                    </span>
                    <span className="text-sm text-cosmic-white">{Math.round(gameState.energy)}/100</span>
                  </div>
                  <div className="w-full bg-cosmic-black/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-rift-cyan to-cyber-neon h-2 rounded-full transition-all duration-300"
                      style={{ width: `${gameState.energy}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-mystic-purple/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-cosmic-white/70">Score</span>
                    <span className="text-eclipse-gold font-bold">{gameState.score}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-cosmic-white/70">Level</span>
                    <span className="text-rift-cyan font-bold">{gameState.level}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Character Info */}
            <Card className="bg-gradient-card border-mystic-purple/20">
              <CardHeader>
                <CardTitle className="text-cosmic-white text-sm">Character</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-eclipse-gold rounded-full flex items-center justify-center">
                    <Sword className="w-4 h-4 text-cosmic-black" />
                  </div>
                  <div>
                    <p className="text-cosmic-white font-semibold">{gameState.player.class}</p>
                    <p className="text-cosmic-white/60 text-xs">Master of Shadows</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Info */}
            <Card className="bg-gradient-card border-mystic-purple/20">
              <CardHeader>
                <CardTitle className="text-cosmic-white text-sm">About This Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-cosmic-white/70 text-xs leading-relaxed">
                  This is a simplified demo of Eclipse Realms. The full game features multiple realms, 
                  character classes, multiplayer modes, and much more!
                </p>
                <div className="mt-3 pt-3 border-t border-mystic-purple/20">
                  <Badge className="bg-eclipse-gold/20 text-eclipse-gold border-eclipse-gold/40 text-xs">
                    Free Forever
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameSection;