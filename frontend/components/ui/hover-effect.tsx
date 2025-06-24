"use client";
import { cn } from "@/lib/utils";

interface HoverEffectProps {
  items: {
    title: string;
    description: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  }[];
  className?: string;
}

export const HoverEffect = ({
  items,
  className,
}: HoverEffectProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4  py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <button
          key={item.title}
          onClick={item.onClick}
          className="relative group block p-2 h-full w-full"
        >
          <div className="relative z-10 p-5 rounded-xl bg-white dark:bg-zinc-900 h-full w-full">
            <div className="p-2">{item.icon}</div>
            <div className="text-lg font-bold">{item.title}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-light">
              {item.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}; 