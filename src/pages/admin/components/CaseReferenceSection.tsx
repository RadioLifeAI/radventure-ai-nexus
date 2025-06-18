
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink } from "lucide-react";

type Props = {
  form: any;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  renderTooltipTip: (id: string, text: string) => React.ReactNode;
};

export function CaseReferenceSection({ form, handleFormChange, renderTooltipTip }: Props) {
  const handleRadiopaediaChange = (checked: boolean) => {
    // Atualizar formulário e limpar campos se desmarcado
    const updatedForm = {
      ...form,
      is_radiopaedia_case: checked,
      reference_citation: checked ? form.reference_citation : "",
      reference_url: checked ? form.reference_url : "",
      access_date: checked ? form.access_date : ""
    };
    
    // Simular evento para manter compatibilidade
    const event = {
      target: {
        name: "is_radiopaedia_case",
        value: checked,
        type: "checkbox",
        checked
      }
    } as any;
    
    handleFormChange(event);
    
    // Limpar campos específicos se desmarcado
    if (!checked) {
      ["reference_citation", "reference_url", "access_date"].forEach(field => {
        const clearEvent = {
          target: { name: field, value: "" }
        } as any;
        handleFormChange(clearEvent);
      });
    }
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center space-x-3">
        <Checkbox
          id="is_radiopaedia_case"
          checked={form.is_radiopaedia_case || false}
          onCheckedChange={handleRadiopaediaChange}
          className="h-5 w-5"
        />
        <label htmlFor="is_radiopaedia_case" className="font-semibold text-gray-900 cursor-pointer">
          Este caso é da biblioteca do Radiopaedia? *
          {renderTooltipTip("tip-radiopaedia", "Marque esta opção se o caso for proveniente da biblioteca do Radiopaedia.org")}
        </label>
      </div>

      {form.is_radiopaedia_case && (
        <div className="space-y-4 pl-8 border-l-2 border-cyan-200">
          <div>
            <label className="font-semibold block mb-2">
              Citação Completa da Referência *
              {renderTooltipTip("tip-citation", "Formato: Autor(es). Título do caso. Radiopaedia.org (Acessado em DD de MMM de AAAA)")}
            </label>
            <Textarea
              name="reference_citation"
              value={form.reference_citation || ""}
              onChange={handleFormChange}
              placeholder="Ex: Codo L, et al. Título do Artigo de referência. Radiopaedia.org (Acessado em 16 de junho de 2025)"
              required={form.is_radiopaedia_case}
              className="min-h-[80px] focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              URL de Referência (DOI ou Link) *
              {renderTooltipTip("tip-reference-url", "Link completo para o caso original no Radiopaedia")}
            </label>
            <div className="flex items-center gap-2">
              <Input
                name="reference_url"
                type="url"
                value={form.reference_url || ""}
                onChange={handleFormChange}
                placeholder="https://doi.org/11.53347/rID ou https://radiopaedia.org/cases/..."
                required={form.is_radiopaedia_case}
                className="flex-1 focus:ring-2 focus:ring-cyan-500"
              />
              {form.reference_url && (
                <a
                  href={form.reference_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-cyan-600 hover:text-cyan-800"
                  title="Abrir referência em nova aba"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Data de Acesso
              {renderTooltipTip("tip-access-date", "Data em que o caso foi acessado para criação desta questão")}
            </label>
            <Input
              name="access_date"
              type="date"
              value={form.access_date || ""}
              onChange={handleFormChange}
              className="focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
