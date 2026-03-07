import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StartGame from '../game/main';
import { EventBus } from '../game/EventBus';
import { BootScene } from '../game/scenes/BootScene';
import { EscenaCasa } from '../game/scenes/EscenaCasa';
import { X, Monitor, BookOpen, Sword, BedDouble, BookMarked, LogOut } from 'lucide-react';

// Mapa de iconos por ruta
const routeIcons = {
    '/tests':      <Monitor className="w-8 h-8 text-neon" />,
    '/recursos':   <BookOpen className="w-8 h-8 text-blue-400" />,
    '/teoria':     <BookMarked className="w-8 h-8 text-amber-400" />,
    '/personaje':  <Sword className="w-8 h-8 text-purple-400" />,
    '/dashboard':  <LogOut className="w-8 h-8 text-slate-400" />,
};

const routeLabels = {
    '/tests':      'Test Center',
    '/recursos':   'Recursos',
    '/teoria':     'Teoría',
    '/personaje':  'Mi Personaje',
    '/dashboard':  'Dashboard',
};

export default function PhaserGameWrapper({ user }) {
    const navigate       = useNavigate();
    const gameContainer  = useRef(null);
    const gameInstance   = useRef(null);

    const [dialogData,  setDialogData]  = useState(null); // { title, text }
    const [navPrompt,   setNavPrompt]   = useState(null); // { route, text }

    useEffect(() => {
        if (!gameInstance.current && gameContainer.current) {
            window.currentUser = user;
            const game = StartGame(gameContainer.current);
            game.scene.add('BootScene',  BootScene);
            game.scene.add('EscenaCasa', EscenaCasa);
            game.scene.start('BootScene');
            gameInstance.current = game;
        }

        // ── Handlers ──────────────────────────────────────────────────────────
        const handleDialog   = (data)         => setDialogData(data);
        const handleNavigate = (route, text)  => setNavPrompt({ route, text });
        const handleClose    = ()             => {
            setDialogData(null);
            setNavPrompt(null);
        };

        EventBus.on('SHOW_DIALOG',  handleDialog);
        EventBus.on('NAVIGATE',     handleNavigate);
        EventBus.on('CLOSE_MODAL',  handleClose);

        return () => {
            EventBus.off('SHOW_DIALOG',  handleDialog);
            EventBus.off('NAVIGATE',     handleNavigate);
            EventBus.off('CLOSE_MODAL',  handleClose);
            if (gameInstance.current) {
                gameInstance.current.destroy(true);
                gameInstance.current = null;
            }
        };
    }, []);

    // Cerrar con Escape / Enter / Espacio
    useEffect(() => {
        const onKey = (e) => {
            if (dialogData || navPrompt) {
                if (e.key === 'Escape') closeAll();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [dialogData, navPrompt]);

    const closeAll = () => {
        setDialogData(null);
        setNavPrompt(null);
        EventBus.emit('CLOSE_MODAL');
    };

    const goToRoute = (route) => {
        closeAll();
        navigate(route);
    };

    const isOpen = !!dialogData || !!navPrompt;

    return (
        <div className="relative w-full h-full flex items-center justify-center">

            {/* ── Canvas del juego ─────────────────────────────────────────── */}
            <div
                ref={gameContainer}
                className="relative w-full max-w-[1240px] aspect-[4/3] rounded-[1.5rem] border-4 border-white/5 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)]"
            />

            {/* ── Diálogo simple (cama, sin navegación) ────────────────────── */}
            {dialogData && (
                <div className="absolute inset-0 z-[2000] flex items-end justify-center pb-10 pointer-events-none">
                    <div className="pointer-events-auto w-[80%] max-w-[800px] animate-in slide-in-from-bottom-8 fade-in duration-300">
                        {/* Marco estilo RPG retro */}
                        <div className="relative bg-[#050a18] border-4 border-cyan-500/60 rounded-2xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.25)]">
                            {/* Nombre / título */}
                            <div className="absolute -top-5 left-8 bg-[#0a1428] border-2 border-cyan-500/60 text-cyan-200 px-5 py-1 rounded-lg font-black text-sm uppercase tracking-widest">
                                {dialogData.title}
                            </div>
                            {/* Texto */}
                            <p className="text-cyan-50 font-mono text-sm leading-relaxed whitespace-pre-line mt-2">
                                {dialogData.text}
                            </p>
                            {/* Indicador */}
                            <div className="mt-4 flex justify-between items-center">
                                <div className="text-cyan-500/50 font-mono text-xs animate-pulse">
                                    Presiona <span className="text-cyan-400">[ESC]</span> para cerrar
                                </div>
                                <button
                                    onClick={closeAll}
                                    className="px-4 py-1.5 bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-500/40 text-cyan-300 font-black text-xs rounded-lg uppercase tracking-widest transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Prompt de navegación (objetos interactivos) ───────────────── */}
            {navPrompt && (
                <div className="absolute inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                    <div className="bg-[#070d1f] border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-90 duration-300">

                        {/* Icono de la sección */}
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                {routeIcons[navPrompt.route] ?? <Monitor className="w-8 h-8 text-neon" />}
                            </div>
                        </div>

                        {/* Título */}
                        <h2 className="text-center text-xl font-black text-white uppercase tracking-wider mb-2">
                            {routeLabels[navPrompt.route] ?? 'Sección'}
                        </h2>

                        {/* Texto de contexto (si lo hay) */}
                        {navPrompt.text && (
                            <p className="text-center text-slate-400 font-mono text-xs leading-relaxed mb-6 whitespace-pre-line">
                                {navPrompt.text}
                            </p>
                        )}
                        {!navPrompt.text && (
                            <p className="text-center text-slate-500 text-sm mb-6">
                                ¿Deseas ir a esta sección?
                            </p>
                        )}

                        {/* Botones */}
                        <div className="flex gap-3">
                            <button
                                onClick={closeAll}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/30 font-mono text-sm uppercase tracking-widest transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => goToRoute(navPrompt.route)}
                                className="flex-1 py-3 rounded-xl bg-neon text-black font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(198,255,51,0.3)]"
                            >
                                Ir →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Botón de salida (esquina) ─────────────────────────────────── */}
            {!isOpen && (
                <button
                    onClick={() => navigate('/dashboard')}
                    className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-black/60 hover:bg-black/80 border border-white/10 hover:border-white/30 rounded-xl text-slate-400 hover:text-white font-mono text-xs uppercase tracking-widest transition-all backdrop-blur-md"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Salir
                </button>
            )}
        </div>
    );
}
