import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Download, ExternalLink, FileText,
    Film, Image as ImageIcon, Lock, AlertCircle,
    BookOpen, Database, Wifi, Monitor, Shield, Cpu, Code
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

// ── Helpers ──────────────────────────────────────────────────────────────────

const SUBJECT_STYLE = {
    'Bases de Datos': { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: Database },
    'Redes': { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: Wifi },
    'Sistemas Operativos': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Monitor },
    'Ciberseguridad': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: Shield },
    'Fundamentos de Hardware': { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: Cpu },
    'Lenguaje de Marcas': { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: Code },
}
const DEFAULT_STYLE = { color: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/10', icon: FileText }

function detectType(url, fileType) {
    const ft = (fileType || '').toUpperCase()
    if (ft === 'PDF' || url?.toLowerCase().endsWith('.pdf')) return 'pdf'
    if (['MP4', 'WEBM', 'OGG', 'MOV'].includes(ft) || /\.(mp4|webm|ogg|mov)$/i.test(url || '')) return 'video'
    if (['JPG', 'JPEG', 'PNG', 'GIF', 'SVG', 'WEBP'].includes(ft) || /\.(jpe?g|png|gif|svg|webp)$/i.test(url || '')) return 'image'
    if (url?.includes('youtube.com') || url?.includes('youtu.be') || url?.includes('vimeo.com')) return 'embed'
    return 'link'
}

function getEmbedUrl(url) {
    if (!url) return null
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
    // Vimeo
    const vmMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`
    return url
}

// ── Viewer components ─────────────────────────────────────────────────────────

function PDFViewer({ url, title }) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Visor de PDF</span>
                <a href={url} download target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neon text-black text-[10px] font-black rounded-lg uppercase hover:shadow-[0_0_15px_var(--neon-alpha-40)] transition-all">
                    <Download className="w-3 h-3" /> Descargar PDF
                </a>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-black min-h-[70vh]">
                <iframe
                    src={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
                    title={title}
                    className="w-full h-full min-h-[70vh]"
                    style={{ minHeight: '70vh' }}
                />
            </div>
        </div>
    )
}

function VideoViewer({ url, title }) {
    return (
        <div className="flex flex-col gap-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Reproductor de vídeo</span>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video">
                <video
                    src={url}
                    controls
                    className="w-full h-full"
                    title={title}
                >
                    Tu navegador no soporta reproducción de vídeo.
                    <a href={url} download>Descarga el vídeo aquí.</a>
                </video>
            </div>
            <a href={url} download className="self-start flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-mono transition-all">
                <Download className="w-3.5 h-3.5" /> Descargar
            </a>
        </div>
    )
}

function EmbedViewer({ url, title }) {
    const embedUrl = getEmbedUrl(url)
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Contenido incrustado</span>
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-slate-400 hover:text-white text-[10px] font-mono rounded-lg transition-all">
                    <ExternalLink className="w-3 h-3" /> Abrir original
                </a>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video">
                <iframe
                    src={embedUrl}
                    title={title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        </div>
    )
}

function ImageViewer({ url, title }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Imagen</span>
                <a href={url} download target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neon text-black text-[10px] font-black rounded-lg uppercase">
                    <Download className="w-3 h-3" /> Descargar
                </a>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center p-4">
                <img src={url} alt={title} className="max-w-full max-h-[70vh] rounded-xl object-contain" />
            </div>
        </div>
    )
}

function LinkViewer({ url, title }) {
    return (
        <div className="glass rounded-2xl border border-white/10 p-10 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <ExternalLink className="w-8 h-8 text-sky-400" />
            </div>
            <div>
                <p className="text-white font-black text-lg mb-2">{title}</p>
                <p className="text-slate-500 font-mono text-xs">Este recurso se abre en una pestaña externa</p>
            </div>
            <a href={url} target="_blank" rel="noopener noreferrer"
                className="px-8 py-3 bg-neon text-black font-black text-sm uppercase rounded-xl hover:shadow-[0_0_20px_var(--neon-alpha-40)] hover:scale-[1.01] transition-all">
                Abrir recurso →
            </a>
        </div>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ResourceViewer() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [resource, setResource] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        api.get(`/resources/${id}`)
            .then(r => setResource(r.data))
            .catch(e => {
                if (e.response?.status === 404) setError('Recurso no encontrado.')
                else setError('No se pudo cargar el recurso.')
            })
            .finally(() => setLoading(false))
    }, [id])

    const style = resource ? (SUBJECT_STYLE[resource.subject] || DEFAULT_STYLE) : DEFAULT_STYLE
    const SubIcon = style.icon
    const viewType = resource ? detectType(resource.url, resource.file_type) : null

    return (
        <div className="flex min-h-screen bg-[#0D0D0D] text-white">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">

                {/* Back button + breadcrumb */}
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => navigate('/resources')}
                        className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-slate-600 font-mono text-xs">Recursos</span>
                    <span className="text-slate-700 font-mono text-xs">›</span>
                    {resource && (
                        <span className={`text-xs font-mono ${style.color} truncate max-w-xs`}>{resource.title}</span>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-neon/30 border-t-neon rounded-full animate-spin" />
                    </div>

                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <AlertCircle className="w-12 h-12 text-red-500/50" />
                        <p className="text-red-400 font-mono text-sm">{error}</p>
                        <button onClick={() => navigate('/resources')} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-all">
                            ← Volver a recursos
                        </button>
                    </div>

                ) : resource ? (
                    <div className="max-w-5xl">

                        {/* Resource header card */}
                        <div className={`glass rounded-2xl border ${style.border} p-6 mb-8 flex items-center gap-5`}>
                            <div className={`w-14 h-14 rounded-2xl ${style.bg} border ${style.border} flex items-center justify-center flex-shrink-0`}>
                                <SubIcon className={`w-7 h-7 ${style.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${style.bg} ${style.border} ${style.color}`}>
                                        {resource.subject}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-600 uppercase bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
                                        {resource.file_type || 'Archivo'}
                                    </span>
                                </div>
                                <h1 className="text-xl font-black text-white uppercase italic truncate">{resource.title}</h1>
                                {resource.description && (
                                    <p className="text-slate-500 font-mono text-xs mt-1 leading-relaxed">{resource.description}</p>
                                )}
                            </div>
                            {resource.url && (
                                <a href={resource.url} download target="_blank" rel="noopener noreferrer"
                                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:border-neon/30 text-slate-400 hover:text-white rounded-xl text-xs font-mono transition-all">
                                    <Download className="w-4 h-4" /> Descargar
                                </a>
                            )}
                        </div>

                        {/* Locked state */}
                        {resource.is_locked ? (
                            <div className="glass rounded-2xl border border-yellow-500/20 p-14 flex flex-col items-center justify-center text-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                                    <Lock className="w-8 h-8 text-yellow-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase mb-2">Contenido protegido</h2>
                                    <p className="text-slate-500 font-mono text-sm">Necesitas una suscripción activa para acceder a este recurso.</p>
                                </div>
                                <button onClick={() => navigate('/suscripcion')}
                                    className="px-8 py-3 bg-neon text-black font-black text-sm uppercase rounded-xl hover:shadow-[0_0_20px_var(--neon-alpha-40)] transition-all">
                                    Ver planes →
                                </button>
                            </div>
                        ) : (
                            /* Viewer */
                            <div>
                                {viewType === 'pdf' && <PDFViewer url={resource.url} title={resource.title} />}
                                {viewType === 'video' && <VideoViewer url={resource.url} title={resource.title} />}
                                {viewType === 'embed' && <EmbedViewer url={resource.url} title={resource.title} />}
                                {viewType === 'image' && <ImageViewer url={resource.url} title={resource.title} />}
                                {viewType === 'link' && <LinkViewer url={resource.url} title={resource.title} />}
                            </div>
                        )}
                    </div>
                ) : null}
            </main>
        </div>
    )
}
