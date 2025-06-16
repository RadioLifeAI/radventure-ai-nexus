
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Lock, GraduationCap, Stethoscope, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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

interface FormValidation {
  fullName: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  academicStage: boolean;
  medicalSpecialty: boolean;
}

export function SignUpForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validation, setValidation] = useState<FormValidation>({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    academicStage: false,
    medicalSpecialty: false
  });
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    academicStage: '',
    medicalSpecialty: ''
  });

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'fullName':
        return value.trim().length >= 3;
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'password':
        return value.length >= 6;
      case 'confirmPassword':
        return value === formData.password;
      case 'academicStage':
      case 'medicalSpecialty':
        return value.trim().length > 0;
      default:
        return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidation(prev => ({ 
      ...prev, 
      [field]: validateField(field, value)
    }));
    setError('');
  };

  const getFieldValidationMessage = (field: string) => {
    switch (field) {
      case 'fullName':
        return 'Nome deve ter pelo menos 3 caracteres';
      case 'email':
        return 'Email deve ter formato válido';
      case 'password':
        return 'Senha deve ter pelo menos 6 caracteres';
      case 'confirmPassword':
        return 'Senhas devem coincidir';
      case 'academicStage':
        return 'Selecione seu estágio acadêmico';
      case 'medicalSpecialty':
        return 'Selecione sua especialidade de interesse';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newValidation = {
      fullName: validateField('fullName', formData.fullName),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
      academicStage: validateField('academicStage', formData.academicStage),
      medicalSpecialty: validateField('medicalSpecialty', formData.medicalSpecialty)
    };
    
    setValidation(newValidation);
    return Object.values(newValidation).every(Boolean);
  };

  const getErrorMessage = (error: any) => {
    if (!error) return '';
    
    const message = error.message || '';
    
    // Mapeamento melhorado de erros
    if (message.includes('User already registered') || message.includes('email_address_already_registered')) {
      return 'Este email já está cadastrado. Tente fazer login.';
    }
    if (message.includes('Invalid email')) {
      return 'Email inválido. Verifique o formato do email.';
    }
    if (message.includes('Password should be at least')) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (message.includes('Failed to create user profile') || message.includes('Database error')) {
      return 'Erro interno do sistema. Nossa equipe foi notificada. Tente novamente em alguns minutos.';
    }
    if (message.includes('profile_type') || message.includes('academic_stage')) {
      return 'Erro de configuração detectado. Nossa equipe foi notificada. Tente novamente.';
    }
    if (message.includes('Too many requests')) {
      return 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
    }
    
    return 'Erro inesperado. Nossa equipe foi notificada. Tente novamente.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      setError('Por favor, corrija os campos destacados');
      return;
    }

    setLoading(true);

    try {
      // Dados estruturados para o backend
      const userData = {
        full_name: formData.fullName.trim(),
        academic_stage: formData.academicStage,
        medical_specialty: formData.medicalSpecialty
      };

      console.log('Submitting signup with structured data:', userData);

      const { error } = await signUp(formData.email.trim(), formData.password, userData);

      if (error) {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
        
        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        setSuccess(true);
        
        toast({
          title: "Cadastro realizado!",
          description: "Bem-vindo ao RadVenture! Redirecionando para o dashboard...",
        });
        
        // Redirect after a brief delay to show success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (unexpectedError: any) {
      console.error('Unexpected error during signup:', unexpectedError);
      const errorMessage = 'Erro inesperado. Nossa equipe foi notificada. Tente novamente.';
      setError(errorMessage);
      
      toast({
        title: "Erro inesperado",
        description: errorMessage,
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/10 border-green-500/30 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Cadastro Realizado!</h3>
            <p className="text-green-200">Redirecionando para o dashboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              className={`bg-white/10 border-cyan-500 text-cyan-50 placeholder:text-cyan-200 ${
                formData.fullName && !validation.fullName ? 'border-red-500' : ''
              }`}
              placeholder="Seu nome completo"
              required
            />
            {formData.fullName && !validation.fullName && (
              <p className="text-red-300 text-sm">{getFieldValidationMessage('fullName')}</p>
            )}
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
              className={`bg-white/10 border-cyan-500 text-cyan-50 placeholder:text-cyan-200 ${
                formData.email && !validation.email ? 'border-red-500' : ''
              }`}
              placeholder="seu@email.com"
              required
            />
            {formData.email && !validation.email && (
              <p className="text-red-300 text-sm">{getFieldValidationMessage('email')}</p>
            )}
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
              className={`bg-white/10 border-cyan-500 text-cyan-50 placeholder:text-cyan-200 ${
                formData.password && !validation.password ? 'border-red-500' : ''
              }`}
              placeholder="Mínimo 6 caracteres"
              required
            />
            {formData.password && !validation.password && (
              <p className="text-red-300 text-sm">{getFieldValidationMessage('password')}</p>
            )}
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
              className={`bg-white/10 border-cyan-500 text-cyan-50 placeholder:text-cyan-200 ${
                formData.confirmPassword && !validation.confirmPassword ? 'border-red-500' : ''
              }`}
              placeholder="Confirme sua senha"
              required
            />
            {formData.confirmPassword && !validation.confirmPassword && (
              <p className="text-red-300 text-sm">{getFieldValidationMessage('confirmPassword')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-cyan-100 flex items-center gap-2">
              <GraduationCap size={16} />
              Estágio Acadêmico *
            </Label>
            <Select 
              value={formData.academicStage} 
              onValueChange={(value) => handleInputChange('academicStage', value)}
            >
              <SelectTrigger className={`bg-white/10 border-cyan-500 text-cyan-50 ${
                formData.academicStage && !validation.academicStage ? 'border-red-500' : ''
              }`}>
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
            <Select 
              value={formData.medicalSpecialty} 
              onValueChange={(value) => handleInputChange('medicalSpecialty', value)}
            >
              <SelectTrigger className={`bg-white/10 border-cyan-500 text-cyan-50 ${
                formData.medicalSpecialty && !validation.medicalSpecialty ? 'border-red-500' : ''
              }`}>
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
            disabled={loading || !Object.values(validation).every(Boolean)}
            className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 hover:from-cyan-500 hover:to-violet-600 text-white font-bold disabled:opacity-50"
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
