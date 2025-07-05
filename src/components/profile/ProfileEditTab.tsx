
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, MapPin, GraduationCap, Calendar, Stethoscope } from "lucide-react";

interface ProfileEditTabProps {
  formData: {
    full_name: string;
    username: string;
    bio: string;
    city: string;
    state: string;
    medical_specialty: string;
    academic_specialty: string;
    academic_stage: 'Student' | 'Intern' | 'Resident' | 'Specialist';
    college: string;
    birthdate: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
}

export function ProfileEditTab({ formData, onInputChange, onSubmit, isUpdating }: ProfileEditTabProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Informações Pessoais */}
      <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Nome Completo
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={onInputChange}
                placeholder="Seu nome completo"
                className="border-primary/20 focus:border-primary/50 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Nome de Usuário
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={onInputChange}
                placeholder="seu_usuario"
                className="border-primary/20 focus:border-primary/50 bg-background/50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={onInputChange}
              placeholder="Conte um pouco sobre você..."
              rows={3}
              className="border-primary/20 focus:border-primary/50 bg-background/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="birthdate" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Data de Nascimento
            </Label>
            <Input
              id="birthdate"
              name="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={onInputChange}
              className="border-primary/20 focus:border-primary/50 bg-background/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Localização */}
      <Card className="bg-gradient-to-br from-card via-card to-secondary/10 border-secondary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-secondary">
            <MapPin className="h-5 w-5" />
            Localização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Cidade
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={onInputChange}
                placeholder="Sua cidade"
                className="border-secondary/20 focus:border-secondary/50 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium">Estado</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={onInputChange}
                placeholder="Seu estado"
                className="border-secondary/20 focus:border-secondary/50 bg-background/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formação Acadêmica */}
      <Card className="bg-gradient-to-br from-card via-card to-accent/10 border-accent/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-accent">
            <GraduationCap className="h-5 w-5" />
            Formação Acadêmica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academic_stage" className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                Estágio Acadêmico
              </Label>
              <Select value={formData.academic_stage} onValueChange={(value) => 
                onInputChange({ target: { name: 'academic_stage', value } } as any)
              }>
                <SelectTrigger className="border-accent/20 focus:border-accent/50 bg-background/50">
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
              <Label htmlFor="college" className="text-sm font-medium">Instituição</Label>
              <Input
                id="college"
                name="college"
                value={formData.college}
                onChange={onInputChange}
                placeholder="Sua universidade/hospital"
                className="border-accent/20 focus:border-accent/50 bg-background/50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="academic_specialty" className="text-sm font-medium">Especialidade Acadêmica</Label>
            <Input
              id="academic_specialty"
              name="academic_specialty"
              value={formData.academic_specialty}
              onChange={onInputChange}
              placeholder="Área de estudo/pesquisa"
              className="border-accent/20 focus:border-accent/50 bg-background/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Especialidade Médica */}
      <Card className="bg-gradient-to-br from-card via-card to-primary/10 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Stethoscope className="h-5 w-5" />
            Especialidade Médica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medical_specialty" className="text-sm font-medium flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              Especialidade
            </Label>
            <Input
              id="medical_specialty"
              name="medical_specialty"
              value={formData.medical_specialty}
              onChange={onInputChange}
              placeholder="Ex: Cardiologia, Neurologia, Radiologia..."
              className="border-primary/20 focus:border-primary/50 bg-background/50"
            />
          </div>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        disabled={isUpdating} 
        className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Salvando Alterações...
          </>
        ) : (
          'Salvar Alterações'
        )}
      </Button>
    </form>
  );
}
