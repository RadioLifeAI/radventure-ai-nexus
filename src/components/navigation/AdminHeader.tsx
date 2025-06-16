
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  title: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AdminHeader({ title, breadcrumbs }: AdminHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between px-8 py-6 border-b bg-white shadow-sm min-h-[76px]">
      <div className="flex flex-col gap-2">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-gray-900 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="text-cyan-600" size={28} />
          {title}
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </Button>
        </Link>
        <Link to="/admin/analytics">
          <Button variant="ghost" size="sm">
            <BarChart3 size={16} />
          </Button>
        </Link>
        <Link to="/admin/usuarios">
          <Button variant="ghost" size="sm">
            <Users size={16} />
          </Button>
        </Link>
      </div>
    </header>
  );
}
