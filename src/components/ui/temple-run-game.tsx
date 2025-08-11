import { useState, useEffect, useRef, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Box, Sphere, Cylinder } from "@react-three/drei";
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
  Coins
} from "lucide-react";
import * as THREE from 'three';

interface GameState {
  health: number;
  coins: number;
  score: number;
  distance: number;
  isPlaying: boolean;
  isGameOver: boolean;
  playerLane: number; // -1, 0, 1 (left, center, right)
  selectedCharacter: string;
  speed: number;
}

const characters = [
  { id: "shadowmancer", name: "Shadowmancer", color: "#8B5CF6", ability: "Shadow Dash" },
  { id: "riftblade", name: "Riftblade", color: "#06B6D4", ability: "Time Slice" },
  { id: "techshaman", name: "Tech Shaman", color: "#F59E0B", ability: "Digital Shield" },
  { id: "chronoarcher", name: "Chrono Archer", color: "#EF4444", ability: "Time Slow" }
];

// Player component
function Player({ position, selectedCharacter, isJumping }: { position: [number, number, number], selectedCharacter: string, isJumping: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const character = characters.find(c => c.id === selectedCharacter) || characters[0];
  
  useFrame((state) => {
    if (meshRef.current) {
      // Bobbing animation while running
      meshRef.current.position.y = position[1] + (isJumping ? 0 : Math.sin(state.clock.elapsedTime * 8) * 0.1);
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.8, 1.6, 0.8]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color={character.color} />
      </Box>
      <Text 
        position={[0, 2.5, 0]} 
        fontSize={0.3} 
        color={character.color}
        anchorX="center" 
        anchorY="middle"
      >
        {character.name}
      </Text>
    </group>
  );
}

// Obstacle component
function Obstacle({ position, type }: { position: [number, number, number], type: string }) {
  return (
    <Box args={[1, 2, 1]} position={position}>
      <meshStandardMaterial color={type === 'wall' ? '#8B4513' : '#FF0000'} />
    </Box>
  );
}

// Coin component
function Coin({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });

  return (
    <Cylinder ref={meshRef} args={[0.3, 0.3, 0.1, 8]} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#FFD700" />
    </Cylinder>
  );
}

// Ground segment component
function GroundSegment({ position }: { position: [number, number, number] }) {
  return (
    <Box args={[6, 0.2, 20]} position={position}>
      <meshStandardMaterial color="#8B4513" />
    </Box>
  );
}

// Game scene component
function GameScene({ gameState, onCoinCollect, onObstacleHit }: {
  gameState: GameState;
  onCoinCollect: () => void;
  onObstacleHit: () => void;
}) {
  const [obstacles, setObstacles] = useState<Array<{id: number, position: [number, number, number], type: string}>>([]);
  const [coins, setCoins] = useState<Array<{id: number, position: [number, number, number]}>>([]);
  const [groundSegments, setGroundSegments] = useState<Array<{id: number, position: [number, number, number]}>>([]);
  const [playerY, setPlayerY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  
  const cameraRef = useRef<THREE.Camera>(null);
  const { camera } = useThree();

  // Initialize ground segments
  useEffect(() => {
    const segments = [];
    for (let i = 0; i < 10; i++) {
      segments.push({
        id: i,
        position: [0, -0.1, -i * 20] as [number, number, number]
      });
    }
    setGroundSegments(segments);
  }, []);

  // Game loop
  useFrame((state, delta) => {
    if (!gameState.isPlaying) return;

    const speed = gameState.speed;
    
    // Move camera forward
    camera.position.z += speed * delta;
    
    // Update obstacles
    setObstacles(prev => {
      const updated = prev.map(obstacle => ({
        ...obstacle,
        position: [obstacle.position[0], obstacle.position[1], obstacle.position[2] + speed * delta] as [number, number, number]
      })).filter(obstacle => obstacle.position[2] < 10);

      // Add new obstacles
      if (Math.random() < 0.02) {
        const lanes = [-2, 0, 2];
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        updated.push({
          id: Date.now(),
          position: [lane, 1, camera.position.z - 50] as [number, number, number],
          type: 'wall'
        });
      }

      return updated;
    });

    // Update coins
    setCoins(prev => {
      const updated = prev.map(coin => ({
        ...coin,
        position: [coin.position[0], coin.position[1], coin.position[2] + speed * delta] as [number, number, number]
      })).filter(coin => coin.position[2] < 10);

      // Add new coins
      if (Math.random() < 0.03) {
        const lanes = [-2, 0, 2];
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        updated.push({
          id: Date.now(),
          position: [lane, 1.5, camera.position.z - 40] as [number, number, number]
        });
      }

      return updated;
    });

    // Update ground segments
    setGroundSegments(prev => {
      const updated = prev.map(segment => ({
        ...segment,
        position: [segment.position[0], segment.position[1], segment.position[2] + speed * delta] as [number, number, number]
      }));

      // Add new ground segments if needed
      const furthestZ = Math.min(...updated.map(s => s.position[2]));
      if (furthestZ > camera.position.z - 100) {
        updated.push({
          id: Date.now(),
          position: [0, -0.1, furthestZ - 20] as [number, number, number]
        });
      }

      return updated.filter(segment => segment.position[2] < camera.position.z + 20);
    });

    // Update player jumping
    if (isJumping) {
      setPlayerY(prev => {
        const newY = prev + (prev < 2 ? 8 * delta : -8 * delta);
        if (newY <= 0) {
          setIsJumping(false);
          return 0;
        }
        return newY;
      });
    }

    // Check collisions
    const playerPos = [gameState.playerLane * 2, playerY, camera.position.z];
    
    // Check obstacle collisions
    obstacles.forEach(obstacle => {
      const distance = Math.sqrt(
        Math.pow(obstacle.position[0] - playerPos[0], 2) +
        Math.pow(obstacle.position[2] - playerPos[2], 2)
      );
      if (distance < 1.5 && playerPos[1] < 1.5) {
        onObstacleHit();
      }
    });

    // Check coin collisions
    coins.forEach(coin => {
      const distance = Math.sqrt(
        Math.pow(coin.position[0] - playerPos[0], 2) +
        Math.pow(coin.position[2] - playerPos[2], 2)
      );
      if (distance < 1) {
        onCoinCollect();
        setCoins(prev => prev.filter(c => c.id !== coin.id));
      }
    });
  });

  const jump = useCallback(() => {
    if (!isJumping && gameState.isPlaying) {
      setIsJumping(true);
    }
  }, [isJumping, gameState.isPlaying]);

  // Controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          // Move left logic handled by parent
          break;
        case 'ArrowRight':
        case 'd':
          // Move right logic handled by parent
          break;
        case ' ':
        case 'ArrowUp':
        case 'w':
          e.preventDefault();
          jump();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.isPlaying, jump]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Player */}
      <Player 
        position={[gameState.playerLane * 2, playerY, 0]} 
        selectedCharacter={gameState.selectedCharacter}
        isJumping={isJumping}
      />
      
      {/* Ground segments */}
      {groundSegments.map(segment => (
        <GroundSegment key={segment.id} position={segment.position} />
      ))}
      
      {/* Obstacles */}
      {obstacles.map(obstacle => (
        <Obstacle key={obstacle.id} position={obstacle.position} type={obstacle.type} />
      ))}
      
      {/* Coins */}
      {coins.map(coin => (
        <Coin key={coin.id} position={coin.position} />
      ))}
    </>
  );
}

const TempleRunGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    coins: 0,
    score: 0,
    distance: 0,
    isPlaying: false,
    isGameOver: false,
    playerLane: 0,
    selectedCharacter: "shadowmancer",
    speed: 10
  });

  // Game loop for score and distance
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        distance: prev.distance + 1,
        score: prev.score + 1,
        speed: Math.min(20, prev.speed + 0.01) // Gradually increase speed
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.isPlaying]);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isGameOver: false
    }));
    toast({
      title: "Temple Run Started!",
      description: "Use arrow keys to move, spacebar to jump!",
    });
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const resetGame = () => {
    setGameState({
      health: 100,
      coins: 0,
      score: 0,
      distance: 0,
      isPlaying: false,
      isGameOver: false,
      playerLane: 0,
      selectedCharacter: gameState.selectedCharacter,
      speed: 10
    });
  };

  const movePlayer = (direction: 'left' | 'right') => {
    if (!gameState.isPlaying) return;
    
    setGameState(prev => ({
      ...prev,
      playerLane: direction === 'left' 
        ? Math.max(-1, prev.playerLane - 1)
        : Math.min(1, prev.playerLane + 1)
    }));
  };

  const collectCoin = () => {
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + 1,
      score: prev.score + 10
    }));
  };

  const hitObstacle = () => {
    setGameState(prev => {
      const newHealth = prev.health - 25;
      if (newHealth <= 0) {
        toast({
          title: "Game Over!",
          description: `Final Score: ${prev.score} | Distance: ${prev.distance}m`,
          variant: "destructive"
        });
        return {
          ...prev,
          health: 0,
          isPlaying: false,
          isGameOver: true
        };
      }
      return { ...prev, health: newHealth };
    });
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
          movePlayer('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying]);

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
            Temple Run - Eclipse Edition
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient-eclipse">Eclipse</span>{" "}
            <span className="text-gradient-rift">Temple Run</span>
          </h2>
          <p className="text-xl text-cosmic-white/70 max-w-3xl mx-auto">
            Run through mystical temples, avoid obstacles, collect coins, and unlock unique characters!
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
                    <div className="text-cosmic-white font-semibold text-sm">{character.name}</div>
                    <div className="text-cosmic-white/60 text-xs">{character.ability}</div>
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
                  Temple Run - 3D Adventure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-cosmic-black border-2 border-eclipse-gold/30 rounded-lg h-96 overflow-hidden">
                  <Canvas camera={{ position: [0, 3, 5], fov: 75 }}>
                    <GameScene 
                      gameState={gameState}
                      onCoinCollect={collectCoin}
                      onObstacleHit={hitObstacle}
                    />
                  </Canvas>

                  {/* Game Over Overlay */}
                  {gameState.isGameOver && (
                    <div className="absolute inset-0 bg-cosmic-black/80 flex items-center justify-center">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-lava-red mb-2">Game Over!</h3>
                        <p className="text-cosmic-white/70 mb-2">Score: {gameState.score}</p>
                        <p className="text-cosmic-white/70 mb-4">Distance: {gameState.distance}m</p>
                        <Button onClick={resetGame} className="bg-eclipse-gold hover:bg-eclipse-gold/80">
                          Play Again
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Start Game Overlay */}
                  {!gameState.isPlaying && !gameState.isGameOver && gameState.score === 0 && (
                    <div className="absolute inset-0 bg-cosmic-black/80 flex items-center justify-center">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-eclipse-gold mb-2">Ready to Run?</h3>
                        <p className="text-cosmic-white/70 mb-4">Click Start to begin your temple adventure</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Game Controls */}
                <div className="flex gap-2 mt-4 justify-center">
                  {!gameState.isPlaying && !gameState.isGameOver ? (
                    <Button 
                      onClick={startGame}
                      className="bg-gradient-to-r from-eclipse-gold to-rift-cyan hover:from-eclipse-gold/80 hover:to-rift-cyan/80 text-cosmic-white border-0"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Game
                    </Button>
                  ) : gameState.isPlaying ? (
                    <Button 
                      onClick={pauseGame}
                      variant="outline"
                      className="border-mystic-purple/40 text-mystic-purple hover:bg-mystic-purple/20"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  ) : null}
                  
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
                  <p>Arrow Keys / A,D: Move Left/Right • Spacebar / W: Jump</p>
                  <p>Collect coins • Avoid obstacles • Run as far as you can!</p>
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