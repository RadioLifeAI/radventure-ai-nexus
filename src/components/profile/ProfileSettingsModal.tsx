
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, User, Stethoscope, Settings, Loader2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';

interface ProfileSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ open, onClose }: ProfileSettingsModalProps) {
  const { profile, updateProfile, isUpdating } = useUserProfile();
  const { uploadAvatar, uploading } = useAvatarUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    country_code: profile?.country_code || '',
    city: profile?.city || '',
    state: profile?.state || '',
    medical_specialty: profile?.medical_specialty || '',
    academic_specialty: profile?.academic_specialty || '',
    academic_stage: profile?.academic_stage || '',
    college: profile?.college || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && profile?.id) {
      try {
        await uploadAvatar(file, profile.id);
      } catch (error) {
        console.error('Erro no upload do avatar:', error);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Perfil
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Básico
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Médico
            </TabsTrigger>
            <TabsTrigger value="avatar" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Avatar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="seu_usuario"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Conte um pouco sobre você..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="country_code">País</Label>
                <Select value={formData.country_code} onValueChange={(value) => handleInputChange('country_code', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">Brasil</SelectItem>
                    <SelectItem value="US">Estados Unidos</SelectItem>
                    <SelectItem value="PT">Portugal</SelectItem>
                    <SelectItem value="AR">Argentina</SelectItem>
                    <SelectItem value="CO">Colômbia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Sua cidade"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="SP"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="medical_specialty">Especialidade Médica</Label>
                <Select value={formData.medical_specialty} onValueChange={(value) => handleInputChange('medical_specialty', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Radiologia">Radiologia</SelectItem>
                    <SelectItem value="Cardiologia">Cardiologia</SelectItem>
                    <SelectItem value="Neurologia">Neurologia</SelectItem>
                    <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                    <SelectItem value="Pediatria">Pediatria</SelectItem>
                    <SelectItem value="Clínica Geral">Clínica Geral</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="academic_specialty">Especialidade Acadêmica</Label>
                <Input
                  id="academic_specialty"
                  value={formData.academic_specialty}
                  onChange={(e) => handleInputChange('academic_specialty', e.target.value)}
                  placeholder="Sua área de estudo"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="academic_stage">Estágio Acadêmico</Label>
                <Select value={formData.academic_stage} onValueChange={(value) => handleInputChange('academic_stage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Estudante</SelectItem>
                    <SelectItem value="Intern">Interno</SelectItem>
                    <SelectItem value="Resident">Residente</SelectItem>
                    <SelectItem value="Specialist">Especialista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="college">Instituição</Label>
                <Input
                  id="college"
                  value={formData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  placeholder="Sua universidade/hospital"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="avatar" className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-cyan-200">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-700">
                    {profile?.full_name?.[0] || profile?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={triggerFileInput}
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-cyan-500 hover:bg-cyan-600"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Clique no ícone da câmera para alterar sua foto de perfil
                </p>
                <p className="text-xs text-gray-500">
                  Formatos aceitos: JPG, PNG, GIF (máx. 2MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
