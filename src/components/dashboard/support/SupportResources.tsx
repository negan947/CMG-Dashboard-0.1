'use client';

import { ArrowUpRight, Book, Users, CircleDotDashed, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';


export function SupportResources() {
    const { theme } = useTheme();
    const isDark = theme !== 'light';

    const resources = [
        { title: 'API Docs', description: 'Detailed documentation for our API.', icon: <Book />, link: '#' },
        { title: 'Community Forum', description: 'Ask questions and share tips.', icon: <Users />, link: '#' },
        { title: 'System Status', description: 'Check the current status of our services.', icon: <CircleDotDashed />, link: '#' },
        { title: 'Contact Us', description: 'Get in touch with our team directly.', icon: <Phone />, link: '#' },
    ];

    return (
        <div className="p-4 grid md:grid-cols-2 gap-4">
            {resources.map(resource => (
                <a
                    key={resource.title}
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        "block p-4 rounded-lg group transition-all",
                        isDark ? "hover:bg-zinc-700/50" : "hover:bg-gray-100"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-2 rounded-lg", isDark ? "bg-zinc-700" : "bg-gray-200")}>
                                {resource.icon}
                            </div>
                            <div>
                                <h4 className="font-semibold">{resource.title}</h4>
                                <p className="text-sm text-muted-foreground">{resource.description}</p>
                            </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                </a>
            ))}
        </div>
    );
} 