/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { X, Circle, Home, Trophy, Loader2 } from "lucide-react";
import { useAccount, useConnect } from "@starknet-react/core";
import { toast } from "react-hot-toast";
import { useTicTacToeContract } from "@/src/hooks/useGameContract";
import ControllerConnector from "@cartridge/connector/controller";
import { useParams, useRouter } from "next/navigation";

interface CellProps {
  value: string | null;
  onClick: () => void;
  winning: boolean;
  isHighlighted: boolean;
  isAnimating: boolean;
}

const Cell = ({
  value,
  onClick,
  winning,
  isHighlighted,
  isAnimating,
}: CellProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full h-24 flex items-center justify-center rounded-md transition-all duration-300 
        ${value ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-700"} 
        ${
          winning
            ? "bg-emerald-900"
            : isHighlighted
            ? "bg-blue-900"
            : "bg-gray-800"
        }
        ${isAnimating ? "scale-105 shadow-lg" : ""}`}
    >
      {value === "X" && (
        <X
          className={`text-blue-400 w-12 h-12 ${
            isAnimating ? "animate-bounce" : ""
          }`}
        />
      )}
      {value === "O" && (
        <Circle
          className={`text-rose-400 w-12 h-12 ${
            isAnimating ? "animate-pulse" : ""
          }`}
        />
      )}
    </button>
  );
};

// Function to convert between 1D and 2D indices
const to1DIndex = (x: number, y: number): number => y * 3 + x;
const to2DIndex = (index: number): [number, number] => [
  index % 3,
  Math.floor(index / 3),
];

export default function TicTacToeGame() {
  const param = useParams();
  const gameId = param.id;
  const router = useRouter();

  // Starknet account connection
  const { address, account } = useAccount();

  // Game state
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isPlayerNext, setIsPlayerNext] = useState(true);
  const [status, setStatus] = useState("Loading game...");
  const [gameOver, setGameOver] = useState(false);
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [scores, setScores] = useState({ player: 0, computer: 0, tie: 0 });
  const [moveInProgress, setMoveInProgress] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [playerAddress, setPlayerAddress] = useState<string | null>(null);
  const [lastMoveIndex, setLastMoveIndex] = useState<number | null>(null);
  const [computerThinking, setComputerThinking] = useState(false);
  const [animatingCell, setAnimatingCell] = useState<number | null>(null);

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
  const { playMove, getGameState } = useTicTacToeContract(connected, account);

  // Winning combinations
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  // Check for a winner in the current board state
  const checkWinner = useCallback(
    (squares: Array<string | null>) => {
      for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (
          squares[a] &&
          squares[a] === squares[b] &&
          squares[a] === squares[c]
        ) {
          return { winner: squares[a], winningCells: pattern };
        }
      }

      // Check for tie
      if (squares.every((cell) => cell !== null)) {
        return { winner: "tie", winningCells: [] };
      }

      return null;
    },
    [winPatterns]
  );

  useEffect(() => {
    const fetchGameState = async () => {
      if (!address || !gameId) return;

      try {
        setStatus("Loading game state...");
        const state = await getGameState(Number(gameId));

        if (!state) {
          toast.error("Game not found");
          setStatus("Game not found");
          return;
        }

        setGameLoaded(true);
        setPlayerAddress(state.player);

        let newBoard: Array<string | null>;

        newBoard = Array(9).fill(null);

        setBoard(newBoard);
        setIsPlayerNext(state.is_player_turn);

        // Check if game is already over
        if (state.winner !== "0x0" && state.winner !== "0") {
          const isPlayerWinner = state.winner === state.player;
          const winner = isPlayerWinner ? "X" : "O";

          const winResult = checkWinner(newBoard);
          if (winResult && winResult.winner !== "tie") {
            setWinningCells(winResult.winningCells);
          }

          handleGameWin(winner);
        } else if (Number(state.moves_made) === 9) {
          handleGameTie();
        } else {
          setStatus(state.is_player_turn ? "Your turn" : "Computer's turn");
          if (!state.is_player_turn) {
            setComputerThinking(true);
          }
        }
      } catch (error) {
        console.error("Error loading game:", error);
        toast.error("Failed to load game");
        setStatus("Error loading game");
      }
    };

    fetchGameState();
  }, [gameId, address]);

  // Animate a cell when a move is made
  const animateCell = (index: number) => {
    setAnimatingCell(index);
    setTimeout(() => setAnimatingCell(null), 600);
  };

  const findWinningPattern = (board: any, symbol: "X" | "O") => {
    if (board) {
      for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] === symbol && board[b] === symbol && board[c] === symbol) {
          return pattern;
        }
      }
    }
    return [];
  };

  const handleClick = async (index: number) => {
    if (
      gameOver ||
      board[index] ||
      !isPlayerNext ||
      !gameId ||
      moveInProgress ||
      !gameLoaded ||
      computerThinking
    )
      return;

    const [x, y] = to2DIndex(index);
    setMoveInProgress(true);

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setLastMoveIndex(index);
    animateCell(index);

    setIsPlayerNext(false);
    setStatus("Submitting move to blockchain...");
    setComputerThinking(true);

    try {
      const result = await playMove(Number(gameId), x, y);

      if (!result.success) {
        setBoard(board); // revert
        setStatus("Move failed, try again");
        setIsPlayerNext(true);
        setComputerThinking(false);
        return;
      }

      // Handle Computer's move if present
      if (result?.computerMove?.success) {
        const { x: compX, y: compY } = result.computerMove;

        const compIndex = to1DIndex(compX!, compY!);

        setTimeout(() => {
          const updatedBoard = [...newBoard];
          updatedBoard[compIndex] = "O";
          setBoard(updatedBoard);
          setLastMoveIndex(compIndex);
          animateCell(compIndex);

          // Trust gameResult from blockchain
          if (result.gameResult?.success) {
            const winner = result.gameResult.winner;

            if (result.gameResult.isComputerWinner) {
              setWinningCells(findWinningPattern(updatedBoard, "O"));
              handleGameWin("O");
            } else if (result.gameResult.isPlayerWinner) {
              setWinningCells(findWinningPattern(updatedBoard, "X"));
              handleGameWin("X");
            } else if (result.gameResult.isTie) {
              handleGameTie();
            } else {
              setStatus("Your turn");
              setIsPlayerNext(true);
            }
          } else {
            setStatus("Your turn");
            setIsPlayerNext(true);
          }

          setComputerThinking(false);
        }, 1000);
      } else if (result.gameResult?.success) {
        // No computer move, but game ended after player move
        if (result.gameResult.isPlayerWinner) {
          setWinningCells(findWinningPattern(newBoard, "X"));
          handleGameWin("X");
        } else if (result.gameResult.isTie) {
          handleGameTie();
        } else {
          setStatus("Your turn");
          setIsPlayerNext(true);
        }
        setComputerThinking(false);
      } else {
        // Fallback to check winner locally (just in case)
        const winResult = checkWinner(newBoard);
        if (winResult?.winner === "X") {
          setWinningCells(winResult.winningCells);
          handleGameWin("X");
        } else if (winResult?.winner === "tie") {
          handleGameTie();
        } else {
          setStatus("Your turn");
          setIsPlayerNext(true);
        }
        setComputerThinking(false);
      }
    } catch (error) {
      console.error("Error playing move:", error);
      setBoard(board); // revert
      setStatus("Error submitting move");
      setIsPlayerNext(true);
      setComputerThinking(false);
    } finally {
      setMoveInProgress(false);
    }
  };

  const handleGameWin = useCallback((winner: string) => {
    setGameOver(true);

    if (winner === "X") {
      setStatus("You win! Collect your prize!");
      setScores((prev) => ({ ...prev, player: prev.player + 1 }));
    } else {
      setStatus("Computer wins!");
      setScores((prev) => ({ ...prev, computer: prev.computer + 1 }));
    }
  }, []);

  const handleGameTie = useCallback(() => {
    setGameOver(true);
    setStatus("It's a tie!");
    setScores((prev) => ({ ...prev, tie: prev.tie + 1 }));
  }, []);

  const goToLobby = () => {
    router.push("/tic-tac-toe");
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

      {/* Status indicator with animation for computer thinking */}
      <div
        className={`mb-6 text-lg font-medium px-4 py-2 rounded-lg transition-all duration-300
        ${
          status.includes("win")
            ? "bg-emerald-900/30"
            : status.includes("tie")
            ? "bg-yellow-900/30"
            : status.includes("Computer")
            ? "bg-gray-700/30"
            : "bg-blue-900/30"
        }`}
      >
        <div className="flex items-center gap-2">
          {computerThinking && (
            <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
          )}
          {status}
        </div>
      </div>

      {/* Game board */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-md mb-8">
        {board.map((cell, index) => (
          <Cell
            key={index}
            value={cell}
            onClick={() => handleClick(index)}
            winning={winningCells.includes(index)}
            isHighlighted={index === lastMoveIndex}
            isAnimating={index === animatingCell}
          />
        ))}
      </div>

      {/* Computer thinking overlay */}
      {computerThinking && (
        <div className="mb-4 flex items-center gap-2 bg-rose-900/20 px-4 py-2 rounded-md animate-pulse">
          <Circle className="text-rose-400 w-5 h-5" />
          <span>Computer is making a move...</span>
        </div>
      )}

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
            <span>
              {board[winningCells[0]] === "X" ? "You" : "Computer"} won!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
