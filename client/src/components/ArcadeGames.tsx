import Link from "next/link";
import React from "react";

const ArcadeGames = () => {
  const games = [
    {
      title: "Tic-Tac-Toe",
      subtitle: "❌⭕",
      description: "Play as X or O in this classic strategy game on Starknet. Outsmart your opponent and win on-chain!",
      bg: "bg-gradient-to-br from-blue-400 to-blue-600",
      btn: "Play Now",
      rating: "4.8",
      url: "/tic-tac-toe",
      imgUrl:
        "https://img.freepik.com/free-vector/flat-tic-tac-toe-game-illustration_23-2149449507.jpg?w=740",
    }
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <h2 className="text-5xl font-techno font-extrabold mb-16 text-center text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] tracking-widest">
        Games on Starknet
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {games.map((game, i) => (
          <div
            key={i}
            className={`relative rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 h-96 font-techno text-white`}
          >
            {/* Background Image */}
            <img
              src={game.imgUrl}
              alt={`${game.title} image`}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="relative z-10 flex flex-col justify-between h-full p-6 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
              {/* Title and Rating */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-black">{game.title}</h3>
                  <p className="text-black text-sm">{game.subtitle}</p>
                </div>
                <div className="bg-gray-300 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                  <span className="text-sm mr-1">⭐</span>
                  <span className="font-bold">{game.rating}</span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-black">{game.description}</p>

              {/* CTA Button */}
              <Link
                href={game.url}
                className="mt-6 inline-block text-center bg-violet-600 hover:bg-purple-400 hover:text-black transition-all font-bold tracking-wide active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,0.8)] shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black py-2 rounded-xl"
              >
                {game.btn}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ArcadeGames;
