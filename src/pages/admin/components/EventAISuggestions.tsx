
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { useEventAISuggestions } from '@/hooks/useEventAISuggestions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface EventAISuggestionsProps {
  onApplySuggestion: (suggestion: any) => void;
  onAutoFill: (data: any) => void;
  currentFilters?: any;
}

export function EventAISuggestions({ onApplySuggestion, onAutoFill, currentFilters }: EventAISuggestionsProps) {
  const { loading, suggestions, getSuggestions, getAutoFill } = useEventAISuggestions();
  const [context, setContext] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGetSuggestions = async () => {
    const results = await getSuggestions(currentFilters, context);
    if (results?.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleAutoFill = async () => {
    const result = await getAutoFill(currentFilters, context);
    if (result) {
      onAutoFill(result);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">Assistente IA para Eventos</h3>
        </div>
        
        <div className="space-y-3">
          <Textarea
            placeholder="Descreva o tipo de evento que você quer criar (opcional)..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="min-h-[80px]"
          />
          
          <div className="flex gap-2">
            <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={handleGetSuggestions}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Sugerir Eventos
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Sugestões de Eventos por IA</DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4">
                  {suggestions.map((suggestion, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{suggestion.name}</CardTitle>
                            <CardDescription className="mt-1">{suggestion.description}</CardDescription>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              onApplySuggestion(suggestion);
                              setShowSuggestions(false);
                            }}
                            className="ml-4"
                          >
                            Aplicar
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{suggestion.specialty}</Badge>
                          <Badge variant="outline">{suggestion.modality}</Badge>
                          <Badge variant="outline">{suggestion.numberOfCases} casos</Badge>
                          <Badge variant="outline">{suggestion.durationMinutes}min</Badge>
                          <Badge variant="outline">{suggestion.prizeRadcoins} RadCoins</Badge>
                          <Badge className="bg-green-100 text-green-700">{suggestion.target}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={handleAutoFill}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
              Auto-Preencher
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
