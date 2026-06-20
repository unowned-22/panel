import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useTranslation } from "@/hooks/use-translation";

export function Error404() {
    const { t } = useTranslation();

    return (
        <>
            <div className="mb-10 mx-auto">
                <img
                    src={toAbsoluteUrl('/err-404.svg')}
                    className="dark:hidden max-h-40"
                    alt="image"
                />
                <img
                    src={toAbsoluteUrl('/err-404-dark.svg')}
                    className="hidden dark:block max-h-40"
                    alt="image"
                />
            </div>

            <span className="badge badge-primary badge-outline mb-3 text-center">{t('page.error.404')}</span>

            <h3 className="text-2xl font-semibold text-mono text-center mb-2">
                {t('page.error.lost.page')}
            </h3>

            <div className="text-base text-center text-secondary-foreground mb-10">
                {t('page.error.page.missing')}
                <Link
                    to="/"
                    className="text-primary font-medium hover:text-primary-active"
                >
                    {t('page.error.return')}
                </Link>
                .
            </div>
        </>
    );
}