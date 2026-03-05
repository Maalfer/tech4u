import React, { useEffect, useRef, useState } from 'react';
import StartGame from '../game/main';
import { EventBus } from '../game/EventBus';
import { BootScene } from '../game/scenes/BootScene';
import { EscenaAldea } from '../game/scenes/EscenaAldea';
import { EscenaCasa } from '../game/scenes/EscenaCasa';
import { X, Shield, Globe, Database, Laptop, Cpu, Rocket, Award } from 'lucide-react';

// Assets
import papiroImg from '../assets/papiro_rules.png';

const interactables = [
    { id: 1, titulo: 'Ciberseguridad Ofensiva', icon: <Shield className="w-8 h-8 text-red-500" />, desc: 'Explora técnicas de pentesting y auditoría de sistemas.' },
    { id: 2, titulo: 'Arquitectura Cloud', icon: <Globe className="w-8 h-8 text-blue-500" />, desc: 'Despliegues escalables en AWS, Azure y Google Cloud.' },
    { id: 3, titulo: 'Administración de BBDD', icon: <Database className="w-8 h-8 text-amber-500" />, desc: 'Optimización de consultas SQL y NoSQL a nivel experto.' },
    { id: 4, titulo: 'Desarrollo Full Stack', icon: <Laptop className="w-8 h-8 text-emerald-500" />, desc: 'Dominio de React, Node.js y arquitecturas modernas.' },
    { id: 5, titulo: 'Sistemas Operativos', icon: <Cpu className="w-8 h-8 text-purple-500" />, desc: 'Gestión avanzada de Linux, Windows Server y virtualización.' },
    { id: 6, titulo: 'DevOps & CI/CD', icon: <Rocket className="w-8 h-8 text-orange-500" />, desc: 'Automatización de despliegues y contenedores con Docker.' },
    { id: 7, titulo: 'Certificaciones IT', icon: <Award className="w-8 h-8 text-yellow-500" />, desc: 'Ruta de aprendizaje para certificaciones oficiales de la industria.' }
];

export default function PhaserGameWrapper({ user }) {
    const gameContainer = useRef(null);
    const gameInstance = useRef(null);

    // UI States
    const [showPapiro, setShowPapiro] = useState(false);
    const [activeModal, setActiveModal] = useState(null); // Infographic target
    const [dialogData, setDialogData] = useState(null); // NPC dialog

    useEffect(() => {
        if (!gameInstance.current) {
            // Include user-specific config if needed
            window.currentUser = user;

            // Initialize Phaser
            const game = StartGame(gameContainer.current);
            game.scene.add('BootScene', BootScene);
            game.scene.add('EscenaAldea', EscenaAldea);
            game.scene.add('EscenaCasa', EscenaCasa);

            game.scene.start('BootScene');
            gameInstance.current = game;
        }

        // EventBus Listeners
        const handleShowPapiro = () => setShowPapiro(true);
        const handleShowDialog = (data) => setDialogData(data);
        const handleShowInfographic = (data) => {
            const item = interactables.find(i => i.id === data.id);
            setActiveModal(item || interactables[0]);
        };

        EventBus.on('SHOW_PAPIRO', handleShowPapiro);
        EventBus.on('SHOW_DIALOG', handleShowDialog);
        EventBus.on('SHOW_INFOGRAPHIC', handleShowInfographic);

        return () => {
            EventBus.off('SHOW_PAPIRO', handleShowPapiro);
            EventBus.off('SHOW_DIALOG', handleShowDialog);
            EventBus.off('SHOW_INFOGRAPHIC', handleShowInfographic);
            if (gameInstance.current) {
                gameInstance.current.destroy(true);
                gameInstance.current = null;
            }
        };
    }, []);

    const closeModal = () => {
        setShowPapiro(false);
        setActiveModal(null);
        setDialogData(null);
        EventBus.emit('CLOSE_MODAL');
    };

    // Keyboard support to close modals
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showPapiro || activeModal || dialogData) {
                if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                    closeModal();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showPapiro, activeModal, dialogData]);


    return (
        <div className="relative w-full h-full flex items-center justify-center">

            {/* Phaser Game Container */}
            <div
                ref={gameContainer}
                className="relative w-full max-w-[1240px] aspect-[4/3] rounded-[2rem] border-8 border-white/5 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            ></div>

            {/* Giant Papiro Modal */}
            {showPapiro && (
                <div className="absolute inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500">
                    <div className="relative w-[80vw] max-w-[900px] aspect-[4/3] animate-in zoom-in spin-in-1 duration-500 flex items-center justify-center">
                        <img src={papiroImg} alt="Rules" className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]" />
                        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center max-w-[600px]">
                            <h2 className="text-amber-900 font-black text-4xl mb-6 italic">REGLAS DEL MUNDO RPG</h2>
                            <p className="text-amber-950 font-serif leading-relaxed text-xl mb-6">
                                Usa <span className="font-bold underline text-2xl">WASD</span> o <span className="font-bold underline text-2xl">FLECHAS</span> para mover tu personaje píxel a píxel.
                                <br /><br />
                                Entra a los edificios y presiona <span className="font-bold underline text-2xl">ENTER / ESPACIO</span> cerca de las terminales azules para desplegar tu Portafolio Técnico.
                            </p>
                            <button
                                onClick={closeModal}
                                className="mt-8 bg-amber-900 border-4 border-amber-800 text-amber-100 px-12 py-4 rounded-full font-black hover:bg-amber-800 transition-all hover:scale-110 shadow-2xl uppercase tracking-[0.2em] text-lg"
                            >
                                Iniciar Aventura
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Infographic Modal */}
            {activeModal && (
                <div className="absolute inset-0 z-[2000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-12 animate-in zoom-in duration-300">
                    <button
                        onClick={closeModal}
                        className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-10 h-10" />
                    </button>

                    <div className="max-w-[1200px] w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="flex flex-col items-center md:items-start">
                            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-neon/20 to-blue-500/20 border border-neon/30 mb-8 shadow-2xl shadow-neon/10">
                                {React.cloneElement(activeModal.icon, { className: "w-16 h-16 " + activeModal.icon.props.className })}
                            </div>
                            <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">
                                {activeModal.titulo.split(' ')[0]} <br />
                                <span className="text-neon">{activeModal.titulo.split(' ').slice(1).join(' ')}</span>
                            </h2>
                            <p className="text-slate-400 text-2xl leading-relaxed mb-8">
                                {activeModal.desc}
                            </p>
                            <div className="flex gap-4">
                                <div className="px-8 py-3 rounded-full border border-white/10 text-slate-500 text-lg font-mono uppercase tracking-widest">
                                    Infografía #0{activeModal.id}
                                </div>
                                <button onClick={closeModal} className="px-8 py-3 rounded-full bg-neon text-black text-lg font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                    Cerrar (Enter)
                                </button>
                            </div>
                        </div>

                        {/* Infographic Mockup */}
                        <div className="aspect-[4/5] bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-neon/5 to-transparent"></div>
                            <div className="text-center p-12 relative z-10 transition-transform group-hover:scale-110 duration-700">
                                <div className="text-neon font-black text-[120px] opacity-10">TECH</div>
                                <div className="text-white/20 text-[10px] font-mono tracking-[1em] mt-[-40px]">INFOGRAPHIC_{activeModal.id}_DATA</div>
                            </div>
                            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,170,0.1) 3px)' }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Retro Dialog Box (NPC) */}
            {dialogData && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1500] w-[80vw] max-w-[1000px] pointer-events-none animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-[#050a18] border-4 border-cyan-500/50 rounded-3xl p-8 relative shadow-[0_0_50px_rgba(0,255,255,0.2)] backdrop-blur-xl">
                        <div className="absolute -top-6 left-10 bg-cyan-900 border-2 border-cyan-400 text-cyan-100 px-6 py-2 rounded-xl font-black text-xl uppercase tracking-widest shadow-lg">
                            {dialogData.title}
                        </div>
                        <p className="text-cyan-50 font-mono text-2xl leading-relaxed mt-4">
                            "{dialogData.text}"
                        </p>
                        <div className="mt-8 flex justify-end">
                            <div className="text-cyan-500/60 font-black animate-pulse uppercase tracking-widest flex items-center gap-2 text-sm">
                                Presiona <span className="text-cyan-400">[ENTER]</span> o <span className="text-cyan-400">[ESPACIO]</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
