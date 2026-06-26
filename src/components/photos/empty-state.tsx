import type { ReactNode } from "react";

interface EmptyStateProps {
    icon: ReactNode;
    text: string;
    action?: ReactNode;
}
export const EmptyState = ({ icon, text, action }: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            {icon}
        </div>
        <div className="text-sm">{text}</div>
        {action}
    </div>
);