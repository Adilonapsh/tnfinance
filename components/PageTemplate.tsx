"use client";

import React from 'react';

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function PageTemplate({ title, subtitle, children, maxWidth = "max-w-[1600px]" }: PageTemplateProps) {
  return (
    <div className="flex flex-col gap-6 w-full mx-auto pb-10" style={{ maxWidth: maxWidth === "max-w-[1600px]" ? "1600px" : maxWidth }}>
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
