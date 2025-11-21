"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          background: '#ffffff',
          color: '#000000',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        classNames: {
          title: 'text-sm font-semibold',
          description: 'text-sm',
          success: '!bg-white !border-l-4 !border-l-green-500',
          error: '!bg-white !border-l-4 !border-l-red-500',
          warning: '!bg-white !border-l-4 !border-l-yellow-500',
          info: '!bg-white !border-l-4 !border-l-blue-500',
        },
        descriptionClassName: 'text-sm',
      }}
      style={{
        '--normal-text': '#000000',
        '--success-text': '#000000',
        '--error-text': '#000000',
        '--warning-text': '#000000',
        '--info-text': '#000000',
      } as React.CSSProperties}
      {...props}
    />
  );
};

export { Toaster };
