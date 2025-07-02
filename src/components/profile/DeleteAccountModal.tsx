import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const CONFIRMATION_TEXT = 'EXCLUIR CONTA';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmText !== CONFIRMATION_TEXT) {
      toast({
        title: 'Confirmação inválida',
        description: `Digite "${CONFIRMATION_TEXT}" para confirmar`,
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Primeiro, vamos marcar a conta para exclusão
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          email: `deleted_${Date.now()}@deleted.local`,
          full_name: '[CONTA EXCLUÍDA]',
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      // Fazer logout
      await supabase.auth.signOut();

      toast({
        title: 'Conta excluída',
        description: 'Sua conta foi excluída com sucesso',
      });

      onClose();
      
      // Recarregar página após um breve delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: 'Erro ao excluir conta',
        description: 'Não foi possível excluir sua conta. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Excluir Conta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-red-800">Atenção: Esta ação é irreversível!</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Todos os seus dados serão perdidos</li>
                  <li>• Seu histórico de casos será apagado</li>
                  <li>• Seus RadCoins serão perdidos</li>
                  <li>• Não será possível recuperar a conta</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmText">
                Para confirmar, digite: <span className="font-mono font-bold">{CONFIRMATION_TEXT}</span>
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRMATION_TEXT}
                className="font-mono"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="destructive" 
                disabled={isLoading || confirmText !== CONFIRMATION_TEXT}
                className="flex-1"
              >
                {isLoading ? 'Excluindo...' : 'Excluir Conta'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}