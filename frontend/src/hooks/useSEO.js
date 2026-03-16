/**
 * useSEO — Advanced Dynamic SEO Manager for Tech4U Academy
 * - Dynamic title, description, keywords, canonical
 * - Open Graph + Twitter/Instagram cards
 * - JSON-LD schema factories: Organization, Course, Article, BreadcrumbList, FAQ
 * - Supports multiple simultaneous schema blocks per page
 *
 * No external dependencies.
 */
import { useEffect } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────
export const BASE_URL = 'https://tech4u.academy';
export const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
export const SITE_NAME = 'Tech4U Academy';
export const DEFAULT_DESCRIPTION =
    'Tech4U Academy — Domina la FP de ASIR. Aprende Redes, Sistemas, SQL y Ciberseguridad con laboratorios interactivos, XP y desafíos reales.';
export const DEFAULT_KEYWORDS =
    'ASIR, SMR, ciberseguridad, SQL, Linux, redes, FP informática, academia online, laboratorios, sistemas operativos';

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * @param {{
 *   title?: string,
 *   description?: string,
 *   keywords?: string,
 *   image?: string,
 *   path?: string,
 *   type?: string,       // og:type — default 'website'
 *   schemas?: object[],  // array of JSON-LD schema objects
 * }} options
 */
export function useSEO({ title, description, keywords, image, path, type = 'website', schemas } = {}) {
    useEffect(() => {
        const fullTitle = title
            ? `${title} | Tech4U Academy`
            : 'Tech4U — Domina la FP de ASIR';
        const desc = description || DEFAULT_DESCRIPTION;
        const kw = keywords || DEFAULT_KEYWORDS;
        const img = image || DEFAULT_IMAGE;
        const url = BASE_URL + (path || window.location.pathname);

        // ── Primary ────────────────────────────────────────────
        document.title = fullTitle;
        setMeta('name', 'description', desc);
        setMeta('name', 'keywords', kw);
        setMeta('name', 'author', SITE_NAME);
        setMeta('name', 'robots', 'index, follow');

        // ── Open Graph ─────────────────────────────────────────
        setMeta('property', 'og:title', fullTitle);
        setMeta('property', 'og:description', desc);
        setMeta('property', 'og:image', img);
        setMeta('property', 'og:image:width', '1200');
        setMeta('property', 'og:image:height', '630');
        setMeta('property', 'og:image:alt', `${fullTitle} — Tech4U Academy`);
        setMeta('property', 'og:url', url);
        setMeta('property', 'og:type', type);
        setMeta('property', 'og:site_name', SITE_NAME);
        setMeta('property', 'og:locale', 'es_ES');

        // ── Twitter / Instagram Card ────────────────────────────
        setMeta('name', 'twitter:card', 'summary_large_image');
        setMeta('name', 'twitter:site', '@tech4uacademy');
        setMeta('name', 'twitter:creator', '@tech4uacademy');
        setMeta('name', 'twitter:title', fullTitle);
        setMeta('name', 'twitter:description', desc);
        setMeta('name', 'twitter:image', img);

        // ── Canonical ──────────────────────────────────────────
        let canonical = document.querySelector("link[rel='canonical']");
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', url);

        // ── JSON-LD Schemas ────────────────────────────────────
        // Remove old schemas
        document.querySelectorAll('script[data-seo-schema]').forEach(el => el.remove());
        // Inject new schemas
        if (schemas && schemas.length > 0) {
            schemas.forEach((schema, i) => {
                const el = document.createElement('script');
                el.type = 'application/ld+json';
                el.setAttribute('data-seo-schema', i);
                el.textContent = JSON.stringify(schema);
                document.head.appendChild(el);
            });
        }
    }, [title, description, keywords, image, path, type, schemas]);
}

// ── Utility ───────────────────────────────────────────────────────────────────
function setMeta(attrName, attrValue, content) {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

// ── Schema Factories ──────────────────────────────────────────────────────────

export const schemaOrganization = () => ({
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    description: DEFAULT_DESCRIPTION,
    contactPoint: { '@type': 'ContactPoint', email: 'info@tech4u.academy', availableLanguage: 'Spanish' },
    sameAs: ['https://www.instagram.com/tech4uacademy', 'https://discord.gg/tech4u'],
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Planes de Suscripción Tech4U',
        itemListElement: [
            { '@type': 'Offer', name: 'Plan Mensual', price: '9.99', priceCurrency: 'EUR', url: `${BASE_URL}/planes` },
            { '@type': 'Offer', name: 'Plan Trimestral', price: '24.99', priceCurrency: 'EUR', url: `${BASE_URL}/planes` },
            { '@type': 'Offer', name: 'Plan Anual', price: '89.99', priceCurrency: 'EUR', url: `${BASE_URL}/planes` },
        ],
    },
});

/**
 * @param {{ name: string, description: string, slug: string, postCount?: number }} subject
 */
export const schemaCourse = ({ name, description, slug, postCount = 0 }) => ({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url: `${BASE_URL}/teoria/${slug}`,
    numberOfLessons: postCount,
    provider: { '@type': 'Organization', name: SITE_NAME, sameAs: BASE_URL },
    inLanguage: 'es',
    isAccessibleForFree: false,
    offers: { '@type': 'Offer', price: '9.99', priceCurrency: 'EUR', url: `${BASE_URL}/planes` },
});

/**
 * @param {{ title: string, subjectSlug: string, subjectName: string, postSlug: string, createdAt: string, updatedAt: string }} p
 */
export const schemaArticle = ({ title, subjectSlug, subjectName, postSlug, createdAt, updatedAt }) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    name: title,
    description: `Aprende ${title}. Guía técnica completa para ASIR y SMR.`,
    url: `${BASE_URL}/teoria/${subjectSlug}/${postSlug}`,
    inLanguage: 'es',
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: `${BASE_URL}/favicon.svg` },
    },
    datePublished: createdAt,
    dateModified: updatedAt || createdAt,
    isPartOf: { '@type': 'Course', name: subjectName, url: `${BASE_URL}/teoria/${subjectSlug}` },
    image: DEFAULT_IMAGE,
});

/**
 * @param {Array<{ name: string, url: string }>} items
 */
export const schemaBreadcrumb = (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
});

/**
 * @param {Array<{ question: string, answer: string }>} faqs
 */
export const schemaFAQ = (faqs) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
});

// ── Prebuilt schema collections ──────────────────────────────────────────────
export const SCHEMA_HOMEPAGE = [
    schemaOrganization(),
    {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Cursos de Sistemas e Informática — Tech4U Academy',
        url: BASE_URL,
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Redes y Protocolos', url: `${BASE_URL}/teoria/redes` },
            { '@type': 'ListItem', position: 2, name: 'Sistemas Operativos', url: `${BASE_URL}/teoria/sistemas-operativos` },
            { '@type': 'ListItem', position: 3, name: 'Bases de Datos', url: `${BASE_URL}/teoria/bases-de-datos` },
            { '@type': 'ListItem', position: 4, name: 'Fundamentos de Hardware', url: `${BASE_URL}/teoria/hardware` },
            { '@type': 'ListItem', position: 5, name: 'Terminal Skills (Linux)', url: `${BASE_URL}/linux-terminal-exercises` },
            { '@type': 'ListItem', position: 6, name: 'SQL Skills', url: `${BASE_URL}/sql-practice` },
        ],
    },
];
