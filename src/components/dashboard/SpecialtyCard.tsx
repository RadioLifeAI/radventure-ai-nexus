
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SpecialtyCardProps {
  specialty: {
    id: string;
    name: string;
    cases: number;
  };
  onClick: () => void;
}

const SpecialtyCard = React.memo(({ specialty, onClick }: SpecialtyCardProps) => {
  return (
    <Card 
      className="bg-white/5 border-white/20 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm">{specialty.name}</h3>
            <p className="text-cyan-200 text-xs mt-1">
              {specialty.cases} casos disponíveis
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-blue-500/20 text-blue-300 text-xs"
          >
            {specialty.cases}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});

SpecialtyCard.displayName = "SpecialtyCard";

export { SpecialtyCard };
