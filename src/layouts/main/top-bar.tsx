import { Link } from "react-router-dom";
import { toAbsoluteUrl } from '@/lib/helpers';

export const TopBar = () => {
    return (
        <header className="sticky top-0 z-40 h-15 bg-background/85 backdrop-blur-xl border-b border-border">
            <div className="max-w-7xl mx-auto h-full px-4 flex items-center gap-4">
                <Link to="/me/get-started" className="flex items-center gap-2 shrink-0 w-50">
                    <img src={toAbsoluteUrl('/unowned.png')} className="max-h-40" alt="unowned" />
                </Link>
            </div>
        </header>
    )
};