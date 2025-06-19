
import React, { useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Keyboard,
  Zap,
  Edit,
  Copy,
  Eye,
  BarChart,
  Wand2,
  GitCompare,
  Save,
  X
} from "lucide-react";

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
  category: 'navigation' | 'editing' | 'actions';
}

interface CaseShortcutsManagerProps {
  shortcuts: Shortcut[];
  enabled?: boolean;
}

export function CaseShortcutsManager({ shortcuts, enabled = true }: CaseShortcutsManagerProps) {
  const [showHelp, setShowHelp] = React.useState(false);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignorar se estiver digitando em input/textarea
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }

    const shortcut = shortcuts.find(s => {
      const keys = s.key.toLowerCase().split('+');
      const pressedKey = event.key.toLowerCase();
      
      if (keys.length === 1) {
        return keys[0] === pressedKey;
      }
      
      // Para combinações com modificadores
      const hasCtrl = keys.includes('ctrl') && event.ctrlKey;
      const hasShift = keys.includes('shift') && event.shiftKey;
      const hasAlt = keys.includes('alt') && event.altKey;
      const mainKey = keys[keys.length - 1];
      
      return mainKey === pressedKey && 
             (hasCtrl || !keys.includes('ctrl')) &&
             (hasShift || !keys.includes('shift')) &&
             (hasAlt || !keys.includes('alt'));
    });

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }

    // Mostrar/ocultar ajuda com ?
    if (event.key === '?' && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      setShowHelp(prev => !prev);
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const groupedShortcuts = shortcuts.reduce((groups, shortcut) => {
    if (!groups[shortcut.category]) {
      groups[shortcut.category] = [];
    }
    groups[shortcut.category].push(shortcut);
    return groups;
  }, {} as Record<string, Shortcut[]>);

  if (!showHelp) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2"
        >
          <Keyboard className="h-4 w-4" />
          <span className="hidden sm:inline">Atalhos (?)</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Keyboard className="h-5 w-5" />
              Atalhos do Teclado
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h4 className="text-sm font-medium mb-2 capitalize">
                {category === 'navigation' ? 'Navegação' : 
                 category === 'editing' ? 'Edição' : 'Ações'}
              </h4>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {shortcut.icon}
                      <span>{shortcut.description}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {shortcut.key}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                <span>Mostrar/Ocultar ajuda</span>
              </div>
              <Badge variant="outline" className="text-xs">?</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para criar atalhos específicos do contexto
export function useCaseShortcuts(handlers: {
  onQuickEdit?: () => void;
  onView?: () => void;
  onDuplicate?: () => void;
  onAnalytics?: () => void;
  onWizardEdit?: () => void;
  onVersionComparison?: () => void;
  onSave?: () => void;
  onClose?: () => void;
}) {
  return React.useMemo(() => {
    const shortcuts: Shortcut[] = [];

    if (handlers.onQuickEdit) {
      shortcuts.push({
        key: 'e',
        description: 'Edição rápida',
        action: handlers.onQuickEdit,
        icon: <Edit className="h-4 w-4" />,
        category: 'editing'
      });
    }

    if (handlers.onView) {
      shortcuts.push({
        key: 'v',
        description: 'Visualizar caso',
        action: handlers.onView,
        icon: <Eye className="h-4 w-4" />,
        category: 'navigation'
      });
    }

    if (handlers.onDuplicate) {
      shortcuts.push({
        key: 'd',
        description: 'Duplicar caso',
        action: handlers.onDuplicate,
        icon: <Copy className="h-4 w-4" />,
        category: 'actions'
      });
    }

    if (handlers.onAnalytics) {
      shortcuts.push({
        key: 'a',
        description: 'Ver analytics',
        action: handlers.onAnalytics,
        icon: <BarChart className="h-4 w-4" />,
        category: 'navigation'
      });
    }

    if (handlers.onWizardEdit) {
      shortcuts.push({
        key: 'w',
        description: 'Editor wizard',
        action: handlers.onWizardEdit,
        icon: <Wand2 className="h-4 w-4" />,
        category: 'editing'
      });
    }

    if (handlers.onVersionComparison) {
      shortcuts.push({
        key: 'g',
        description: 'Comparar versões',
        action: handlers.onVersionComparison,
        icon: <GitCompare className="h-4 w-4" />,
        category: 'navigation'
      });
    }

    if (handlers.onSave) {
      shortcuts.push({
        key: 'Ctrl+S',
        description: 'Salvar',
        action: handlers.onSave,
        icon: <Save className="h-4 w-4" />,
        category: 'actions'
      });
    }

    if (handlers.onClose) {
      shortcuts.push({
        key: 'Escape',
        description: 'Fechar modal',
        action: handlers.onClose,
        icon: <X className="h-4 w-4" />,
        category: 'navigation'
      });
    }

    return shortcuts;
  }, [handlers]);
}
