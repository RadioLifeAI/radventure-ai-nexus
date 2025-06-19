
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_name: string;
  event_data: any;
  user_id?: string;
  session_id: string;
  timestamp: string;
}

interface AnalyticsContextType {
  track: (eventName: string, data?: any) => void;
  identify: (userId: string, properties?: any) => void;
  page: (pageName: string, properties?: any) => void;
  getMetrics: (timeRange: string) => Promise<any>;
  getKPIs: () => Promise<any>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [userId, setUserId] = useState<string | null>(null);

  const track = async (eventName: string, data: any = {}) => {
    const event: AnalyticsEvent = {
      event_name: eventName,
      event_data: data,
      user_id: userId || undefined,
      session_id: sessionId,
      timestamp: new Date().toISOString()
    };

    try {
      await supabase.functions.invoke('analytics-processor', {
        body: { type: 'track', event }
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const identify = (newUserId: string, properties: any = {}) => {
    setUserId(newUserId);
    track('user_identified', { userId: newUserId, ...properties });
  };

  const page = (pageName: string, properties: any = {}) => {
    track('page_view', { page: pageName, ...properties });
  };

  const getMetrics = async (timeRange: string) => {
    try {
      const { data } = await supabase.functions.invoke('analytics-processor', {
        body: { type: 'get_metrics', timeRange }
      });
      return data;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return {};
    }
  };

  const getKPIs = async () => {
    try {
      const { data } = await supabase.functions.invoke('analytics-processor', {
        body: { type: 'get_kpis' }
      });
      return data;
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      return {};
    }
  };

  useEffect(() => {
    page(window.location.pathname);
  }, []);

  return (
    <AnalyticsContext.Provider value={{
      track,
      identify,
      page,
      getMetrics,
      getKPIs
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
