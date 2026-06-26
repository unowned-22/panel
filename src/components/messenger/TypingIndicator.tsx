const TypingIndicator = ({ name }: { name: string }) => (
  <div className="flex items-center gap-2 px-4 py-1.5">
    <div className="flex items-center gap-2 bg-secondary rounded-2xl rounded-bl-md px-4 py-2.5">
      <span className="text-primary text-[13px] font-semibold">{name}</span>
      <div className="flex items-center gap-[3px]">
        <span className="w-[6px] h-[6px] rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-[6px] h-[6px] rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-[6px] h-[6px] rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  </div>
);

export default TypingIndicator;
