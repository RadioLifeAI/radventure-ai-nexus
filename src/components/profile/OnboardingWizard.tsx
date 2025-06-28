
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  User, 
  MapPin, 
  GraduationCap,
  Trophy,
  Coins,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingWizard({ isOpen, onClose }: OnboardingWizardProps) {
  const { profile, updateProfile, isUpdating } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    city: profile?.city || '',
    state: profile?.state || '',
    medical_specialty: profile?.medical_specialty || '',
    academic_stage: profile?.academic_stage || 'Student',
    college: profile?.college || '',
    bio: profile?.bio || ''
  });

  const steps = [
    {
      title: "Bem-vindo ao RadVenture!",
      subtitle: "Vamos configurar seu perfil em 3 passos simples",
      icon: Rocket,
      reward: 0
    },
    {
      title: "Informações Pessoais",
      subtitle: "Como devemos te chamar?",
      icon: User,
      reward: 25
    },
    {
      title: "Localização",
      subtitle: "De onde você é?",
      icon: MapPin,
      reward: 15
    },
    {
      title: "Informações Acadêmicas",
      subtitle: "Conte sobre sua formação",
      icon: GraduationCap,
      reward: 45
    },
    {
      title: "Perfil Completo!",
      subtitle: "Parabéns! Você ganhou suas primeiras RadCoins",
      icon: Trophy,
      reward: 0
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const totalReward = steps.reduce((sum, step) => sum + step.reward, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await updateProfile(formData);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    }
  };

  const IconComponent = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-6 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {currentStepData.title}
                </DialogTitle>
                <p className="text-purple-100 mt-1">
                  {currentStepData.subtitle}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Barra de Progresso */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Passo {currentStep + 1} de {steps.length}</span>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4" />
                <span>+{totalReward} RadCoins</span>
              </div>
            </div>
            <div className="bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Conteúdo dos Steps */}
          {currentStep === 0 && (
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-8">
                <Sparkles className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Sua Jornada Radiológica Começa Aqui!
                </h3>
                <p className="text-gray-600 mb-4">
                  Complete seu perfil e ganhe <strong>{totalReward} RadCoins</strong> de bônus inicial.
                </p>
                <div className="flex justify-center gap-4">
                  <Badge className="bg-purple-100 text-purple-800">
                    🎯 Casos Personalizados
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    📊 Progresso Detalhado
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    🏆 Ranking Nacional
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Coins className="h-4 w-4" />
                  <span className="font-medium">+{currentStepData.reward} RadCoins por completar</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Biografia (opcional)</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Conte um pouco sobre você..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Coins className="h-4 w-4" />
                  <span className="font-medium">+{currentStepData.reward} RadCoins por completar</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Sua cidade"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Seu estado"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Coins className="h-4 w-4" />
                  <span className="font-medium">+{currentStepData.reward} RadCoins por completar</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medical_specialty">Especialidade Médica</Label>
                  <Input
                    id="medical_specialty"
                    name="medical_specialty"
                    value={formData.medical_specialty}
                    onChange={handleInputChange}
                    placeholder="Ex: Cardiologia, Neurologia..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="academic_stage">Estágio Acadêmico</Label>
                  <Select 
                    value={formData.academic_stage} 
                    onValueChange={(value) => handleSelectChange('academic_stage', value)}
                  >
                    <SelectTrigger className="mt-1">
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
              
              <div>
                <Label htmlFor="college">Instituição</Label>
                <Input
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  placeholder="Sua universidade/hospital"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-8">
                <Trophy className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Parabéns! Perfil Completo
                </h3>
                <p className="text-green-700 mb-4">
                  Você ganhou <strong>{totalReward} RadCoins</strong> de bônus inicial!
                </p>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-center gap-2 text-green-800">
                    <Coins className="h-5 w-5" />
                    <span className="text-lg font-bold">+{totalReward} RadCoins</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Próximos Passos:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>🎯 Explore casos médicos personalizados</li>
                  <li>📈 Acompanhe seu progresso em tempo real</li>
                  <li>🏆 Participe do ranking nacional</li>
                  <li>🎁 Ganhe mais RadCoins resolvendo casos</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Navegação */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center gap-2"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={isUpdating}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
              >
                {isUpdating ? (
                  <>Salvando...</>
                ) : (
                  <>
                    Começar Jornada
                    <Rocket className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
