import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Terminal,
    Globe,
    Layers,
    FlaskConical,
    Zap,
    ChevronRight,
    Menu,
    Plus,
    Search,
    BookOpen,
    Shield
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

import AdminSkillPaths from './AdminSkillPaths';
import AdminModules from './AdminModules';
import AdminLabsContent from './AdminLabsContent';
import AdminChallenges from './AdminChallenges';
import AdminLabGenerator from './AdminLabGenerator';

export default function AdminTerminalBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const { addNotification } = useNotification();

    // Breadcrumbs logic
    const pathSegments = location.pathname.split('/').filter(x => x);

    return (
        <div className="min-h-screen bg-[#060606] text-slate-200 font-mono selection:bg-neon selection:text-black">
            {/* Top Navigation / Breadcrumbs */}
            <div className="sticky top-0 z-40 bg-[#060606]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-neon/10 rounded-lg border border-neon/20 group cursor-pointer" onClick={() => navigate('/gestion/terminal-builder')}>
                            <Terminal className="w-5 h-5 text-neon transition-transform group-hover:scale-110" />
                        </div>
                        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <Link to="/admin-dashboard" className="hover:text-white transition-colors">Admin</Link>
                            <ChevronRight className="w-3 h-3 text-slate-700" />
                            <Link to="/gestion/terminal-builder" className="hover:text-white transition-colors">Terminal Builder</Link>
                            {pathSegments.length > 2 && (
                                <>
                                    <ChevronRight className="w-3 h-3 text-slate-700" />
                                    <span className="text-neon">{pathSegments[pathSegments.length - 1].replace(/-/g, ' ')}</span>
                                </>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 italic">
                            <Shield className="w-3 h-3" /> Core System v5.2 Stable
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-8 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="mb-12 space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
                                    Content <span className="text-neon">Architect</span>
                                </h1>
                            </div>
                            <p className="text-slate-500 text-sm max-w-2xl border-l-2 border-neon/20 pl-4 py-1 italic">
                                Sistema modular para la construcción de laboratorios de terminal, gestión de rutas de aprendizaje y arquitectura de retos técnicos.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/gestion/terminal-builder/lab-generator')}
                            className="flex items-center gap-2 bg-neon/10 text-neon border border-neon/30 px-6 py-3 rounded-xl font-black uppercase tracking-tighter hover:bg-neon hover:text-black transition-all shadow-[0_0_20px_rgba(198,255,51,0.1)] hover:shadow-[0_0_20px_rgba(198,255,51,0.4)]"
                        >
                            <Plus className="w-5 h-5" /> Lab Generator
                        </button>
                    </div>
                </div>

                {/* Main Views Container */}
                <div className="relative">
                    <Routes>
                        <Route path="/" element={
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                {/* Summary Cards to explain hierarchy */}
                                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.04] transition-all group cursor-pointer" onClick={() => navigate('/gestion/terminal-builder/paths')}>
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:border-blue-500/40">
                                        <Globe className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Skill Paths</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">Rutas globales de especialización técnica. (Ej: Linux Fundamentals)</p>
                                </div>

                                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.04] transition-all group cursor-pointer" onClick={() => navigate('/gestion/terminal-builder/paths')}>
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:border-purple-500/40">
                                        <Layers className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Módulos</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">Bloques temáticos estructurados dentro de una ruta.</p>
                                </div>

                                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.04] transition-all group cursor-pointer" onClick={() => navigate('/gestion/terminal-builder/paths')}>
                                    <div className="w-12 h-12 bg-neon/10 rounded-2xl flex items-center justify-center mb-6 border border-neon/20 group-hover:border-neon/40">
                                        <FlaskConical className="w-6 h-6 text-neon" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Laboratorios</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">Ejercicios técnicos interactivos de terminal y retos de validación.</p>
                                </div>
                            </div>
                        } />
                        <Route path="/paths" element={<AdminSkillPaths />} />
                        <Route path="/paths/:pathId/modules" element={<AdminModules />} />
                        <Route path="/modules/:moduleId/labs" element={<AdminLabsContent />} />
                        <Route path="/labs/:labId/challenges" element={<AdminChallenges />} />
                        <Route path="/lab-generator" element={<AdminLabGenerator />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}
