
-- Insere categorias de Diagnóstico por Imagem e Especialidades Médicas caso não existam
INSERT INTO public.medical_specialties (name) VALUES
  ('Neurorradiologia'),
  ('Coluna'),
  ('Cabeça e Pescoço'),
  ('Tórax'),
  ('Abdome'),
  ('Musculoesquelético'),
  ('Intervencionista'),
  ('Medicina de Emergência'),
  ('Pediatria'),
  ('Trauma'),
  ('Saúde da Mulher'),
  ('Obstetrícia'),
  ('Ginecologia'),
  ('Hematologia'),
  ('Gastrointestinal'),
  ('Hepatobiliar'),
  ('Dermatologia'),
  ('Otorrinolaringologia'),
  ('Oncologia'),
  ('Urologia'),
  ('Vascular'),
  ('Cirurgia'),
  ('Clínica Médica'),
  ('Reumatologia'),
  ('Nefrologia'),
  ('Cardiologia'),
  ('Neurologia'),
  ('Endocrinologia'),
  ('Infectologia'),
  ('Psiquiatria'),
  ('Outros')
ON CONFLICT (name) DO NOTHING;

-- Insere as dificuldades caso não existam
INSERT INTO public.difficulties (level, description) VALUES
  (1, 'Iniciante'),
  (2, 'Intermediário'),
  (3, 'Avançado'),
  (4, 'Infernal')
ON CONFLICT (level) DO NOTHING;
