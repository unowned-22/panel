import { useEffect, useState } from "react";

const TypingDots = () => {
    const [count, setCount] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => (prev >= 3 ? 1 : prev + 1));
        }, 400);
        return () => clearInterval(interval);
    }, []);

    return <span className="inline-block w-3 text-left">{".".repeat(count)}</span>;
};

export default TypingDots;