
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from "lucide-react";

interface DynamicTagInputProps {
  field: string;
  value: string[];
  onChange: (field: string, values: string[]) => void;
  placeholder: string;
  suggestions: string[];
  loading?: boolean;
  label: string;
}

export function DynamicTagInput({
  field,
  value,
  onChange,
  placeholder,
  suggestions,
  loading = false,
  label
}: DynamicTagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tagValue: string) => {
    if (tagValue && !value.includes(tagValue)) {
      onChange(field, [...value, tagValue]);
    }
  };

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(field, newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="space-y-2">
      <label className="font-semibold block text-sm">
        {label}
        {loading && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
      </label>
      
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            addTag(inputValue);
            setInputValue("");
          }}
          disabled={!inputValue.trim()}
        >
          <Plus size={16} />
        </Button>
      </div>
      
      {/* Sugestões Dinâmicas */}
      {suggestions.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-gray-600">Sugestões baseadas no diagnóstico:</div>
          <div className="flex flex-wrap gap-1">
            {suggestions.slice(0, 8).map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                className="h-6 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200"
                onClick={() => addTag(suggestion)}
                disabled={value.includes(suggestion)}
              >
                + {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Tags Selecionadas */}
      <div className="flex flex-wrap gap-1">
        {value.map((tag, index) => (
          <Badge key={index} variant="secondary" className="gap-1">
            {tag}
            <X 
              size={12} 
              className="cursor-pointer hover:text-red-500" 
              onClick={() => removeTag(index)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
}
