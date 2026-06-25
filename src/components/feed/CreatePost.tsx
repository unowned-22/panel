import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles, AlignLeft } from "lucide-react";
import { CreatePostModal } from "./CreatePostModal";

export const CreatePost = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <div className="panel-card flex items-center gap-2 p-2 pl-4">
        <button
          onClick={() => setOpen(true)}
          className="flex-1 flex items-center gap-2 h-10 rounded-xl hover:bg-secondary/60 px-3 text-sm text-muted-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Создать пост</span>
        </button>
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 rounded-xl hover:bg-secondary/60 flex items-center justify-center text-muted-foreground transition-colors"
          title="Истории и клипы"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate("/article/new")}
          className="w-10 h-10 rounded-xl hover:bg-secondary/60 flex items-center justify-center text-muted-foreground transition-colors"
          title="Создать статью"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
      </div>
      <CreatePostModal open={open} onOpenChange={setOpen} />
    </>
  );
};
