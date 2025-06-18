
-- Adicionar campos para diferenciação de casos Radiopaedia vs próprios
ALTER TABLE public.medical_cases 
ADD COLUMN is_radiopaedia_case boolean NOT NULL DEFAULT false,
ADD COLUMN reference_citation text,
ADD COLUMN reference_url text,
ADD COLUMN access_date date;

-- Comentário sobre os campos:
-- is_radiopaedia_case: obrigatório, indica se é caso do Radiopaedia
-- reference_citation: citação completa quando for caso Radiopaedia
-- reference_url: URL de referência (DOI ou link)
-- access_date: data de acesso ao caso original
