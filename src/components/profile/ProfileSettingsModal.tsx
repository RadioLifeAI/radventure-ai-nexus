
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Shield, MapPin, GraduationCap } from "lucide-react";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { profile, updateProfile, isUpdating } = useUserProfile();
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    city: profile?.city || '',
    state: profile?.state || '',
    country_code: profile?.country_code || 'BR',
    medical_specialty: profile?.medical_specialty || '',
    academic_specialty: profile?.academic_specialty || '',
    academic_stage: (profile?.academic_stage as 'Student' | 'Intern' | 'Resident' | 'Specialist') || 'Student',
    college: profile?.college || ''
  });

  const handleSave = () => {
    updateProfile(formData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Perfil
          </DialogTitle>
          <DialogDescription>
            Gerencie suas informações pessoais e preferências
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Pessoal
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Localização
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Acadêmico
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Conta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize seus dados básicos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      placeholder="Seu username"
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
                <CardDescription>Onde você está localizado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
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
                      placeholder="Seu estado"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">País</Label>
                    <Select value={formData.country_code} onValueChange={(value) => handleInputChange('country_code', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BR">Brasil</SelectItem>
                        <SelectItem value="US">Estados Unidos</SelectItem>
                        <SelectItem value="PT">Portugal</SelectItem>
                        <SelectItem value="AR">Argentina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Acadêmicas</CardTitle>
                <CardDescription>Sua formação e especialização</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medical_specialty">Especialidade Médica</Label>
                    <Select value={formData.medical_specialty} onValueChange={(value) => handleInputChange('medical_specialty', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Radiologia">Radiologia</SelectItem>
                        <SelectItem value="Cardiologia">Cardiologia</SelectItem>
                        <SelectItem value="Neurologia">Neurologia</SelectItem>
                        <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                        <SelectItem value="Pediatria">Pediatria</SelectItem>
                        <SelectItem value="Medicina Interna">Medicina Interna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="academic_stage">Estágio Acadêmico</Label>
                    <Select value={formData.academic_stage} onValueChange={(value) => handleInputChange('academic_stage', value)}>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="college">Faculdade/Universidade</Label>
                    <Input
                      id="college"
                      value={formData.college}
                      onChange={(e) => handleInputChange('college', e.target.value)}
                      placeholder="Sua instituição de ensino"
                    />
                  </div>
                  <div>
                    <Label htmlFor="academic_specialty">Especialização Acadêmica</Label>
                    <Input
                      id="academic_specialty"
                      value={formData.academic_specialty}
                      onChange={(e) => handleInputChange('academic_specialty', e.target.value)}
                      placeholder="Sua área de especialização"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
                <CardDescription>Dados básicos da sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input value={profile?.email || ''} disabled className="bg-gray-100" />
                    <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
                  </div>
                  <div>
                    <Label>Tipo de Conta</Label>
                    <Input value={profile?.type || 'USER'} disabled className="bg-gray-100" />
                    <p className="text-xs text-gray-500 mt-1">Tipo de conta definido pelo sistema</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>RadCoins</Label>
                    <Input value={profile?.radcoin_balance?.toLocaleString() || '0'} disabled className="bg-gray-100" />
                  </div>
                  <div>
                    <Label>Pontos Totais</Label>
                    <Input value={profile?.total_points?.toLocaleString() || '0'} disabled className="bg-gray-100" />
                  </div>
                  <div>
                    <Label>Sequência Atual</Label>
                    <Input value={profile?.current_streak || '0'} disabled className="bg-gray-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
