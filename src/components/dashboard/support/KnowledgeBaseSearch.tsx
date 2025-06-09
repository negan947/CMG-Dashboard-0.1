'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Book, HelpCircle, FileText, Wrench } from 'lucide-react';

export function KnowledgeBaseSearch() {
  const quickLinks = [
    { title: "Getting Started", icon: <Book className="mr-2 h-4 w-4" /> },
    { title: "Billing FAQs", icon: <HelpCircle className="mr-2 h-4 w-4" /> },
    { title: "API Integration", icon: <FileText className="mr-2 h-4 w-4" /> },
    { title: "Troubleshooting Syncs", icon: <Wrench className="mr-2 h-4 w-4" /> },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search help articles..."
          className="pl-10"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {quickLinks.map((link) => (
          <Button key={link.title} variant="outline" size="sm">
            {link.icon}
            {link.title}
          </Button>
        ))}
      </div>
    </div>
  );
} 