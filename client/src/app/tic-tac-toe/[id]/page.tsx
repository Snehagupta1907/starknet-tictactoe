/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { X, Circle, Home, Trophy } from 'lucide-react';
import { useAccount, useConnect } from '@starknet-react/core';
import { toast } from 'react-hot-toast';
import { useTicTacToeContract } from '@/src/hooks/useGameContract';
import ControllerConnector from "@cartridge/connector/controller";
import { useRouter } from 'next/navigation';

interface CellProps {
  value: string | null;
  onClick: () => void;
  winning: boolean;
}

const Cell = ({ value, onClick, winning }: CellProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full h-24 flex items-center justify-center rounded-md transition-all duration-200 
        ${value ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700'} 
        ${winning ? 'bg-emerald-900' : 'bg-gray-800'}`}
    >
      {value === 'X' && <X className="text-blue-400 w-12 h-12" />}
      {value === 'O' && <Circle className="text-rose-400 w-12 h-12" />}
    </button>
  );
};

// Function to convert between 1D and 2D indices
const to1DIndex = (x: number, y: number): number => y * 3 + x;
const to2DIndex = (index: number): [number, number] => [index % 3, Math.floor(index / 3)];

export default function TicTacToeGame({ params }: { params: { id: string } }) {
  const gameId = params.id;
  const router = useRouter();
  
  // Starknet account connection
  const { address, isConnected, account } = useAccount();
  
  // Game state
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isPlayerNext, setIsPlayerNext] = useState(true);
  const [status, setStatus] = useState('Loading game...');
  const [gameOver, setGameOver] = useState(false);
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [scores, setScores] = useState({ player: 0, computer: 0, tie: 0 });
  const [moveInProgress, setMoveInProgress] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [playerAddress, setPlayerAddress] = useState<string | null>(null);

  const { connectors } = useConnect();
  const [username, setUsername] = useState<string>();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!address) return;
    const controller = connectors.find((c) => c instanceof ControllerConnector);
    if (controller) {
      controller.username()?.then((n) => setUsername(n));
      setConnected(true);
    }
  }, [address, connectors]);
  
  // Contract hook
  const { playMove, getGameState, moveHistory } = useTicTacToeContract(connected, account);

  // Winning combinations
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  // Check for a winner in the current board state
  const checkWinner = useCallback((squares: Array<string | null>) => {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], winningCells: pattern };
      }
    }
    
    // Check for tie
    if (squares.every((cell) => cell !== null)) {
      return { winner: 'tie', winningCells: [] };
    }
    
    return null;
  }, [winPatterns]);

  // Function to build the board from move history
  const buildBoardFromMoves = useCallback((moves: any[], playerAddr: string) => {
    const newBoard = Array(9).fill(null);
    
    // Sort moves by gameId to ensure we're processing moves in order
    const filteredMoves = moves.filter(move => move.gameId === Number(gameId));
    
    // Apply each move to the board
    filteredMoves.forEach(move => {
      const index = to1DIndex(move.x, move.y);
      newBoard[index] = move.player === 1 ? 'X' : 'O';
    });
    
    return newBoard;
  }, [gameId]);

  // Load game state on initial render and whenever moveHistory changes
  useEffect(() => {
    const fetchGameState = async () => {
      if (!isConnected || !gameId) return;
      
      try {
        setStatus('Loading game state...');
        const state = await getGameState(Number(gameId));
        
        if (!state) {
          toast.error("Game not found");
          setStatus('Game not found');
          return;
        }
        console.log({state})
        
        setGameLoaded(true);
        setPlayerAddress(state.player);
        
        // Update board using direct moves from state or build from move history
        let newBoard: Array<string | null>;
        
        if (moveHistory && moveHistory.length > 0) {
          newBoard = buildBoardFromMoves(moveHistory, state.player);
        } else {
          // If no move history, try to initialize from state.moves
          newBoard = Array(9).fill(null);
          
          // FIX: Properly handle moves data from the blockchain
          if (state.moves) {
            try {
              // Handle moves as hex string (common in blockchain data)
              if (typeof state.moves === 'string' && state.moves.startsWith('0x')) {
                // Convert hex string to number and interpret as a bit field
                const movesValue = parseInt(state.moves, 16);
                let position = 0;
                
                // Interpret each bit position as a cell in the board
                // This is an example - adjust based on your contract's data structure
                for (let i = 0; i < 9; i++) {
                  const cell = (movesValue >> (i * 2)) & 0b11;
                  if (cell === 1) {
                    newBoard[i] = 'X'; // Player
                  } else if (cell === 2) {
                    newBoard[i] = 'O'; // Computer
                  }
                }
              } 
              // Handle moves as array of objects
              else if (Array.isArray(state.moves)) {
                state.moves.forEach((move: any) => {
                  const x = typeof move.x === 'number' ? move.x : parseInt(move.x, 16);
                  const y = typeof move.y === 'number' ? move.y : parseInt(move.y, 16);
                  const index = to1DIndex(x, y);
                  newBoard[index] = move.is_player ? 'X' : 'O';
                });
              }
              // Handle moves as stringified JSON
              else if (typeof state.moves === 'string') {
                try {
                  // Try to parse if it's a JSON string
                  const parsedMoves = JSON.parse(state.moves);
                  if (Array.isArray(parsedMoves)) {
                    parsedMoves.forEach((move: any) => {
                      const x = typeof move.x === 'number' ? move.x : parseInt(move.x, 16);
                      const y = typeof move.y === 'number' ? move.y : parseInt(move.y, 16);
                      const index = to1DIndex(x, y);
                      newBoard[index] = move.is_player ? 'X' : 'O';
                    });
                  }
                } catch (parseError) {
                  // If not a valid JSON, it might be another format like a bitmap
                  console.log("Not a JSON string, interpreting as another format", state.moves);
                  // Log available move data for debugging
                  console.log("Raw moves data for debugging:", state.moves);
                  // We'll reconstruct the board from moves_made and other state info
                  if (state.moves_made > 0) {
                    // If we know moves were made but can't parse them,
                    // at least update the status correctly
                    setStatus(state.is_player_turn ? 'Your turn' : 'Computer\'s turn');
                  }
                }
              }
            } catch (e) {
              console.error("Error processing moves:", e);
              // Even if we can't parse moves, continue with an empty board
              // and rely on the game state for turn info
            }
          }
        }
        
        setBoard(newBoard);
        
        // Set turn
        setIsPlayerNext(state.is_player_turn);
        
        // Check if game is over
        if (state.winner !== "0x0" && state.winner !== "0") {
          const isPlayerWinner = state.winner === state.player;
          const winner = isPlayerWinner ? 'X' : 'O';
          
          // Find winning cells
          const winResult = checkWinner(newBoard);
          if (winResult && winResult.winner !== 'tie') {
            setWinningCells(winResult.winningCells);
          }
          
          handleGameWin(winner);
        } else if (state.moves_made === 9) {
          handleGameTie();
        } else {
          setStatus(state.is_player_turn ? 'Your turn' : 'Computer\'s turn');
        }
      } catch (error) {
        console.error("Error loading game:", error);
        toast.error("Failed to load game");
        setStatus('Error loading game');
      }
    };
    
    fetchGameState();
  }, [gameId, isConnected, getGameState, moveHistory, checkWinner, buildBoardFromMoves]);

  // Handle player's move
  const handleClick = async (index: number) => {
    if (gameOver || board[index] || !isPlayerNext || !gameId || moveInProgress || !gameLoaded) return;
    
    const [x, y] = to2DIndex(index);
    setMoveInProgress(true);
    
    // Update local board immediately for better UX
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerNext(false);
    setStatus('Submitting move to blockchain...');
    
    try {
      console.log("Playing move:", Number(gameId), x, y);
      const result = await playMove((Number(gameId)), x, y);
      
      if (result.success) {
        setStatus('Move confirmed');
        
        // If the computer made a move, update the board
        if (result.computerMove) {
          const { x: compX, y: compY } = result.computerMove;
          const compIndex = to1DIndex(compX, compY);
          
          setTimeout(() => {
            const updatedBoard = [...newBoard];
            updatedBoard[compIndex] = 'O';
            setBoard(updatedBoard);
            
            // Check if the game is over after computer's move
            const winResult = checkWinner(updatedBoard);
            
            if (result.gameResult) {
              if (result.gameResult.winner === "0x0" || result.gameResult.winner === "0") {
                if (updatedBoard.every(cell => cell !== null)) {
                  handleGameTie();
                } else {
                  setIsPlayerNext(true);
                  setStatus('Your turn');
                }
              } else {
                // If there's a winner, find the winning cells
                if (winResult && winResult.winner !== 'tie') {
                  setWinningCells(winResult.winningCells);
                }
                handleGameWin(result.gameResult.isPlayerWinner ? 'X' : 'O');
              }
            } else {
              setIsPlayerNext(true);
              setStatus('Your turn');
            }
          }, 500);
        } else {
          // Check if player's move caused a win
          const winResult = checkWinner(newBoard);
          if (winResult) {
            if (winResult.winner === 'X') {
              setWinningCells(winResult.winningCells);
              handleGameWin('X');
            } else if (winResult.winner === 'tie') {
              handleGameTie();
            } else {
              setIsPlayerNext(true);
              setStatus('Your turn');
            }
          } else {
            setIsPlayerNext(true);
            setStatus('Your turn');
          }
        }
      } else {
        // If move failed, revert the board
        setBoard(board);
        setIsPlayerNext(true);
        setStatus('Move failed, try again');
      }
    } catch (error) {
      console.error("Error playing move:", error);
      // Revert board state on error
      setBoard(board);
      setIsPlayerNext(true);
      setStatus('Error submitting move');
    } finally {
      setMoveInProgress(false);
    }
  };

  // Handle game win
  const handleGameWin = (winner: string) => {
    setGameOver(true);
    
    if (winner === 'X') {
      setStatus('You win! Collect your prize!');
      setScores(prev => ({ ...prev, player: prev.player + 1 }));
    } else {
      setStatus('Computer wins!');
      setScores(prev => ({ ...prev, computer: prev.computer + 1 }));
    }
  };

  // Handle game tie
  const handleGameTie = () => {
    setGameOver(true);
    setStatus('It\'s a tie!');
    setScores(prev => ({ ...prev, tie: prev.tie + 1 }));
  };

  const goToLobby = () => {
    router.push('/tic-tac-toe');
  };

  // Render game board
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Blockchain Tic Tac Toe</h1>
      <h2 className="text-lg font-medium mb-6">Game #{gameId}</h2>
      
      {/* Score board */}
      <div className="flex justify-around w-full max-w-md mb-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <X className="text-blue-400 w-5 h-5" />
            <span>You</span>
          </div>
          <span className="text-xl font-bold">{scores.player}</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Circle className="text-rose-400 w-5 h-5" />
            <span>Computer</span>
          </div>
          <span className="text-xl font-bold">{scores.computer}</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span>Ties</span>
          </div>
          <span className="text-xl font-bold">{scores.tie}</span>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className={`mb-6 text-lg font-medium px-4 py-2 rounded-lg
        ${status.includes('win') ? 'bg-emerald-900/30' : 
          status.includes('tie') ? 'bg-yellow-900/30' : 
          status.includes('Computer') ? 'bg-gray-700/30' : 'bg-blue-900/30'}`}>
        {status}
      </div>
      
      {/* Game board */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-md mb-8">
        {board.map((cell, index) => (
          <Cell 
            key={index} 
            value={cell} 
            onClick={() => handleClick(index)}
            winning={winningCells.includes(index)}
          />
        ))}
      </div>
      
      {/* Game controls */}
      <div className="flex gap-4">
        <button
          onClick={goToLobby}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 px-4 py-2 rounded-md"
        >
          <Home className="w-5 h-5" />
          Back to Lobby
        </button>
        
        {gameOver && winningCells.length > 0 && (
          <div className="flex items-center gap-2 bg-emerald-700 px-4 py-2 rounded-md">
            <Trophy className="w-5 h-5" />
            <span>{board[winningCells[0]] === 'X' ? 'You' : 'Computer'} won!</span>
          </div>
        )}
      </div>
      
      {/* Debug panel (can be removed in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 w-full max-w-md p-4 bg-gray-800 rounded-md text-xs">
          <h3 className="font-bold mb-2">Debug Info</h3>
          <div>Game ID: {gameId}</div>
          <div>Player Address: {playerAddress}</div>
          <div>Is Player Turn: {isPlayerNext ? 'Yes' : 'No'}</div>
          <div>Game Over: {gameOver ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
}