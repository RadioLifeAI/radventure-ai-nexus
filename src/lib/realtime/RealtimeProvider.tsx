
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeContextType {
  isConnected: boolean;
  joinRoom: (roomId: string, userInfo: any) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, message: any) => void;
  onMessage: (roomId: string, callback: (message: any) => void) => void;
  getPresence: (roomId: string) => any[];
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [channels, setChannels] = useState<Map<string, RealtimeChannel>>(new Map());

  const joinRoom = (roomId: string, userInfo: any) => {
    if (channels.has(roomId)) return;

    const channel = supabase
      .channel(`room_${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userInfo);
        }
      });

    setChannels(prev => new Map(prev).set(roomId, channel));
  };

  const leaveRoom = (roomId: string) => {
    const channel = channels.get(roomId);
    if (channel) {
      supabase.removeChannel(channel);
      setChannels(prev => {
        const newMap = new Map(prev);
        newMap.delete(roomId);
        return newMap;
      });
    }
  };

  const sendMessage = (roomId: string, message: any) => {
    const channel = channels.get(roomId);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'message',
        payload: message
      });
    }
  };

  const onMessage = (roomId: string, callback: (message: any) => void) => {
    const channel = channels.get(roomId);
    if (channel) {
      channel.on('broadcast', { event: 'message' }, callback);
    }
  };

  const getPresence = (roomId: string) => {
    const channel = channels.get(roomId);
    if (channel) {
      return Object.values(channel.presenceState()).flat();
    }
    return [];
  };

  return (
    <RealtimeContext.Provider value={{
      isConnected,
      joinRoom,
      leaveRoom,
      sendMessage,
      onMessage,
      getPresence
    }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
