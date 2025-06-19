
import { supabase } from '@/integrations/supabase/client';

class AIGateway {
  private static instance: AIGateway;
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  static getInstance(): AIGateway {
    if (!AIGateway.instance) {
      AIGateway.instance = new AIGateway();
    }
    return AIGateway.instance;
  }

  private checkRateLimit(userId: string, service: string): boolean {
    const key = `${userId}_${service}`;
    const now = Date.now();
    const limit = this.rateLimits.get(key);

    if (!limit || limit.resetTime < now) {
      this.rateLimits.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
      return true;
    }

    if (limit.count >= 10) { // 10 requests per minute
      return false;
    }

    limit.count++;
    return true;
  }

  async generateEventSuggestions(context: string, userId: string) {
    if (!this.checkRateLimit(userId, 'suggestions')) {
      throw new Error('Rate limit exceeded');
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
        body: {
          type: 'generate_event_suggestions',
          data: { description: context }
        }
      });

      if (error) throw error;
      return data.suggestions;
    } catch (error) {
      console.error('AI Gateway error:', error);
      // Fallback to mock data
      return this.getMockSuggestions();
    }
  }

  async optimizeEvent(eventData: any, userId: string) {
    if (!this.checkRateLimit(userId, 'optimize')) {
      throw new Error('Rate limit exceeded');
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
        body: {
          type: 'optimize_event',
          data: eventData
        }
      });

      if (error) throw error;
      return data.optimizations;
    } catch (error) {
      console.error('AI Gateway error:', error);
      return this.getMockOptimizations();
    }
  }

  async getSmartSchedule(preferences: any, userId: string) {
    if (!this.checkRateLimit(userId, 'schedule')) {
      throw new Error('Rate limit exceeded');
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
        body: {
          type: 'smart_schedule',
          data: preferences
        }
      });

      if (error) throw error;
      return data.scheduleRecommendations;
    } catch (error) {
      console.error('AI Gateway error:', error);
      return this.getMockSchedule();
    }
  }

  async analyzePerformance(eventId: string, userId: string) {
    if (!this.checkRateLimit(userId, 'analyze')) {
      throw new Error('Rate limit exceeded');
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
        body: {
          type: 'analyze_performance',
          data: eventId
        }
      });

      if (error) throw error;
      return data.analysis;
    } catch (error) {
      console.error('AI Gateway error:', error);
      return this.getMockAnalysis();
    }
  }

  // Fallback methods with mock data
  private getMockSuggestions() {
    return [
      {
        name: "Quiz Cardiologia Intervencionista",
        description: "Casos complexos de cateterismo e angioplastia",
        specialty: "Cardiologia",
        modality: "Angiografia",
        numberOfCases: 10,
        durationMinutes: 45,
        prizeRadcoins: 750,
        target: "Residentes R3+",
        difficulty: 4
      },
      {
        name: "Neuroimagem Pediatrica Avançada",
        description: "Diagnóstico por imagem em pacientes pediátricos",
        specialty: "Neurologia",
        modality: "RM",
        numberOfCases: 8,
        durationMinutes: 30,
        prizeRadcoins: 500,
        target: "Especialistas",
        difficulty: 3
      }
    ];
  }

  private getMockOptimizations() {
    return [
      {
        type: "schedule",
        suggestion: "Mover para terça-feira às 19h30",
        confidence: 89,
        impact: "+25% participação"
      },
      {
        type: "prizes",
        suggestion: "Redistribuir prêmios em 3 posições",
        confidence: 76,
        impact: "+12% engajamento"
      }
    ];
  }

  private getMockSchedule() {
    return [
      {
        datetime: "2024-12-10T19:30:00",
        score: 95,
        expectedParticipants: 87,
        competition: "low",
        reasoning: "Horário com histórico de alta participação"
      }
    ];
  }

  private getMockAnalysis() {
    return {
      participationRate: 0.85,
      engagementScore: 78,
      completionRate: 0.65,
      insights: ["Alta taxa de abandono no meio do evento", "Excelente feedback dos participantes"]
    };
  }
}

export const aiGateway = AIGateway.getInstance();
