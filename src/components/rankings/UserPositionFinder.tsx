
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Target, X } from "lucide-react";

interface UserPositionFinderProps {
  onSearch: (query: string) => void;
  onGoToMyPosition: () => void;
  onReset: () => void;
  searchQuery: string;
  userSearchResult: any;
  currentUserRank: number | null;
  totalPlayers: number;
}

export function UserPositionFinder({ 
  onSearch, 
  onGoToMyPosition, 
  onReset,
  searchQuery, 
  userSearchResult, 
  currentUserRank,
  totalPlayers 
}: UserPositionFinderProps) {
  const [inputValue, setInputValue] = useState(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
  };

  const handleReset = () => {
    setInputValue("");
    onReset();
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar jogador por nome ou posição..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-10 bg-white/90 border-cyan-200 focus:border-cyan-400"
            />
          </div>
          <Button type="submit" size="sm" className="bg-cyan-500 hover:bg-cyan-600">
            Buscar
          </Button>
        </form>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onGoToMyPosition}
            size="sm"
            variant="outline"
            className="bg-white/90 border-cyan-300 hover:bg-cyan-50 flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Minha Posição
            {currentUserRank && (
              <span className="bg-cyan-500 text-white px-2 py-1 rounded-full text-xs">
                #{currentUserRank}
              </span>
            )}
          </Button>
          
          {(searchQuery || userSearchResult) && (
            <Button
              onClick={handleReset}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Results Info */}
      {userSearchResult && (
        <div className="mt-3 p-3 bg-cyan-500/20 rounded-lg border border-cyan-300">
          <div className="flex items-center justify-between text-cyan-800">
            <span className="font-semibold">
              Encontrado: {userSearchResult.full_name || userSearchResult.username}
            </span>
            <span className="bg-cyan-600 text-white px-2 py-1 rounded-full text-sm">
              #{userSearchResult.rank}
            </span>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-3 flex items-center justify-between text-sm text-cyan-100">
        <span>Total de jogadores: {totalPlayers.toLocaleString()}</span>
        {currentUserRank && (
          <span>Você está na posição #{currentUserRank} de {totalPlayers}</span>
        )}
      </div>
    </div>
  );
}
