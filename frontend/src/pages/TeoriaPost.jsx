import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Sidebar from '../components/Sidebar';
import Breadcrumb from '../components/Breadcrumb';
import api from '../services/api';
import { useSEO, schemaArticle, schemaBreadcrumb } from '../hooks/useSEO';

export default function TeoriaPost() {
    const { subjectSlug, postSlug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useSEO({
        title: post ? `${post.title} — ${post.subject?.name || 'Teoría'}` : 'Cargando artículo...',
        description: post
            ? `Aprende ${post.title}. Guía técnica completa para ASIR y SMR. | Tech4U Academy`
            : 'Artículo técnico de Tech4U Academy.',
        type: 'article',
        path: `/teoria/${subjectSlug}/${postSlug}`,
        schemas: post ? [
            schemaArticle({
                title: post.title,
                subjectSlug,
                subjectName: post.subject?.name || subjectSlug,
                postSlug,
                createdAt: post.created_at,
                updatedAt: post.updated_at,
            }),
            schemaBreadcrumb([
                { name: 'Inicio', url: '/' },
                { name: 'Teoría', url: '/teoria' },
                { name: post.subject?.name || subjectSlug, url: `/teoria/${subjectSlug}` },
                { name: post.title, url: `/teoria/${subjectSlug}/${postSlug}` },
            ]),
        ] : undefined,
    });

    useEffect(() => {
        api.get(`/teoria/subjects/${subjectSlug}/posts/${postSlug}`)
            .then(res => setPost(res.data))
            .catch(() => setError('Artículo no encontrado.'))
            .finally(() => setLoading(false));
    }, [subjectSlug, postSlug]);

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content" style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}>
                <Breadcrumb items={[
                    { name: 'Inicio', href: '/' },
                    { name: 'Teoría', href: '/teoria' },
                    post ? { name: post.subject?.name || subjectSlug, href: `/teoria/${subjectSlug}` } : { name: subjectSlug },
                    { name: post?.title || postSlug },
                ]} />

                {loading && <p style={{ color: '#666' }}>Cargando...</p>}
                {error && <p style={{ color: '#ff4444' }}>{error}</p>}
                {post && (
                    <article>
                        <h1 style={{ fontFamily: '"Orbitron", sans-serif', fontSize: '1.5rem', fontWeight: 900, color: '#e8e8e8', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                            {post.title}
                        </h1>
                        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '2rem' }}>
                            Publicado el {new Date(post.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {post.updated_at !== post.created_at && (
                                <> · Actualizado el {new Date(post.updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                            )}
                        </p>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '2.5rem', lineHeight: 1.8 }}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({ node, ...props }) => <h1 style={{ color: '#c6ff33', fontFamily: '"Orbitron",sans-serif', fontSize: '1.4rem', marginBottom: '1rem', borderBottom: '1px solid rgba(198,255,51,0.2)', paddingBottom: '0.5rem' }} {...props} />,
                                    h2: ({ node, ...props }) => <h2 style={{ color: '#c6ff33', fontSize: '1.2rem', marginTop: '2rem', marginBottom: '0.75rem' }} {...props} />,
                                    h3: ({ node, ...props }) => <h3 style={{ color: '#00ffcc', fontSize: '1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }} {...props} />,
                                    p: ({ node, ...props }) => <p style={{ color: '#c8c8c8', marginBottom: '1rem' }} {...props} />,
                                    code: ({ node, inline, ...props }) => inline
                                        ? <code style={{ background: 'rgba(198,255,51,0.15)', color: '#c6ff33', padding: '0.15em 0.4em', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85em' }} {...props} />
                                        : <code style={{ display: 'block', background: 'rgba(0,0,0,0.5)', color: '#c6ff33', padding: '1.25rem', borderRadius: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85em', overflowX: 'auto', marginBottom: '1rem', border: '1px solid rgba(198,255,51,0.2)' }} {...props} />,
                                    pre: ({ node, ...props }) => <pre style={{ margin: '1rem 0' }} {...props} />,
                                    ul: ({ node, ...props }) => <ul style={{ color: '#c8c8c8', paddingLeft: '1.5rem', marginBottom: '1rem' }} {...props} />,
                                    ol: ({ node, ...props }) => <ol style={{ color: '#c8c8c8', paddingLeft: '1.5rem', marginBottom: '1rem' }} {...props} />,
                                    li: ({ node, ...props }) => <li style={{ marginBottom: '0.35rem' }} {...props} />,
                                    table: ({ node, ...props }) => (<div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}><table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid rgba(198,255,51,0.15)', borderRadius: '8px', overflow: 'hidden' }} {...props} /></div>),
                                    thead: ({ node, ...props }) => <thead style={{ background: 'rgba(198,255,51,0.08)' }} {...props} />,
                                    tbody: ({ node, ...props }) => <tbody {...props} />,
                                    tr: ({ node, ...props }) => <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,255,51,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} {...props} />,
                                    th: ({ node, ...props }) => <th style={{ background: 'rgba(198,255,51,0.1)', color: '#c6ff33', padding: '0.65rem 1rem', textAlign: 'left', borderBottom: '1px solid rgba(198,255,51,0.25)', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }} {...props} />,
                                    td: ({ node, ...props }) => <td style={{ color: '#c8c8c8', padding: '0.6rem 1rem', borderRight: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }} {...props} />,
                                    blockquote: ({ node, ...props }) => <blockquote style={{ borderLeft: '3px solid #c6ff33', paddingLeft: '1rem', margin: '1rem 0', color: '#888' }} {...props} />,
                                    a: ({ node, ...props }) => <a style={{ color: '#00ffcc', textDecoration: 'underline' }} {...props} />,
                                    strong: ({ node, ...props }) => <strong style={{ color: '#ffffff', fontWeight: 700 }} {...props} />,
                                    em: ({ node, ...props }) => <em style={{ color: '#c6ff33' }} {...props} />,
                                }}
                            >
                                {post.markdown_content}
                            </ReactMarkdown>
                        </div>

                        {/* SEO Internal Linking */}
                        <div className="mt-16 pt-8 border-t border-white/5 text-center">
                            <h3 className="text-xl font-black italic tracking-tight text-white mb-6">Explora más en Tech4U</h3>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link to="/labs" className="px-6 py-3 rounded-2xl bg-[#c6ff33]/5 border border-[#c6ff33]/20 text-[#c6ff33] font-black text-xs uppercase tracking-widest hover:bg-[#c6ff33]/10 hover:scale-105 transition-all">
                                    🚀 Laboratorios Prácticos
                                </Link>
                                <Link to="/sql-skills" className="px-6 py-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-blue-400 font-black text-xs uppercase tracking-widest hover:bg-blue-500/10 hover:scale-105 transition-all">
                                    📊 SQL Skills
                                </Link>
                            </div>
                        </div>
                    </article>
                )}
            </main>
        </div>
    );
}
