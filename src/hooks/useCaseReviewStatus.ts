
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

      const { data, error } = await supabase.rpc('check_case_review_status', {
        p_user_id: user.id,
        p_case_id: caseId
      });

      if (error) throw error;
      
      // Converter explicitamente o tipo Json para CaseReviewStatus
      return data as unknown as CaseReviewStatus;
    },
    enabled: !!user?.id && !!caseId,
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
