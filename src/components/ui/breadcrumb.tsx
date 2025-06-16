
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}>
      <Link 
        to="/" 
        className="flex items-center hover:text-cyan-400 transition-colors"
      >
        <Home size={16} />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={16} className="text-gray-400" />
          {item.current || !item.href ? (
            <span className={`${item.current ? 'text-cyan-400 font-medium' : 'text-gray-600'}`}>
              {item.label}
            </span>
          ) : (
            <Link 
              to={item.href} 
              className="hover:text-cyan-400 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
