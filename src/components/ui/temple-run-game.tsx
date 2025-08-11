import { useState, useEffect, useRef, useCallback } from "react";
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
  Trophy,
  Coins,
  ArrowLeft,
  ArrowRight,
  ArrowUp
} from "lucide-react";

interface GameState {
  health: number;
  coins: number;
  score: number;
  distance: number;
  isPlaying: boolean;
  isGameOver: boolean;
  isFullscreen: boolean;
  playerLane: number; // -1, 0, 1 (left, center, right)
  selectedCharacter: string;
  speed: number;
  playerY: number;
  isJumping: boolean;
}

interface GameObject {
  id: number;
  x: number;
  y: number;
  type: string;
}

const characters = [
  { id: "shadowmancer", name: "Shadowmancer", color: "#8B5CF6", ability: "Shadow Dash", emoji: "🌙" },
  { id: "riftblade", name: "Riftblade", color: "#06B6D4", ability: "Time Slice", emoji: "⚔️" },
  { id: "techshaman", name: "Tech Shaman", color: "#F59E0B", ability: "Digital Shield", emoji: "🔮" },
  { id: "chronoarcher", name: "Chrono Archer", color: "#EF4444", ability: "Time Slow", emoji: "🏹" }
];

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const LANE_WIDTH = GAME_WIDTH / 3;

const TempleRunGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    coins: 0,
    score: 0,
    distance: 0,
    isPlaying: false,
    isGameOver: false,
    isFullscreen: false,
    playerLane: 0, // Center lane
    selectedCharacter: "shadowmancer",
    speed: 3,
    playerY: GAME_HEIGHT - 80,
    isJumping: false
  });

  const [obstacles, setObstacles] = useState<GameObject[]>([]);
  const [coins, setCoins] = useState<GameObject[]>([]);
  const [backgrounds, setBackgrounds] = useState<GameObject[]>([]);
  const gameLoopRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedChar = characters.find(c => c.id === gameState.selectedCharacter) || characters[0];

  // Initialize background elements
  useEffect(() => {
    const bgElements = [];
    for (let i = 0; i < 10; i++) {
      bgElements.push({
        id: i,
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        type: 'temple'
      });
    }
    setBackgrounds(bgElements);
  }, []);

  // Game drawing function
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with temple background
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#4C1D95');
    gradient.addColorStop(1, '#1F2937');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw temple background elements
    ctx.fillStyle = '#6B7280';
    backgrounds.forEach(bg => {
      ctx.fillRect(bg.x, bg.y, 20, 30);
    });

    // Draw lane dividers
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(LANE_WIDTH, 0);
    ctx.lineTo(LANE_WIDTH, GAME_HEIGHT);
    ctx.moveTo(LANE_WIDTH * 2, 0);
    ctx.lineTo(LANE_WIDTH * 2, GAME_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw player
    const playerX = (gameState.playerLane + 1) * LANE_WIDTH + LANE_WIDTH/2 - 20;
    ctx.fillStyle = selectedChar.color;
    ctx.fillRect(playerX, gameState.playerY, 40, 60);
    
    // Add character emoji
    ctx.font = '30px Arial';
    ctx.fillText(selectedChar.emoji, playerX + 5, gameState.playerY - 10);

    // Draw player name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.fillText(selectedChar.name, playerX - 10, gameState.playerY + 80);

    // Draw obstacles
    ctx.fillStyle = '#DC2626';
    obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x, obstacle.y, 40, 60);
      // Add danger symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px Arial';
      ctx.fillText('⚠️', obstacle.x + 10, obstacle.y + 30);
      ctx.fillStyle = '#DC2626';
    });

    // Draw coins
    ctx.fillStyle = '#FFD700';
    coins.forEach(coin => {
      ctx.beginPath();
      ctx.arc(coin.x + 15, coin.y + 15, 15, 0, Math.PI * 2);
      ctx.fill();
      // Add coin symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.fillText('💰', coin.x + 5, coin.y + 20);
      ctx.fillStyle = '#FFD700';
    });

    // Draw UI overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH, 40);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 10, 25);
    ctx.fillText(`Coins: ${gameState.coins}`, 150, 25);
    ctx.fillText(`Distance: ${gameState.distance}m`, 280, 25);
    ctx.fillText(`Health: ${gameState.health}%`, 450, 25);

  }, [gameState, obstacles, coins, backgrounds, selectedChar]);

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const gameLoop = () => {
      // Update game state
      setGameState(prev => {
        const newState = { ...prev };
        
        // Handle jumping
        if (newState.isJumping) {
          if (newState.playerY > GAME_HEIGHT - 160) {
            newState.playerY -= 8;
          } else {
            newState.isJumping = false;
          }
        } else if (newState.playerY < GAME_HEIGHT - 80) {
          newState.playerY += 8;
        } else {
          newState.playerY = GAME_HEIGHT - 80;
        }

        // Update distance and score
        newState.distance += 1;
        newState.score += 1;
        newState.speed = Math.min(8, 3 + newState.distance / 100);

        return newState;
      });

      // Move obstacles
      setObstacles(prev => {
        const updated = prev.map(obs => ({
          ...obs,
          y: obs.y + gameState.speed
        })).filter(obs => obs.y < GAME_HEIGHT + 100);

        // Add new obstacles
        if (Math.random() < 0.02) {
          const lane = Math.floor(Math.random() * 3) - 1;
          const laneX = (lane + 1) * LANE_WIDTH + LANE_WIDTH/2 - 20;
          updated.push({
            id: Date.now(),
            x: laneX,
            y: -60,
            type: 'obstacle'
          });
        }

        return updated;
      });

      // Move coins
      setCoins(prev => {
        const updated = prev.map(coin => ({
          ...coin,
          y: coin.y + gameState.speed
        })).filter(coin => coin.y < GAME_HEIGHT + 50);

        // Add new coins
        if (Math.random() < 0.015) {
          const lane = Math.floor(Math.random() * 3) - 1;
          const laneX = (lane + 1) * LANE_WIDTH + LANE_WIDTH/2 - 15;
          updated.push({
            id: Date.now(),
            x: laneX,
            y: -30,
            type: 'coin'
          });
        }

        return updated;
      });

      // Move background elements
      setBackgrounds(prev => prev.map(bg => ({
        ...bg,
        y: bg.y + gameState.speed * 0.5
      })).filter(bg => bg.y < GAME_HEIGHT + 50));

      drawGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.speed, drawGame]);

  // Collision detection
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const playerX = (gameState.playerLane + 1) * LANE_WIDTH + LANE_WIDTH/2 - 20;
    
    // Check obstacle collisions
    obstacles.forEach(obstacle => {
      if (obstacle.y > gameState.playerY - 60 && 
          obstacle.y < gameState.playerY + 60 &&
          Math.abs(obstacle.x - playerX) < 40) {
        setGameState(prev => {
          const newHealth = prev.health - 20;
          if (newHealth <= 0) {
            toast({
              title: "Game Over!",
              description: `Final Score: ${prev.score} | Distance: ${prev.distance}m`,
              variant: "destructive"
            });
            return { ...prev, health: 0, isPlaying: false, isGameOver: true };
          }
          return { ...prev, health: newHealth };
        });
        setObstacles(prev => prev.filter(obs => obs.id !== obstacle.id));
      }
    });

    // Check coin collisions
    coins.forEach(coin => {
      if (coin.y > gameState.playerY - 30 && 
          coin.y < gameState.playerY + 60 &&
          Math.abs(coin.x - playerX) < 35) {
        setGameState(prev => ({
          ...prev,
          coins: prev.coins + 1,
          score: prev.score + 10
        }));
        setCoins(prev => prev.filter(c => c.id !== coin.id));
      }
    });
  }, [obstacles, coins, gameState.playerY, gameState.playerLane, gameState.isPlaying]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setGameState(prev => ({
            ...prev,
            playerLane: Math.max(-1, prev.playerLane - 1)
          }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setGameState(prev => ({
            ...prev,
            playerLane: Math.min(1, prev.playerLane + 1)
          }));
          break;
        case ' ':
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (!gameState.isJumping) {
            setGameState(prev => ({ ...prev, isJumping: true }));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, gameState.isJumping]);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isGameOver: false,
      isFullscreen: true
    }));
    setObstacles([]);
    setCoins([]);
    toast({
      title: "Eclipse Realms Started!",
      description: "Use arrow keys to move, spacebar to jump!",
    });
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const exitGame = () => {
    setGameState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      isFullscreen: false,
      isGameOver: false 
    }));
  };

  const resetGame = () => {
    setGameState({
      health: 100,
      coins: 0,
      score: 0,
      distance: 0,
      isPlaying: false,
      isGameOver: false,
      isFullscreen: false,
      playerLane: 0,
      selectedCharacter: gameState.selectedCharacter,
      speed: 3,
      playerY: GAME_HEIGHT - 80,
      isJumping: false
    });
    setObstacles([]);
    setCoins([]);
  };

  // If in fullscreen mode, show only the game
  if (gameState.isFullscreen) {
    return (
      <div className="fixed inset-0 bg-cosmic-black z-50 flex flex-col">
        {/* Header with exit button */}
        <div className="bg-cosmic-black/90 border-b border-eclipse-gold/30 p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gradient-eclipse">Eclipse Realms</h1>
          <div className="flex gap-2">
            {gameState.isPlaying && (
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
              onClick={exitGame}
              variant="outline"
              className="border-lava-red/40 text-lava-red hover:bg-lava-red/20"
            >
              Exit Game
            </Button>
          </div>
        </div>

        {/* Game area */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border-2 border-eclipse-gold/30 rounded-lg bg-cosmic-black"
            />

            {/* Game Over Overlay */}
            {gameState.isGameOver && (
              <div className="absolute inset-0 bg-cosmic-black/80 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-lava-red mb-4">Game Over!</h3>
                  <p className="text-cosmic-white/70 mb-2 text-xl">Score: {gameState.score}</p>
                  <p className="text-cosmic-white/70 mb-6 text-xl">Distance: {gameState.distance}m</p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={resetGame} className="bg-eclipse-gold hover:bg-eclipse-gold/80">
                      Play Again
                    </Button>
                    <Button onClick={exitGame} variant="outline" className="border-mystic-purple/40 text-mystic-purple">
                      Exit
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Paused Overlay */}
            {!gameState.isPlaying && !gameState.isGameOver && gameState.score > 0 && (
              <div className="absolute inset-0 bg-cosmic-black/80 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-eclipse-gold mb-4">Game Paused</h3>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => setGameState(prev => ({ ...prev, isPlaying: true }))} className="bg-eclipse-gold hover:bg-eclipse-gold/80">
                      Resume
                    </Button>
                    <Button onClick={exitGame} variant="outline" className="border-mystic-purple/40 text-mystic-purple">
                      Exit
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-cosmic-black/90 border-t border-eclipse-gold/30 p-4 flex justify-between items-center text-cosmic-white">
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-green-400" />
              Health: {gameState.health}%
            </span>
            <span className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              Coins: {gameState.coins}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-eclipse-gold" />
              Score: {gameState.score}
            </span>
            <span>Distance: {gameState.distance}m</span>
          </div>
          <div className="text-sm text-cosmic-white/70">
            {selectedChar.emoji} {selectedChar.name}
          </div>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden bg-cosmic-black/90 border-t border-eclipse-gold/30 p-4">
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <Button
              onClick={() => setGameState(prev => ({ ...prev, playerLane: Math.max(-1, prev.playerLane - 1) }))}
              variant="outline"
              className="border-mystic-purple/40 text-mystic-purple h-12"
              disabled={!gameState.isPlaying}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <Button
              onClick={() => !gameState.isJumping && setGameState(prev => ({ ...prev, isJumping: true }))}
              variant="outline"
              className="border-eclipse-gold/40 text-eclipse-gold h-12"
              disabled={!gameState.isPlaying}
            >
              <ArrowUp className="w-6 h-6" />
            </Button>
            <Button
              onClick={() => setGameState(prev => ({ ...prev, playerLane: Math.min(1, prev.playerLane + 1) }))}
              variant="outline"
              className="border-mystic-purple/40 text-mystic-purple h-12"
              disabled={!gameState.isPlaying}
            >
              <ArrowRight className="w-6 h-6" />
            </Button>
          </div>
          <p className="text-center text-sm text-cosmic-white/60 mt-2">
            Move left/right • Jump • Avoid obstacles • Collect coins
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-eclipse-gold/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-mystic-purple/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10" id="game">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-eclipse-gold/20 text-eclipse-gold border-eclipse-gold/30">
            <Gamepad2 className="w-3 h-3 mr-1" />
            Eclipse Realms - Adventure Awaits
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient-eclipse">Eclipse</span>{" "}
            <span className="text-gradient-rift">Realms</span>
          </h2>
          <p className="text-xl text-cosmic-white/70 max-w-3xl mx-auto">
            Run through mystical Eclipse Realms, avoid cosmic obstacles, collect star coins, and master unique character abilities!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Character Selection */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card border-mystic-purple/20 mb-4">
              <CardHeader>
                <CardTitle className="text-cosmic-white text-sm">Select Character</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {characters.map((character) => (
                  <button
                    key={character.id}
                    onClick={() => setGameState(prev => ({ ...prev, selectedCharacter: character.id }))}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      gameState.selectedCharacter === character.id
                        ? 'border-eclipse-gold bg-eclipse-gold/10'
                        : 'border-mystic-purple/20 hover:border-mystic-purple/40'
                    }`}
                    disabled={gameState.isPlaying}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{character.emoji}</span>
                      <div>
                        <div className="text-cosmic-white font-semibold text-sm">{character.name}</div>
                        <div className="text-cosmic-white/60 text-xs">{character.ability}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Game Stats */}
            <Card className="bg-gradient-card border-mystic-purple/20">
              <CardHeader>
                <CardTitle className="text-cosmic-white text-sm">Game Stats</CardTitle>
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

                <div className="pt-2 border-t border-mystic-purple/20 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-cosmic-white/70 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-yellow-400" />
                      Coins
                    </span>
                    <span className="text-yellow-400 font-bold">{gameState.coins}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cosmic-white/70 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-eclipse-gold" />
                      Score
                    </span>
                    <span className="text-eclipse-gold font-bold">{gameState.score}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cosmic-white/70">Distance</span>
                    <span className="text-rift-cyan font-bold">{gameState.distance}m</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Canvas */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-card border-mystic-purple/20">
              <CardHeader>
                <CardTitle className="text-cosmic-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-eclipse-gold" />
                  Temple Run - Eclipse Adventure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={GAME_WIDTH}
                    height={GAME_HEIGHT}
                    className="border-2 border-eclipse-gold/30 rounded-lg bg-cosmic-black mx-auto block"
                  />

                  {/* Start Game Overlay */}
                  {!gameState.isPlaying && !gameState.isGameOver && gameState.score === 0 && (
                    <div className="absolute inset-0 bg-cosmic-black/80 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-eclipse-gold mb-2">Ready for Eclipse Realms?</h3>
                        <p className="text-cosmic-white/70 mb-4">Choose your character and start your cosmic adventure!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile controls */}
                <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
                  <Button
                    onClick={() => setGameState(prev => ({ ...prev, playerLane: Math.max(-1, prev.playerLane - 1) }))}
                    variant="outline"
                    className="border-mystic-purple/40 text-mystic-purple"
                    disabled={!gameState.isPlaying}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => !gameState.isJumping && setGameState(prev => ({ ...prev, isJumping: true }))}
                    variant="outline"
                    className="border-eclipse-gold/40 text-eclipse-gold"
                    disabled={!gameState.isPlaying}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setGameState(prev => ({ ...prev, playerLane: Math.min(1, prev.playerLane + 1) }))}
                    variant="outline"
                    className="border-mystic-purple/40 text-mystic-purple"
                    disabled={!gameState.isPlaying}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Game Controls */}
                <div className="flex gap-2 mt-4 justify-center">
                  <Button 
                    onClick={startGame}
                    className="bg-gradient-to-r from-eclipse-gold to-rift-cyan hover:from-eclipse-gold/80 hover:to-rift-cyan/80 text-cosmic-white border-0"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Eclipse Realms
                  </Button>
                  
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
                <div className="mt-4 text-center text-sm text-cosmic-white/60 space-y-1">
                  <p>Desktop: Arrow Keys / A,D: Move • Spacebar / W: Jump</p>
                  <p>Mobile: Use the control buttons above</p>
                  <p>Collect star coins • Avoid cosmic obstacles • Master the Eclipse Realms!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TempleRunGame;