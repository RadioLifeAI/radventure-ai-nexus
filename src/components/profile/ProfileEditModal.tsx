
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    nickname: profile?.nickname || '',
    bio: profile?.bio || '',
    medical_specialty: profile?.medical_specialty || '',
    academic_specialty: profile?.academic_specialty || '',
    city: profile?.city || '',
    state: profile?.state || '',
    college: profile?.college || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await updateProfile(formData);
      
      if (error) {
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message || "Ocorreu um erro inesperado",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram salvas com sucesso.",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais e acadêmicas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <Label htmlFor="nickname">Apelido</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                placeholder="Como gostaria de ser chamado"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Conte um pouco sobre você..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medical_specialty">Especialidade Médica</Label>
              <Input
                id="medical_specialty"
                value={formData.medical_specialty}
                onChange={(e) => setFormData(prev => ({ ...prev, medical_specialty: e.target.value }))}
                placeholder="Ex: Radiologia, Cardiologia..."
              />
            </div>

            <div>
              <Label htmlFor="academic_specialty">Especialidade Acadêmica</Label>
              <Input
                id="academic_specialty"
                value={formData.academic_specialty}
                onChange={(e) => setFormData(prev => ({ ...prev, academic_specialty: e.target.value }))}
                placeholder="Área de foco nos estudos"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Sua cidade"
              />
            </div>

            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="Seu estado"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="college">Instituição de Ensino</Label>
            <Input
              id="college"
              value={formData.college}
              onChange={(e) => setFormData(prev => ({ ...prev, college: e.target.value }))}
              placeholder="Universidade ou faculdade"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
