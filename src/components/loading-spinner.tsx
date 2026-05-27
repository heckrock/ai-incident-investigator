import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  label = "Analyzing incident…",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
        <Loader2 className="relative size-10 animate-spin text-primary" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-muted-foreground text-xs">
          Correlating logs, traces, and war-room data
        </p>
      </div>
    </div>
  );
}
