import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 border-dashed bg-slate-50 p-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Icon size={24} className="text-slate-500" />
      </div>
      <h3 className="mb-1 font-bold text-slate-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
