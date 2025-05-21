import React from "react";
import FigmaCardsStack from "./GameCard";

const Hero = () => {
  return (
    <section className="w-screen">
      <div className=" text-white flex flex-col  overflow-hidden ">
        {/* Main Content */}
        <main className="relative z-10 px-6 py-8">
    

          {/* Main content */}
          <div className="mt-16 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-yellow-500 rounded-full p-2 mr-2">
                <span className="text-black">🎮</span>
              </div>
              <span className="text-yellow-500 text-xl font-bold">A fully on-chain </span>
              <span className="text-gray-400 text-xl ml-2">— Game</span>
            </div>

            <h1 className="text-6xl font-bold my-2 font-techno ">Tic-Tac-Toe</h1>

            {/* Game cards */}
            <FigmaCardsStack />
          </div>
        </main>
      </div>
    </section>
  );
};

export default Hero;
