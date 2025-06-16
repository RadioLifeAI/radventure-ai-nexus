
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Lock, GraduationCap, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const academicStages = [
  { value: 'Student', label: '1º ao 8º Semestre' },
  { value: 'Intern', label: 'Interno de Medicina' },
  { value: 'Resident', label: 'Médico Residente' },
  { value: 'Specialist', label: 'Médico Especialista' }
];

const medicalSpecialties = [
  'Radiologia',
  'Cardiologia',
  'Neurologia',
  'Ortopedia',
  'Pediatria',
  'Ginecologia',
  'Dermatologia',
  'Psiquiatria',
  'Cirurgia Geral',
  'Medicina Interna',
  'Anestesiologia',
  'Patologia',
  'Medicina de Emergência'
];

export function SignUpForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    academicStage: '',
    medicalSpecialty: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (!formData.academicStage || !formData.medicalSpecialty) {
      setError('Por favor, preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    const userData = {
      full_name: formData.fullName,
      academic_stage: formData.academicStage,
      medical_specialty: formData.medicalSpecialty
    };

    const { error } = await signUp(formData.email, formData.password, userData);

    if (error) {
      setError(error.message === 'User already registered' 
        ? 'Este email já está cadastrado' 
        : error.message);
    } else {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/10 border-cyan-500/30 backdrop-blur-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">Criar Conta</CardTitle>
        <CardDescription className="text-cyan-200">
          Junte-se à comunidade RadVenture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="bg-red-500/20 border-red-500 text-red-100">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-cyan-100 flex items-center gap-2">
              <User size={16} />
              Nome Completo *
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="bg-white/10 border-cyan-500 text-cyan-50 placeholder:text-cyan-200"
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-cyan-100 flex items-center gap-2">
              <Mail size={16} />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-white/10 border-cyan-500 text-cyan-50 placeholder:text-cyan-200"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-cyan-100 flex items-center gap-2">
              <Lock size={16} />
              Senha *
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="bg-white/10 border-cyan-500 text-cyan-50 placeholder:text-cyan-200"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-cyan-100 flex items-center gap-2">
              <Lock size={16} />
              Confirmar Senha *
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="bg-white/10 border-cyan-500 text-cyan-50 placeholder:text-cyan-200"
              placeholder="Confirme sua senha"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-cyan-100 flex items-center gap-2">
              <GraduationCap size={16} />
              Estágio Acadêmico *
            </Label>
            <Select value={formData.academicStage} onValueChange={(value) => handleInputChange('academicStage', value)}>
              <SelectTrigger className="bg-white/10 border-cyan-500 text-cyan-50">
                <SelectValue placeholder="Selecione seu estágio" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-cyan-500">
                {academicStages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value} className="text-cyan-50 focus:bg-cyan-700">
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-cyan-100 flex items-center gap-2">
              <Stethoscope size={16} />
              Especialidade de Interesse *
            </Label>
            <Select value={formData.medicalSpecialty} onValueChange={(value) => handleInputChange('medicalSpecialty', value)}>
              <SelectTrigger className="bg-white/10 border-cyan-500 text-cyan-50">
                <SelectValue placeholder="Selecione a especialidade" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-cyan-500">
                {medicalSpecialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty} className="text-cyan-50 focus:bg-cyan-700">
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 hover:from-cyan-500 hover:to-violet-600 text-white font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
