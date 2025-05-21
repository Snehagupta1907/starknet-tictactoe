"use client"
import React, { useState, useEffect } from 'react';
import { useAccount, useConnect } from '@starknet-react/core';
import { Coins } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTicTacToeContract } from '@/src/hooks/useGameContract';
import ControllerConnector from "@cartridge/connector/controller";

export default function TicTacToeLobby() {
  // Router for navigation
  const router = useRouter();
  
  // Starknet account connection
  const { address, isConnected, account } = useAccount();
  const { connectors } = useConnect();
  
  // Game state
  const [status, setStatus] = useState('Connect wallet to play');
  const [betAmount, setBetAmount] = useState<string>("100000000000"); // 0.0001 STRK by default
  const [gameStarting, setGameStarting] = useState(false);
  
  // User state
  const [username, setUsername] = useState<string>();
  const [connected, setConnected] = useState(false);

  // Connect controller
  useEffect(() => {
    if (!address) return;
    const controller = connectors.find((c) => c instanceof ControllerConnector);
    if (controller) {
      controller.username()?.then((n) => setUsername(n));
      setConnected(true);
    }
  }, [address, connectors]);
  
  // Contract hook
  const { startGame } = useTicTacToeContract(connected, account);

  // Update game status when connection changes
  useEffect(() => {
    if (isConnected) {
      setStatus('Ready to start a new game');
    } else {
      setStatus('Connect wallet to play');
    }
  }, [isConnected]);

  // Handle starting a new game
  const handleStartGame = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    setGameStarting(true);
    setStatus('Starting new game...');
    
    try {
      const gameId = await startGame(betAmount);
      
      if (gameId !== null) {
        toast.success("Game created successfully!");
        // Navigate to the game page with the game ID
        router.push(`/tic-tac-toe/${gameId}`);
      } else {
        setStatus('Failed to start game');
        toast.error("Failed to create game");
      }
    } catch (error) {
      console.error("Error starting game:", error);
      setStatus('Error starting game');
      toast.error("Error creating game");
    } finally {
      setGameStarting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Blockchain Tic Tac Toe</h1>
      
      <div className="max-w-md w-full border-2 border-white p-8 rounded-lg shadow-lg">
        
        {/* Status indicator */}
        <div className="mb-8 text-lg font-medium px-4 py-3 rounded-lg text-center bg-blue-900/30">
          {status}
        </div>
        
        {/* Bet amount selector */}
        {isConnected && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <Coins className="text-yellow-400 w-5 h-5" />
              <span className="text-lg">Select Bet Amount (STRK)</span>
            </div>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => setBetAmount("100000000000")} 
                className={`px-4 py-2 rounded font-medium transition-colors ${betAmount === "100000000000" ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                0.0001
              </button>
              <button 
                onClick={() => setBetAmount("1000000000000")} 
                className={`px-4 py-2 rounded font-medium transition-colors ${betAmount === "1000000000000" ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                0.001
              </button>
              <button 
                onClick={() => setBetAmount("10000000000000")} 
                className={`px-4 py-2 rounded font-medium transition-colors ${betAmount === "10000000000000" ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                0.01
              </button>
            </div>
          </div>
        )}
        
        {/* Start game button */}
        <div className="flex justify-center">
          <button
            onClick={handleStartGame}
            disabled={!isConnected || gameStarting}
            className={`flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 px-6 py-3 rounded-md text-lg font-medium w-full max-w-xs
              ${(!isConnected || gameStarting) ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <Coins className="w-5 h-5" />
            {gameStarting ? "Creating Game..." : "Start New Game"}
          </button>
        </div>
      </div>
    </div>
  );
}