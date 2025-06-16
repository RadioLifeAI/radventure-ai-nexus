
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserProfile } from '@/types/admin';
import { Loader2 } from 'lucide-react';

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

export function ProfileEditModal({ open, onClose, profile, onSave }: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    academic_stage: profile.academic_stage || '',
    medical_specialty: profile.medical_specialty || '',
    college: profile.college || '',
    city: profile.city || '',
    state: profile.state || '',
    country_code: profile.country_code || '',
    bio: profile.bio || '',
    birthdate: profile.birthdate || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await onSave(formData);
      
      if (error) {
        setError('Erro ao atualizar perfil. Tente novamente.');
        console.error('Profile update error:', error);
      } else {
        onClose();
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="academic_stage">Estágio Acadêmico</Label>
            <Select value={formData.academic_stage} onValueChange={(value) => handleChange('academic_stage', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu estágio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Student">Estudante</SelectItem>
                <SelectItem value="Intern">Interno</SelectItem>
                <SelectItem value="Resident">Residente</SelectItem>
                <SelectItem value="Specialist">Especialista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_specialty">Especialidade Médica</Label>
            <Select value={formData.medical_specialty} onValueChange={(value) => handleChange('medical_specialty', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua especialidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Radiologia">Radiologia</SelectItem>
                <SelectItem value="Cardiologia">Cardiologia</SelectItem>
                <SelectItem value="Neurologia">Neurologia</SelectItem>
                <SelectItem value="Pneumologia">Pneumologia</SelectItem>
                <SelectItem value="Gastroenterologia">Gastroenterologia</SelectItem>
                <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                <SelectItem value="Urologia">Urologia</SelectItem>
                <SelectItem value="Ginecologia">Ginecologia</SelectItem>
                <SelectItem value="Pediatria">Pediatria</SelectItem>
                <SelectItem value="Medicina Geral">Medicina Geral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="college">Instituição de Ensino</Label>
            <Input
              id="college"
              value={formData.college}
              onChange={(e) => handleChange('college', e.target.value)}
              placeholder="Nome da sua universidade/faculdade"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Sua cidade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="Seu estado"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthdate">Data de Nascimento</Label>
            <Input
              id="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={(e) => handleChange('birthdate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Opcional)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Conte um pouco sobre você..."
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
