import { Scene } from 'phaser';

export class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.image('papiro_rules', '/src/assets/papiro_rules.png');
        this.load.image('marco_pj',     '/src/assets/marco_pj.png');
        this.load.image('aldea_mapa',   '/src/assets/aldea_mapa.png');
    }

    create() {
        this._generateHeroTexture();
        this._createAnimations();
        this.scene.start('EscenaCasa');
    }

    // ─── Genera el spritesheet del héroe usando canvas ────────────────────────
    _generateHeroTexture() {
        const FW = 16, FH = 24; // píxeles por frame
        const canvas = this.textures.createCanvas('hero', FW * 4, FH * 4);
        const ctx = canvas.getContext();
        ctx.imageSmoothingEnabled = false;

        const C = {
            skin:    '#ffccaa',
            hair:    '#2d1500',
            armor:   '#3a5a8f',
            armorDk: '#2a4070',
            armorLt: '#6a90bf',
            pants:   '#1e2d3d',
            boots:   '#2a1500',
            gold:    '#c8a000',
        };

        const r = (x, y, w, h, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
        };

        // dir: 0=abajo 1=arriba 2=derecha 3=izquierda  /  frame 0-3 walk frames
        for (let dir = 0; dir < 4; dir++) {
            for (let frame = 0; frame < 4; frame++) {
                const fx = frame * FW;
                const fy = dir * FH;
                const leg = frame === 1 ? 1 : (frame === 3 ? -1 : 0);
                const arm = frame === 1 ? -2 : (frame === 3 ? 2 : 0);

                ctx.clearRect(fx, fy, FW, FH);

                // Sombra bajo los pies
                ctx.fillStyle = 'rgba(0,0,0,0.25)';
                ctx.beginPath();
                ctx.ellipse(fx + 8, fy + 23, 5, 1.5, 0, 0, Math.PI * 2);
                ctx.fill();

                // ── Botas ──
                if (dir === 0 || dir === 1) {
                    r(fx + 3 + leg, fy + 18, 3, 5, C.boots);
                    r(fx + 2 + leg, fy + 21, 5, 2, C.boots);
                    r(fx + 10 - leg, fy + 18, 3, 5, C.boots);
                    r(fx + 9 - leg, fy + 21, 5, 2, C.boots);
                } else {
                    const bx = dir === 2 ? fx + 4 : fx + 9;
                    r(bx, fy + 18, 4, 5, C.boots);
                    r(bx - 1, fy + 21, 6, 2, C.boots);
                    // pierna trasera
                    r(dir === 2 ? bx + 4 : bx - 4, fy + 18 + Math.abs(leg), 3, 4, C.boots);
                }

                // ── Pantalón ──
                r(fx + 3, fy + 13, 10, 6, C.pants);

                // ── Armadura ──
                r(fx + 2, fy + 7, 12, 7, C.armor);
                r(fx + 2, fy + 7,  1, 7, C.armorDk);
                r(fx + 13, fy + 7, 1, 7, C.armorDk);
                r(fx + 2, fy + 7, 12, 1, C.armorLt);
                r(fx + 2, fy + 13, 12, 1, C.gold);  // cinturón dorado

                // detalle pecho (solo frontal)
                if (dir === 0) {
                    r(fx + 7, fy + 9, 2, 3, C.armorLt);
                }

                // ── Brazos ──
                if (dir === 0 || dir === 1) {
                    r(fx + 0, fy + 8 + arm, 2, 6, C.armorDk);
                    r(fx + 14, fy + 8 - arm, 2, 6, C.armorDk);
                } else if (dir === 2) {
                    r(fx + 14, fy + 8 + arm, 2, 6, C.armorDk);
                } else {
                    r(fx + 0, fy + 8 + arm, 2, 6, C.armorDk);
                }

                // ── Cabeza ──
                if (dir === 1) {
                    // Vista trasera: solo pelo y casco
                    r(fx + 4, fy + 1, 8, 6, C.hair);
                    r(fx + 3, fy + 0, 10, 3, C.armorDk);
                    r(fx + 3, fy + 2, 1,  4, C.armorDk);
                    r(fx + 12, fy + 2, 1, 4, C.armorDk);
                } else {
                    // Cara
                    r(fx + 4, fy + 2, 8, 5, C.skin);
                    r(fx + 4, fy + 2, 8, 2, C.hair);
                    // Casco
                    r(fx + 3, fy + 0, 10, 3, C.armor);
                    r(fx + 3, fy + 0, 1,  6, C.armorDk);
                    r(fx + 12, fy + 0, 1, 6, C.armorDk);
                    // Ojos
                    ctx.fillStyle = '#111111';
                    if (dir === 0) {
                        ctx.fillRect(fx + 5, fy + 4, 2, 2);
                        ctx.fillRect(fx + 9, fy + 4, 2, 2);
                    } else if (dir === 2) {
                        ctx.fillRect(fx + 10, fy + 4, 2, 2);
                    } else {
                        ctx.fillRect(fx + 4, fy + 4, 2, 2);
                    }
                }
            }
        }

        canvas.refresh();

        // Registrar los 16 frames individualmente en la textura
        const tex = this.textures.get('hero');
        for (let dir = 0; dir < 4; dir++) {
            for (let f = 0; f < 4; f++) {
                tex.add(dir * 4 + f, 0, f * FW, dir * FH, FW, FH);
            }
        }
    }

    _createAnimations() {
        const frames = (start, end) => {
            const arr = [];
            for (let i = start; i <= end; i++) arr.push({ key: 'hero', frame: i });
            return arr;
        };
        this.anims.create({ key: 'walk-down',  frames: frames(0, 3),  frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-up',    frames: frames(4, 7),  frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-right', frames: frames(8, 11), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-left',  frames: frames(12, 15),frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'idle-down',  frames: [{ key: 'hero', frame: 0 }],  frameRate: 1 });
        this.anims.create({ key: 'idle-up',    frames: [{ key: 'hero', frame: 4 }],  frameRate: 1 });
        this.anims.create({ key: 'idle-right', frames: [{ key: 'hero', frame: 8 }],  frameRate: 1 });
        this.anims.create({ key: 'idle-left',  frames: [{ key: 'hero', frame: 12 }], frameRate: 1 });
    }
}
