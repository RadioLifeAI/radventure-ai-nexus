
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Nome Completo</Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={onInputChange}
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <Label htmlFor="username">Nome de Usuário</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={onInputChange}
            placeholder="seu_usuario"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={onInputChange}
          placeholder="Conte um pouco sobre você..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={onInputChange}
            placeholder="Sua cidade"
          />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={onInputChange}
            placeholder="Seu estado"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="medical_specialty">Especialidade Médica</Label>
          <Input
            id="medical_specialty"
            name="medical_specialty"
            value={formData.medical_specialty}
            onChange={onInputChange}
            placeholder="Ex: Cardiologia, Neurologia..."
          />
        </div>
        <div>
          <Label htmlFor="academic_specialty">Especialidade Acadêmica</Label>
          <Input
            id="academic_specialty"
            name="academic_specialty"
            value={formData.academic_specialty}
            onChange={onInputChange}
            placeholder="Área de estudo/pesquisa"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="academic_stage">Estágio Acadêmico</Label>
          <Select value={formData.academic_stage} onValueChange={(value) => 
            onInputChange({ target: { name: 'academic_stage', value } } as any)
          }>
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
        <div>
          <Label htmlFor="college">Instituição</Label>
          <Input
            id="college"
            name="college"
            value={formData.college}
            onChange={onInputChange}
            placeholder="Sua universidade/hospital"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="birthdate">Data de Nascimento</Label>
        <Input
          id="birthdate"
          name="birthdate"
          type="date"
          value={formData.birthdate}
          onChange={onInputChange}
        />
      </div>

      <Button type="submit" disabled={isUpdating} className="w-full">
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar Alterações'
        )}
      </Button>
    </form>
  );
}
