import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Sidebar from '../components/Sidebar';

const API = 'http://localhost:8000';

export default function TeoriaPost() {
    const { subjectSlug, postSlug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API}/teoria/subjects/${subjectSlug}/posts/${postSlug}`)
            .then(r => r.ok ? r.json() : Promise.reject('Not found'))
            .then(data => { setPost(data); setLoading(false); })
            .catch(() => { setError('Artículo no encontrado.'); setLoading(false); });
    }, [subjectSlug, postSlug]);

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content" style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    <Link to="/teoria" style={{ color: '#c6ff33', textDecoration: 'none', opacity: 0.7 }}>Teoría</Link>
                    <span style={{ color: '#444' }}>/</span>
                    {post && (
                        <Link to={`/teoria/${subjectSlug}`} style={{ color: '#c6ff33', textDecoration: 'none', opacity: 0.7 }}>
                            {post.subject?.name}
                        </Link>
                    )}
                    <span style={{ color: '#444' }}>/</span>
                    <span style={{ color: '#888' }}>{post?.title}</span>
                </div>

                {loading && <p style={{ color: '#666' }}>Cargando...</p>}
                {error && <p style={{ color: '#ff4444' }}>{error}</p>}
                {post && (
                    <article>
                        <h1 style={{
                            fontFamily: '"Orbitron", sans-serif',
                            fontSize: '1.5rem',
                            fontWeight: 900,
                            color: '#e8e8e8',
                            marginBottom: '0.5rem',
                            lineHeight: 1.3,
                        }}>
                            {post.title}
                        </h1>
                        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '2rem' }}>
                            Publicado el {new Date(post.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {post.updated_at !== post.created_at && (
                                <> · Actualizado el {new Date(post.updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                            )}
                        </p>

                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '12px',
                            padding: '2.5rem',
                            lineHeight: 1.8,
                        }}>
                            <ReactMarkdown
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
                                    table: ({ node, ...props }) => <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }} {...props} />,
                                    th: ({ node, ...props }) => <th style={{ background: 'rgba(198,255,51,0.1)', color: '#c6ff33', padding: '0.5rem 1rem', textAlign: 'left', borderBottom: '1px solid rgba(198,255,51,0.3)' }} {...props} />,
                                    td: ({ node, ...props }) => <td style={{ color: '#c8c8c8', padding: '0.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }} {...props} />,
                                    blockquote: ({ node, ...props }) => <blockquote style={{ borderLeft: '3px solid #c6ff33', paddingLeft: '1rem', margin: '1rem 0', color: '#888' }} {...props} />,
                                    a: ({ node, ...props }) => <a style={{ color: '#00ffcc', textDecoration: 'underline' }} {...props} />,
                                    strong: ({ node, ...props }) => <strong style={{ color: '#ffffff', fontWeight: 700 }} {...props} />,
                                    em: ({ node, ...props }) => <em style={{ color: '#c6ff33' }} {...props} />,
                                }}
                            >
                                {post.markdown_content}
                            </ReactMarkdown>
                        </div>
                    </article>
                )}
            </main>
        </div>
    );
}
