
import React from "react";
import { ExternalLink, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  isRadiopaediaCase: boolean;
  referenceCitation?: string;
  referenceUrl?: string;
  accessDate?: string;
};

export function CaseReferenceDisplay({ 
  isRadiopaediaCase, 
  referenceCitation, 
  referenceUrl, 
  accessDate 
}: Props) {
  if (!isRadiopaediaCase) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <BookOpen size={14} className="mr-1" />
          Caso Próprio
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <ExternalLink size={14} className="mr-1" />
          Radiopaedia.org
        </Badge>
      </div>
      
      {referenceCitation && (
        <div>
          <h5 className="font-semibold text-sm text-gray-700 mb-1">Referência:</h5>
          <p className="text-sm text-gray-600 italic">{referenceCitation}</p>
        </div>
      )}
      
      {referenceUrl && (
        <div>
          <a
            href={referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            <ExternalLink size={16} />
            Acessar caso original
          </a>
        </div>
      )}
      
      {accessDate && (
        <div className="text-xs text-gray-500">
          Acessado em: {new Date(accessDate).toLocaleDateString('pt-BR')}
        </div>
      )}
    </div>
  );
}
