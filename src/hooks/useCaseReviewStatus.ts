
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CaseReviewStatus {
  is_review: boolean;
  first_attempt: boolean;
  previous_answer: number | null;
  previous_correct: boolean | null;
  previous_points: number | null;
  review_count: number;
  answered_at?: string;
}

export function useCaseReviewStatus(caseId: string | null) {
  const { user } = useAuth();

  const { data: reviewStatus, isLoading } = useQuery({
    queryKey: ['case-review-status', user?.id, caseId],
    queryFn: async () => {
      if (!user?.id || !caseId) return null;

      try {
        console.log('🔍 Verificando status de revisão:', {
          user: user.id?.slice(0, 8) + '...',
          case: caseId?.slice(0, 8) + '...'
        });

        const { data, error } = await supabase.rpc('check_case_review_status', {
          p_user_id: user.id,
          p_case_id: caseId
        });

        if (error) {
          console.error('❌ Erro ao verificar status de revisão:', {
            error,
            code: error.code,
            message: error.message,
            context: { user: user.id?.slice(0, 8) + '...', caseId: caseId?.slice(0, 8) + '...' }
          });
          
          // CORREÇÃO DE COMPATIBILIDADE: Se a função falhar, assumir primeira tentativa
          console.log('🔧 Fallback: assumindo primeira tentativa devido ao erro');
          return {
            is_review: false,
            first_attempt: true,
            previous_answer: null,
            previous_correct: null,
            previous_points: null,
            review_count: 0
          } as CaseReviewStatus;
        }
        
        console.log('✅ Status de revisão obtido:', {
          isReview: (data as any)?.is_review || false,
          reviewCount: (data as any)?.review_count || 0
        });
        
        // Converter explicitamente o tipo Json para CaseReviewStatus
        return data as unknown as CaseReviewStatus;
      } catch (error) {
        console.error('❌ Erro geral ao verificar status de revisão:', error);
        
        // FALLBACK: Em caso de erro, assumir primeira tentativa
        return {
          is_review: false,
          first_attempt: true,
          previous_answer: null,
          previous_correct: null,
          previous_points: null,
          review_count: 0
        } as CaseReviewStatus;
      }
    },
    enabled: !!user?.id && !!caseId,
    retry: 1, // Tentar apenas uma vez em caso de erro
    staleTime: 1000 * 30, // 30 segundos
  });

  return {
    reviewStatus,
    isLoading,
    isReview: reviewStatus?.is_review || false,
    isFirstAttempt: reviewStatus?.first_attempt || true,
    previousAnswer: reviewStatus?.previous_answer,
    previousCorrect: reviewStatus?.previous_correct,
    previousPoints: reviewStatus?.previous_points,
    reviewCount: reviewStatus?.review_count || 0
  };
}
