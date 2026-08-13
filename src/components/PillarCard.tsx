"use client";

import React from "react";
import Link from "next/link";
import * as Icons from "lucide-react";

interface PillarCardProps {
  title: string;
  path: string;
  icon: keyof typeof Icons;
  description?: string;
}

export default function PillarCard({ title, path, icon, description }: PillarCardProps) {
  const IconComponent = (Icons[icon] as React.ComponentType<{ className?: string }>) || Icons.HelpCircle;
  const ArrowRightIcon = Icons.ArrowRight;

  return (
    <Link href={path} className="group block">
      <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-subtle)] shadow-xs hover:border-[var(--primary)]/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-44 hover:-translate-y-1">
        <div className="flex justify-between items-start">
          <div className="bg-[var(--bg-subtle)] p-3 rounded-2xl text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300 shadow-xs">
            <IconComponent className="w-6 h-6" />
          </div>
          
          <div className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transform group-hover:translate-x-1.5 transition-transform duration-200 p-1">
            <ArrowRightIcon className="w-5 h-5" />
          </div>
        </div>
        
        <div>
          <h3 className="font-display font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
            {title}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-sans line-clamp-2">
            {description || "Manage your agent performance metrics and financial decisions."}
          </p>
        </div>
      </div>
    </Link>
  );
}

export { PillarCard };
