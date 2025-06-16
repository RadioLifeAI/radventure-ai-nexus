
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, Heart, Bone, Eye, Baby, Stethoscope, 
  Zap, Shield, Activity, Users 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const specialties = [
  { name: 'Neurologia', icon: Brain, color: 'bg-purple-100 text-purple-700', count: 8 },
  { name: 'Cardiologia', icon: Heart, color: 'bg-red-100 text-red-700', count: 12 },
  { name: 'Ortopedia', icon: Bone, color: 'bg-blue-100 text-blue-700', count: 6 },
  { name: 'Oftalmologia', icon: Eye, color: 'bg-green-100 text-green-700', count: 4 },
  { name: 'Pediatria', icon: Baby, color: 'bg-pink-100 text-pink-700', count: 9 },
  { name: 'Pneumologia', icon: Stethoscope, color: 'bg-indigo-100 text-indigo-700', count: 7 },
  { name: 'Emergência', icon: Zap, color: 'bg-yellow-100 text-yellow-700', count: 15 },
  { name: 'Radiologia Geral', icon: Shield, color: 'bg-gray-100 text-gray-700', count: 20 }
];

export function SpecialtyQuickAccess() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Acesso Rápido por Especialidade</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {specialties.map((specialty) => {
          const Icon = specialty.icon;
          return (
            <Link
              key={specialty.name}
              to={`/casos?specialty=${encodeURIComponent(specialty.name)}`}
              className="group"
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${specialty.color} mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">{specialty.name}</h3>
                  <p className="text-xs text-gray-600">{specialty.count} casos</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
