import { ChevronLeft } from "lucide-react";

export function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-zinc-300"><ChevronLeft className="h-5 w-5" /></button>
        <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
      </div>
  );
}
