import { MessageCircleMore } from "lucide-react";

interface Props {
    onStartCreate: () => void;
}

export const EmptyChatState = ({ onStartCreate }: Props) => (
    <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
            <MessageCircleMore className="w-16 h-16 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">Выберите чат</p>
            <button
                onClick={onStartCreate}
                className="text-primary hover:underline"
            >
                или создайте новый
            </button>
        </div>
    </div>
);