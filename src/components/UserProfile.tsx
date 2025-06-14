
import React from "react";

type UserProfileProps = {
  user: {
    name: string;
    city: string;
    state: string;
    totalPoints: number;
    avatar: string;
    ranking: number;
  }
};

export function UserProfile({ user }: UserProfileProps) {
  return (
    <section className="flex flex-col md:flex-row gap-6 items-center justify-between w-full rounded-xl px-6 md:px-10 py-7 bg-gradient-to-br from-[#232983] via-[#224ba7] to-[#25bfff] drop-shadow-lg mb-8 mt-3">
      <div className="flex items-center gap-6">
        <img src={user.avatar} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-cyan-400 shadow-lg" />
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">{user.name}</h2>
          <div className="flex items-center gap-2 mt-1 text-cyan-50 font-medium text-base">
            <span>{user.totalPoints} pts</span>
            <span className="ml-3">{user.city}, {user.state}</span>
          </div>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="bg-cyan-600/70 px-4 py-1 rounded-2xl text-white font-medium flex items-center gap-1">Ranking Nacional: <b>{user.ranking}º</b></span>
            <span className="bg-cyan-700/60 px-4 py-1 rounded-2xl text-white font-medium flex items-center gap-1">Próxima conquista: <b>Expert Radiologista</b></span>
          </div>
        </div>
      </div>
      <button className="bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg px-8 py-3 text-lg font-extrabold rounded-xl text-white hover:scale-105 transition">Começar Novo Desafio</button>
    </section>
  );
}
