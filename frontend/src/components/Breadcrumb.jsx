/**
 * Breadcrumb — Visual breadcrumb trail + automatic BreadcrumbList JSON-LD injection
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { name: 'Inicio', href: '/' },
 *     { name: 'Teoría', href: '/teoria' },
 *     { name: 'Redes', href: '/teoria/redes' },
 *     { name: 'Modelo OSI' },   // no href = current page (last item)
 *   ]} />
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { schemaBreadcrumb, BASE_URL } from '../hooks/useSEO';

export default function Breadcrumb({ items = [] }) {
    // Inject BreadcrumbList JSON-LD on mount / change
    useEffect(() => {
        const schemaItems = items.map(item => ({
            name: item.name,
            url: item.href
                ? item.href.startsWith('http') ? item.href : `${BASE_URL}${item.href}`
                : `${BASE_URL}${window.location.pathname}`,
        }));

        let el = document.getElementById('__breadcrumb_schema__');
        if (!el) {
            el = document.createElement('script');
            el.id = '__breadcrumb_schema__';
            el.type = 'application/ld+json';
            document.head.appendChild(el);
        }
        el.textContent = JSON.stringify(schemaBreadcrumb(schemaItems));

        return () => {
            const existing = document.getElementById('__breadcrumb_schema__');
            if (existing) existing.remove();
        };
    }, [items]);

    return (
        <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 mb-6 flex-wrap"
        >
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <span key={index} className="flex items-center gap-1.5">
                        {index === 0 && (
                            <Home
                                className="w-3 h-3 text-slate-600 flex-shrink-0"
                                aria-hidden="true"
                            />
                        )}
                        {!isLast && item.href ? (
                            <Link
                                to={item.href}
                                className="hover:text-white transition-colors"
                            >
                                {item.name}
                            </Link>
                        ) : (
                            <span
                                className={isLast ? 'text-slate-300 font-medium' : ''}
                                aria-current={isLast ? 'page' : undefined}
                            >
                                {item.name}
                            </span>
                        )}
                        {!isLast && (
                            <ChevronRight className="w-3 h-3 text-slate-700 flex-shrink-0" aria-hidden="true" />
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
