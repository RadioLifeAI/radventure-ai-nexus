
import { useState, useEffect } from "react";
import { useUserRankings } from "./useUserRankings";
import { useAuth } from "./useAuth";

export interface PublicRankingsPagination {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export function usePublicRankings() {
  const { user } = useAuth();
  const { filteredRankings, loading, currentFilter } = useUserRankings();
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchResult, setUserSearchResult] = useState<any>(null);
  const [showUserPosition, setShowUserPosition] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState<PublicRankingsPagination>({
    page: 1,
    pageSize: 50,
    total: 0,
    hasMore: true
  });

  // Filtered rankings for display
  const filteredBySearch = filteredRankings.filter(player => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      player.full_name?.toLowerCase().includes(query) ||
      player.username?.toLowerCase().includes(query) ||
      player.rank.toString().includes(query)
    );
  });

  // Paginated results
  const paginatedRankings = filteredBySearch.slice(0, pagination.page * pagination.pageSize);
  
  // Update pagination info
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredBySearch.length,
      hasMore: paginatedRankings.length < filteredBySearch.length
    }));
  }, [filteredBySearch.length, paginatedRankings.length]);

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      setPagination(prev => ({
        ...prev,
        page: prev.page + 1
      }));
    }
  };

  const searchUser = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      const found = filteredRankings.find(player => 
        player.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        player.username?.toLowerCase().includes(query.toLowerCase())
      );
      setUserSearchResult(found || null);
    } else {
      setUserSearchResult(null);
    }
  };

  const goToMyPosition = () => {
    if (user) {
      const myPosition = filteredRankings.find(p => p.id === user.id);
      if (myPosition) {
        setUserSearchResult(myPosition);
        setShowUserPosition(true);
        // Calculate page needed to show user
        const pageNeeded = Math.ceil(myPosition.rank / pagination.pageSize);
        setPagination(prev => ({
          ...prev,
          page: Math.max(pageNeeded, prev.page)
        }));
      }
    }
  };

  const resetSearch = () => {
    setSearchQuery("");
    setUserSearchResult(null);
    setShowUserPosition(false);
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  return {
    // Data
    paginatedRankings,
    userSearchResult,
    showUserPosition,
    
    // Search & Pagination
    searchQuery,
    pagination,
    loading,
    currentFilter,
    
    // Actions
    searchUser,
    goToMyPosition,
    resetSearch,
    loadMore,
    
    // Computed
    totalPlayers: filteredRankings.length,
    currentUserRank: user ? filteredRankings.find(p => p.id === user.id)?.rank : null
  };
}
