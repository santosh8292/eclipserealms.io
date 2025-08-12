import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Plane, Stars, Environment, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
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
  ArrowUp,
  X
} from "lucide-react";

interface Character {
  name: string;
  color: string;
  abilities: string[];
  model: string;
  emoji: string;
}

interface Realm {
  name: string;
  theme: string;
  bgColor: string;
  fogColor: string;
  description: string;
  ambientColor: string;
}

interface GameState {
  health: number;
  coins: number;
  score: number;
  distance: number;
  isPlaying: boolean;
  isGameOver: boolean;
  isFullscreen: boolean;
  playerLane: number;
  selectedCharacter: string;
  selectedRealm: number;
  speed: number;
  playerY: number;
  isJumping: boolean;
}

interface GameObject3D {
  id: number;
  position: THREE.Vector3;
  type: 'obstacle' | 'coin' | 'enemy' | 'powerup';
  lane: number;
}

const characters: Character[] = [
  {
    name: "Shadowmancer",
    color: "#8B00FF",
    abilities: ["Shadow Step", "Dark Magic", "Void Walk"],
    model: "shadow",
    emoji: "🌙"
  },
  {
    name: "Riftblade", 
    color: "#FF4500",
    abilities: ["Dimensional Cut", "Portal Strike", "Energy Slash"],
    model: "blade",
    emoji: "⚔️"
  },
  {
    name: "Tech Shaman",
    color: "#00FFFF", 
    abilities: ["Cyber Magic", "Tech Fusion", "Digital Storm"],
    model: "tech",
    emoji: "🔮"
  },
  {
    name: "Chrono-Archer",
    color: "#FFD700",
    abilities: ["Time Arrow", "Temporal Shift", "Future Sight"],
    model: "archer",
    emoji: "🏹"
  }
];

const realms: Realm[] = [
  {
    name: "Frozen Nexus",
    theme: "ice",
    bgColor: "#87CEEB",
    fogColor: "#B0E0E6",
    ambientColor: "#E0F6FF",
    description: "A crystalline realm of eternal winter where ice shards float through the air"
  },
  {
    name: "Celestial Sanctum", 
    theme: "celestial",
    bgColor: "#191970",
    fogColor: "#483D8B",
    ambientColor: "#E6E6FA",
    description: "A divine realm among the stars where cosmic energy flows"
  },
  {
    name: "Lava Forge",
    theme: "fire",
    bgColor: "#FF4500",
    fogColor: "#FF6347",
    ambientColor: "#FFE4E1",
    description: "A volcanic realm of molten power with rivers of lava"
  },
  {
    name: "Cyber Core",
    theme: "cyber",
    bgColor: "#000011",
    fogColor: "#0F0F23",
    ambientColor: "#E0FFFF",
    description: "A digital realm of infinite data streams and neon lights"
  }
];

// 3D Character Component
function Character3D({ character, position, isPlayer = false }: { character: Character, position: THREE.Vector3, isPlayer?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isPlayer) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Character Body */}
      <Box ref={meshRef} args={[0.8, 1.6, 0.4]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color={character.color} metalness={0.3} roughness={0.7} />
      </Box>
      
      {/* Character Head */}
      <Sphere args={[0.3]} position={[0, 1.8, 0]}>
        <meshStandardMaterial color={character.color} metalness={0.2} roughness={0.8} />
      </Sphere>
      
      {/* Character Glow Effect */}
      <Sphere args={[1.2]} position={[0, 1, 0]}>
        <meshBasicMaterial color={character.color} transparent opacity={0.1} />
      </Sphere>
      
      {/* Character Name */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {character.name}
      </Text>
    </group>
  );
}

// 3D Obstacle Component
function Obstacle3D({ position, type }: { position: THREE.Vector3, type: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  const color = type === 'enemy' ? '#FF0000' : '#8B0000';
  
  return (
    <Box ref={meshRef} args={[1, 2, 1]} position={position}>
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </Box>
  );
}

// 3D Coin Component
function Coin3D({ position }: { position: THREE.Vector3 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.05;
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[0.3]} position={position}>
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.1} />
      </Sphere>
    </Float>
  );
}

// 3D Game World Component
function GameWorld3D({ gameState, obstacles, coins, selectedCharacter, selectedRealm }: {
  gameState: GameState;
  obstacles: GameObject3D[];
  coins: GameObject3D[];
  selectedCharacter: Character;
  selectedRealm: Realm;
}) {
  const { camera } = useThree();
  
  useFrame(() => {
    // Camera follows player
    const targetX = gameState.playerLane * 2;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.1);
    camera.position.y = 8 + gameState.playerY * 0.1;
    camera.position.z = 10;
    camera.lookAt(targetX, 0, -5);
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} color={selectedRealm.ambientColor} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[0, 10, 0]} intensity={0.5} color={selectedRealm.bgColor} />
      
      {/* Environment */}
      <Stars radius={300} depth={60} count={1000} factor={7} saturation={0} fade />
      
      {/* Ground/Platform */}
      <Plane args={[20, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, -10]}>
        <meshStandardMaterial color="#2D1B69" metalness={0.3} roughness={0.7} />
      </Plane>
      
      {/* Lane Markers */}
      {[-2, 0, 2].map((x, i) => (
        <Box key={i} args={[0.1, 0.2, 100]} position={[x, -0.8, -10]}>
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.2} />
        </Box>
      ))}
      
      {/* Player Character */}
      <Character3D 
        character={selectedCharacter} 
        position={new THREE.Vector3(gameState.playerLane * 2, gameState.playerY, 0)}
        isPlayer={true}
      />
      
      {/* Obstacles */}
      {obstacles.map((obstacle) => (
        <Obstacle3D 
          key={obstacle.id} 
          position={obstacle.position} 
          type={obstacle.type}
        />
      ))}
      
      {/* Coins */}
      {coins.map((coin) => (
        <Coin3D key={coin.id} position={coin.position} />
      ))}
      
      {/* Realm-specific Effects */}
      {selectedRealm.theme === 'ice' && (
        <>
          {Array.from({ length: 50 }).map((_, i) => (
            <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5}>
              <Box 
                args={[0.1, 0.1, 0.1]} 
                position={[
                  (Math.random() - 0.5) * 20,
                  Math.random() * 15,
                  (Math.random() - 0.5) * 50
                ]}
              >
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
              </Box>
            </Float>
          ))}
        </>
      )}
      
      {selectedRealm.theme === 'fire' && (
        <>
          {Array.from({ length: 30 }).map((_, i) => (
            <Sphere 
              key={i}
              args={[0.2]} 
              position={[
                (Math.random() - 0.5) * 20,
                Math.random() * 10,
                (Math.random() - 0.5) * 50
              ]}
            >
              <meshBasicMaterial color="#FF4500" transparent opacity={0.6} />
            </Sphere>
          ))}
        </>
      )}
    </>
  );
}

// Main Game Component
const EclipseRealmsGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    coins: 0,
    score: 0,
    distance: 0,
    isPlaying: false,
    isGameOver: false,
    isFullscreen: false,
    playerLane: 0,
    selectedCharacter: "shadow",
    selectedRealm: 0,
    speed: 2,
    playerY: 0,
    isJumping: false
  });

  const [obstacles, setObstacles] = useState<GameObject3D[]>([]);
  const [coins, setCoins] = useState<GameObject3D[]>([]);
  const gameLoopRef = useRef<number>();

  const selectedChar = characters.find(c => c.model === gameState.selectedCharacter) || characters[0];
  const selectedRealm = realms[gameState.selectedRealm];

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const gameLoop = () => {
      // Update game state
      setGameState(prev => {
        const newState = { ...prev };
        
        // Handle jumping
        if (newState.isJumping) {
          if (newState.playerY < 3) {
            newState.playerY += 0.3;
          } else {
            newState.isJumping = false;
          }
        } else if (newState.playerY > 0) {
          newState.playerY -= 0.3;
        } else {
          newState.playerY = 0;
        }

        // Update distance and score
        newState.distance += 0.5;
        newState.score += 1;
        newState.speed = Math.min(8, 2 + newState.distance / 100);

        return newState;
      });

      // Move and spawn obstacles
      setObstacles(prev => {
        const updated = prev.map(obs => ({
          ...obs,
          position: new THREE.Vector3(obs.position.x, obs.position.y, obs.position.z + gameState.speed)
        })).filter(obs => obs.position.z < 15);

        // Spawn new obstacles
        if (Math.random() < 0.02) {
          const lane = Math.floor(Math.random() * 3) - 1;
          updated.push({
            id: Date.now() + Math.random(),
            position: new THREE.Vector3(lane * 2, 0, -30),
            type: Math.random() < 0.7 ? 'obstacle' : 'enemy',
            lane
          });
        }

        return updated;
      });

      // Move and spawn coins
      setCoins(prev => {
        const updated = prev.map(coin => ({
          ...coin,
          position: new THREE.Vector3(coin.position.x, coin.position.y, coin.position.z + gameState.speed)
        })).filter(coin => coin.position.z < 15);

        // Spawn new coins
        if (Math.random() < 0.015) {
          const lane = Math.floor(Math.random() * 3) - 1;
          updated.push({
            id: Date.now() + Math.random(),
            position: new THREE.Vector3(lane * 2, 1, -25),
            type: 'coin',
            lane
          });
        }

        return updated;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.speed]);

  // Collision detection
  useEffect(() => {
    if (!gameState.isPlaying) return;

    // Check obstacle collisions
    obstacles.forEach(obstacle => {
      if (obstacle.position.z > -2 && obstacle.position.z < 2 &&
          obstacle.lane === gameState.playerLane &&
          gameState.playerY < 2) {
        setGameState(prev => {
          const newHealth = prev.health - 25;
          if (newHealth <= 0) {
            toast({
              title: "Eclipse Eclipsed!",
              description: `Your journey ends. Score: ${prev.score}`,
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
      if (coin.position.z > -2 && coin.position.z < 2 &&
          coin.lane === gameState.playerLane) {
        setGameState(prev => ({
          ...prev,
          coins: prev.coins + 1,
          score: prev.score + 50
        }));
        setCoins(prev => prev.filter(c => c.id !== coin.id));
      }
    });
  }, [obstacles, coins, gameState.playerLane, gameState.playerY, gameState.isPlaying]);

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
          if (!gameState.isJumping && gameState.playerY <= 0.1) {
            setGameState(prev => ({ ...prev, isJumping: true }));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, gameState.isJumping, gameState.playerY]);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isGameOver: false,
      isFullscreen: true,
      health: 100,
      coins: 0,
      score: 0,
      distance: 0,
      playerLane: 0,
      speed: 2,
      playerY: 0,
      isJumping: false
    }));
    setObstacles([]);
    setCoins([]);
    toast({
      title: "Eclipse Realms Awakened!",
      description: `${selectedChar.name} enters ${selectedRealm.name}`,
    });
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
    setGameState(prev => ({
      ...prev,
      health: 100,
      coins: 0,
      score: 0,
      distance: 0,
      isPlaying: false,
      isGameOver: false,
      playerLane: 0,
      speed: 2,
      playerY: 0,
      isJumping: false
    }));
    setObstacles([]);
    setCoins([]);
  };

  // Fullscreen 3D Game View
  if (gameState.isFullscreen) {
    return (
      <div className="fixed inset-0 bg-cosmic-black z-50 flex flex-col">
        {/* Header */}
        <div className="bg-cosmic-black/95 border-b border-eclipse-gold/30 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gradient-eclipse">Eclipse Realms</h1>
            <p className="text-sm text-cosmic-white/70">{selectedRealm.name}</p>
          </div>
          <div className="flex gap-2">
            {gameState.isPlaying && (
              <Button 
                onClick={() => setGameState(prev => ({ ...prev, isPlaying: false }))}
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
              <X className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>

        {/* 3D Game Canvas */}
        <div className="flex-1 relative">
          <Canvas
            shadows
            camera={{ position: [0, 8, 10], fov: 60 }}
            style={{ background: selectedRealm.bgColor }}
          >
            <Suspense fallback={null}>
              <GameWorld3D 
                gameState={gameState}
                obstacles={obstacles}
                coins={coins}
                selectedCharacter={selectedChar}
                selectedRealm={selectedRealm}
              />
            </Suspense>
            <fog attach="fog" args={[selectedRealm.fogColor, 20, 100]} />
          </Canvas>

          {/* Game UI Overlays */}
          {gameState.isGameOver && (
            <div className="absolute inset-0 bg-cosmic-black/90 flex items-center justify-center">
              <div className="text-center bg-cosmic-black/80 p-8 rounded-xl border border-eclipse-gold/30">
                <h3 className="text-4xl font-bold text-lava-red mb-4">Eclipse Eclipsed!</h3>
                <p className="text-cosmic-white/70 mb-2 text-xl">Final Score: {gameState.score}</p>
                <p className="text-cosmic-white/70 mb-6 text-xl">Distance: {gameState.distance.toFixed(1)}m</p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={resetGame} className="bg-eclipse-gold hover:bg-eclipse-gold/80">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Realmwalk Again
                  </Button>
                  <Button onClick={exitGame} variant="outline" className="border-mystic-purple/40 text-mystic-purple">
                    Exit Nexus
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!gameState.isPlaying && !gameState.isGameOver && (
            <div className="absolute inset-0 bg-cosmic-black/90 flex items-center justify-center">
              <div className="text-center bg-cosmic-black/80 p-8 rounded-xl border border-eclipse-gold/30">
                <h3 className="text-4xl font-bold text-eclipse-gold mb-4">Ready to Enter {selectedRealm.name}?</h3>
                <p className="text-cosmic-white/70 mb-6">{selectedRealm.description}</p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={startGame} className="bg-eclipse-gold hover:bg-eclipse-gold/80">
                    <Play className="w-4 h-4 mr-2" />
                    Begin Realmwalk
                  </Button>
                  <Button onClick={exitGame} variant="outline" className="border-mystic-purple/40 text-mystic-purple">
                    Return to Nexus
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game Stats HUD */}
        <div className="bg-cosmic-black/95 border-t border-eclipse-gold/30 p-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-6 text-sm">
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-green-400" />
                <span className="text-cosmic-white">Health: {gameState.health}%</span>
              </span>
              <span className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-eclipse-gold" />
                <span className="text-cosmic-white">Coins: {gameState.coins}</span>
              </span>
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-mystic-purple" />
                <span className="text-cosmic-white">Score: {gameState.score}</span>
              </span>
              <span className="text-cosmic-white">Distance: {gameState.distance.toFixed(1)}m</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-cosmic-white/70">
                <span className="text-eclipse-gold">{selectedChar.emoji}</span> {selectedChar.name}
              </div>
              <div className="text-xs text-cosmic-white/50">
                Arrow Keys/WASD: Move • Spacebar: Jump
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Menu
  return (
    <section className="py-20 bg-gradient-to-b from-cosmic-black to-mystic-purple/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-eclipse-gold/20 text-eclipse-gold mb-4">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Eclipse Realms Experience
          </Badge>
          <h2 className="text-4xl font-bold text-gradient-eclipse mb-4">
            Enter the Multiverse
          </h2>
          <p className="text-cosmic-white/70 text-lg max-w-2xl mx-auto">
            Choose your Realmwalker and traverse the broken dimensions in this immersive 3D adventure
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Character Selection */}
          <Card className="bg-cosmic-black/60 border-eclipse-gold/30">
            <CardHeader>
              <CardTitle className="text-eclipse-gold flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Choose Your Realmwalker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {characters.map((char) => (
                  <div
                    key={char.model}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      gameState.selectedCharacter === char.model
                        ? 'border-eclipse-gold bg-eclipse-gold/20'
                        : 'border-cosmic-white/20 hover:border-eclipse-gold/50'
                    }`}
                    onClick={() => setGameState(prev => ({ ...prev, selectedCharacter: char.model }))}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{char.emoji}</div>
                      <h3 className="text-cosmic-white font-bold mb-1">{char.name}</h3>
                      <div className="text-xs text-cosmic-white/60 space-y-1">
                        {char.abilities.map((ability, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-eclipse-gold rounded-full"></div>
                            {ability}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Realm Selection */}
          <Card className="bg-cosmic-black/60 border-eclipse-gold/30">
            <CardHeader>
              <CardTitle className="text-eclipse-gold flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Select Your Realm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {realms.map((realm, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      gameState.selectedRealm === index
                        ? 'border-eclipse-gold bg-eclipse-gold/20'
                        : 'border-cosmic-white/20 hover:border-eclipse-gold/50'
                    }`}
                    onClick={() => setGameState(prev => ({ ...prev, selectedRealm: index }))}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full border-2"
                        style={{ backgroundColor: realm.bgColor, borderColor: realm.fogColor }}
                      ></div>
                      <div>
                        <h3 className="text-cosmic-white font-bold">{realm.name}</h3>
                        <p className="text-cosmic-white/60 text-sm">{realm.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Game Button */}
        <div className="text-center mt-12">
          <Button 
            onClick={startGame}
            size="lg"
            className="bg-gradient-to-r from-eclipse-gold to-lava-red hover:from-eclipse-gold/80 hover:to-lava-red/80 text-cosmic-black font-bold px-12 py-6 text-xl"
          >
            <Play className="w-6 h-6 mr-3" />
            Eclipse Realms Game Play Now
          </Button>
          <p className="text-cosmic-white/50 text-sm mt-4">
            Experience true 3D multiverse exploration • By Santosh Khadka
          </p>
        </div>
      </div>
    </section>
  );
};

export default EclipseRealmsGame;