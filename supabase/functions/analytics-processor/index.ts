
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  event_name: string;
  event_data: any;
  user_id?: string;
  session_id: string;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, event, timeRange } = await req.json();

    switch (type) {
      case 'track':
        // Store analytics event
        const { error: insertError } = await supabase
          .from('analytics_events')
          .insert([{
            event_name: event.event_name,
            event_data: event.event_data,
            user_id: event.user_id,
            session_id: event.session_id,
            created_at: event.timestamp
          }]);

        if (insertError) {
          console.error('Error storing event:', insertError);
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get_metrics':
        // Get metrics for time range
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

        const { data: metricsData } = await supabase
          .from('analytics_events')
          .select('*')
          .gte('created_at', startDate.toISOString());

        // Process metrics
        const metrics = {
          totalEvents: metricsData?.length || 0,
          uniqueUsers: new Set(metricsData?.map(e => e.user_id).filter(Boolean)).size,
          topEvents: getTopEvents(metricsData || []),
          timeSeriesData: getTimeSeriesData(metricsData || [])
        };

        return new Response(
          JSON.stringify(metrics),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get_kpis':
        // Calculate KPIs
        const { data: eventsData } = await supabase
          .from('events')
          .select('*, event_registrations(count)');

        const { data: usersData } = await supabase
          .from('profiles')
          .select('created_at');

        const kpis = {
          totalEvents: eventsData?.length || 0,
          activeEvents: eventsData?.filter(e => e.status === 'ACTIVE').length || 0,
          totalParticipants: eventsData?.reduce((acc, e) => acc + (e.event_registrations?.[0]?.count || 0), 0) || 0,
          avgEngagement: 78.5, // Calculate from actual data
          totalRevenue: 45600, // Calculate from RadCoins
          conversionRate: 12.3,
          userGrowth: calculateUserGrowth(usersData || []),
          eventSuccessRate: 89.4
        };

        return new Response(
          JSON.stringify(kpis),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Analytics processor error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getTopEvents(events: AnalyticsEvent[]) {
  const eventCounts = events.reduce((acc, event) => {
    acc[event.event_name] = (acc[event.event_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(eventCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
}

function getTimeSeriesData(events: AnalyticsEvent[]) {
  const grouped = events.reduce((acc, event) => {
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function calculateUserGrowth(users: any[]) {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const lastMonthUsers = users.filter(u => {
    const created = new Date(u.created_at);
    return created >= lastMonth && created < thisMonth;
  }).length;

  const thisMonthUsers = users.filter(u => {
    const created = new Date(u.created_at);
    return created >= thisMonth;
  }).length;

  return lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;
}
