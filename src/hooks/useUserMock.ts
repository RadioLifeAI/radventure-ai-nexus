
import { useState, useEffect } from "react";

// Sistema mock de usuário para desenvolvimento sem restrições
export interface MockUser {
  id: string;
  email: string;
  full_name: string;
  type: "ADMIN" | "USER";
  username: string;
  radcoin_balance: number;
  total_points: number;
}

const MOCK_USER: MockUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "dev@test.com",
  full_name: "Usuário de Desenvolvimento",
  type: "ADMIN",
  username: "dev_user",
  radcoin_balance: 999999,
  total_points: 999999
};

export function useUserMock() {
  const [user, setUser] = useState<MockUser | null>(MOCK_USER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simula carregamento inicial
    setLoading(true);
    setTimeout(() => {
      setUser(MOCK_USER);
      setLoading(false);
    }, 100);
  }, []);

  const getUser = () => ({
    data: { user },
    error: null
  });

  const getSession = () => ({
    data: { 
      session: user ? {
        access_token: "mock_token",
        user: user
      } : null 
    },
    error: null
  });

  return {
    user,
    loading,
    getUser,
    getSession
  };
}
