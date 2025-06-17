import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useFormDataSource } from "@/hooks/useFormDataSource";
import { AdminFormLayoutGamified } from "@/components/admin/AdminFormLayoutGamified";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/Loader";
import { Confetti } from "@/components/Confetti";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { CasePreviewModal } from "./CasePreviewModal";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Título deve ter pelo menos 3 caracteres.",
  }),
  description: z.string().min(10, {
    message: "Descrição deve ter pelo menos 10 caracteres.",
  }),
  specialty: z.string().min(2, {
    message: "Selecione uma especialidade.",
  }),
  modality: z.string().min(2, {
    message: "Selecione uma modalidade.",
  }),
  patient_clinical_info: z.string().optional(),
  findings: z.string().optional(),
  main_question: z.string().min(10, {
    message: "A pergunta principal deve ter pelo menos 10 caracteres.",
  }),
  explanation: z.string().min(20, {
    message: "A explicação deve ter pelo menos 20 caracteres.",
  }),
  difficulty_level: z.string().refine(value => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 1 && num <= 5;
  }, {
    message: "Selecione um nível de dificuldade entre 1 e 5.",
  }),
  category: z.string().min(2, {
    message: "Selecione uma categoria.",
  }),
  patient_age: z.string().optional(),
  patient_gender: z.string().optional(),
  symptoms_duration: z.string().optional(),
  is_featured: z.boolean().default(false).optional(),
  points: z.string().refine(value => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 10 && num <= 100;
  }, {
    message: "Pontos devem ser entre 10 e 100.",
  }),
});

export function CaseProfileForm() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { specialties, modalities, difficulties, categories, isLoading } = useFormDataSource();

  // Form state
  const [formState, setFormState] = useState({
    progress: {
      level: 1,
      experience: 0,
      nextLevelXp: 100,
      streak: 0
    }
  });

  useEffect(() => {
    // Simulação de progresso (substitua pela lógica real)
    const interval = setInterval(() => {
      setFormState(prevState => {
        let newExperience = prevState.progress.experience + 5;
        let newLevel = prevState.progress.level;
        let newNextLevelXp = prevState.progress.nextLevelXp;
        let newStreak = prevState.progress.streak + 1;

        if (newExperience >= newNextLevelXp) {
          newLevel++;
          newExperience = 0;
          newNextLevelXp = newNextLevelXp * 1.5; // Aumenta a dificuldade
        }

        return {
          ...prevState,
          progress: {
            level: newLevel,
            experience: newExperience,
            nextLevelXp: newNextLevelXp,
            streak: newStreak
          }
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      specialty: "",
      modality: "",
      patient_clinical_info: "",
      findings: "",
      main_question: "",
      explanation: "",
      difficulty_level: "1",
      category: "",
      patient_age: "",
      patient_gender: "",
      symptoms_duration: "",
      is_featured: false,
      points: "50",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("medical_cases")
        .insert([values])
        .select();

      if (error) {
        toast({
          title: "Erro ao criar caso.",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Caso criado com sucesso!",
          description: "Redirecionando para a lista de casos...",
        });
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          navigate("/admin/gestao-casos");
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado.",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminFormLayoutGamified 
      title="Criar Novo Caso Médico"
      description="Preencha as informações do caso médico com precisão"
      gamificationElements={{
        level: formState.progress.level,
        experience: formState.progress.experience,
        nextLevelXp: formState.progress.nextLevelXp,
        streak: formState.progress.streak
      }}
    >
      <Confetti isVisible={showConfetti} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título do caso médico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição concisa do caso"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a especialidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {specialties.map((specialty) => (
                            <SelectItem key={specialty.id} value={specialty.name}>
                              {specialty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {modalities.map((modality) => (
                            <SelectItem key={modality.value} value={modality.value}>
                              {modality.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="patient_clinical_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Informações Clínicas do Paciente</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Resumo do histórico e quadro clínico"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="findings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Achados Radiológicos</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição detalhada dos achados nas imagens"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="main_question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pergunta Principal</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Qual é a principal questão a ser respondida?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explicação Detalhada</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explicação detalhada da resposta e rationale"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="difficulty_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Dificuldade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a dificuldade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {difficulties.map((difficulty) => (
                          <SelectItem key={difficulty.id} value={difficulty.level.toString()}>
                            Nível {difficulty.level} - {difficulty.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontos</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Pontuação do caso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="patient_age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade do Paciente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 58" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patient_gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero do Paciente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symptoms_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração dos Sintomas</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2 dias" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Destacar este caso?
                      </FormLabel>
                      <FormDescription>
                        Casos destacados aparecem primeiro nas listagens.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              className="bg-gray-100 text-gray-500 hover:bg-gray-200"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button type="submit" disabled={isLoading || loading}>
              {loading ? (
                <>
                  Criando...
                  <Loader className="ml-2" />
                </>
              ) : (
                "Criar Caso"
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Modal de Preview - Usando o modal único */}
      <CasePreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        formData={formState}
        categories={categories}
        difficulties={difficulties}
      />
    </AdminFormLayoutGamified>
  );
}
