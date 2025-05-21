"use client";
import { useEffect, useState } from "react";
import WalletBar from "./WalletBar";
import { useAccount, useConnect } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";
import Link from "next/link";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { connectors } = useConnect();
  const { address } = useAccount();
  const [username, setUsername] = useState(undefined);
  const [connected, setConnected] = useState(false);

  // Controller connection
  useEffect(() => {
    if (!address) return;
    const controller = connectors.find((c) => c instanceof ControllerConnector);
    if (controller) {
      controller.username()?.then((n) => setUsername(n));
      setConnected(true);
    }
  }, [address, connectors]);

  return (
    <>
      <header className="w-full px-6 py-4 flex justify-between items-center text-white relative z-10 font-sans">
        {/* Left: Logo */}
        <div className="flex items-center space-x-2 cursor-pointer hover:text-gray-300 transition-colors">
          <span className="font-semibold text-lg"><Link href="/">Games</Link></span>
        </div>

       

        {/* Right: Wallet */}
        <div className="flex items-center">
          <WalletBar />
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white ml-4"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-90">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <button
              className="absolute top-4 right-6"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Link href="/" className="text-xl text-white hover:text-purple-400">
              Games
            </Link>
            <WalletBar />
          </div>
        </div>
      )}
    </>
  );
}