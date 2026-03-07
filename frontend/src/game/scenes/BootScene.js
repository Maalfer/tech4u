import { Scene } from 'phaser';

// ─── Paleta del caballero ─────────────────────────────────────────────────────
const K = {
    armorG:  '#788898',  // gris armadura base
    armorL:  '#a0b4c4',  // gris claro (brillo)
    armorD:  '#3c4c5c',  // gris oscuro (sombra)
    gold:    '#c8941c',  // oro
    goldL:   '#e8b830',  // oro brillante
    plumeR:  '#cc2020',  // penacho rojo
    plumeL:  '#ee4040',  // penacho rojo claro
    visor:   '#0e1420',  // ranuras visera (casi negro)
    boot:    '#2a1808',  // bota marrón oscuro
    bootL:   '#3e2810',  // bota más claro
    swordS:  '#c0c8d0',  // espada plata
    swordL:  '#e4eef8',  // espada brillo
    hilt:    '#a06820',  // empuñadura
    hiltL:   '#c88c30',  // empuñadura brillo
    dark:    '#1a2030',  // contorno oscuro
};

export class BootScene extends Scene {
    constructor() { super('BootScene'); }

    preload() {
        this.load.image('marco_pj',   '/src/assets/marco_pj.png');
        this.load.image('aldea_mapa', '/src/assets/aldea_mapa.png');
    }

    create() {
        this._generateHeroTexture();
        this._createAnimations();
        this.scene.start('EscenaCasa');
    }

    // ── Genera spritesheet del caballero 16×24, 4 dirs × 4 frames ─────────────
    _generateHeroTexture() {
        const FW = 16, FH = 24;
        const canvas = this.textures.createCanvas('hero', FW * 4, FH * 4);
        const ctx = canvas.getContext();
        ctx.imageSmoothingEnabled = false;

        // dir: 0=abajo(front) 1=arriba(back) 2=derecha 3=izquierda
        for (let dir = 0; dir < 4; dir++) {
            for (let frame = 0; frame < 4; frame++) {
                const fx = frame * FW;
                const fy = dir * FH;
                const leg = (frame === 1) ? 1 : (frame === 3 ? -1 : 0);
                ctx.clearRect(fx, fy, FW, FH);
                this._drawKnight(ctx, fx, fy, dir, leg);
            }
        }

        canvas.refresh();

        const tex = this.textures.get('hero');
        for (let dir = 0; dir < 4; dir++) {
            for (let f = 0; f < 4; f++) {
                tex.add(dir * 4 + f, 0, f * FW, dir * FH, FW, FH);
            }
        }
    }

    // ── Dibuja un frame del caballero ─────────────────────────────────────────
    _drawKnight(ctx, fx, fy, dir, legStep) {
        const p = (x, y, c) => {
            if (x < 0 || x > 15 || y < 0 || y > 23) return;
            ctx.fillStyle = c; ctx.fillRect(fx + x, fy + y, 1, 1);
        };
        const r = (x, y, w, h, c) => {
            ctx.fillStyle = c; ctx.fillRect(fx + x, fy + y, w, h);
        };

        if (dir === 0) { // ── FRENTE (abajo) ────────────────────────────────
            // Penacho
            r(7, 0, 2, 1, K.plumeL); p(6, 0, K.plumeR);
            r(6, 1, 3, 1, K.plumeL); p(5, 1, K.plumeR); p(9, 1, K.plumeR);
            r(7, 2, 2, 1, K.plumeR);

            // Casco - corona dorada
            r(4, 3, 8, 1, K.goldL);
            p(4, 3, K.gold); p(11, 3, K.gold);

            // Casco - yelmo principal
            r(3, 4, 10, 4, K.armorG);
            r(3, 4, 1,  4, K.armorL); // brillo izq
            r(12,4, 1,  4, K.armorD); // sombra der
            r(3, 4, 10, 1, K.armorL); // brillo top
            r(3, 7, 10, 1, K.gold);   // franja dorada bajo casco

            // Visera (ranuras negras)
            r(5, 5, 6, 1, K.visor);
            r(5, 6, 6, 1, K.visor);
            p(5, 5, K.armorD); p(10, 5, K.armorD);
            p(5, 6, K.armorD); p(10, 6, K.armorD);

            // Guardacarrillos dorados
            r(3, 4, 1, 4, K.armorL);
            p(3, 7, K.gold); p(12, 7, K.gold);

            // Gorguera (cuello)
            r(4, 8, 8, 1, K.goldL);

            // Pauldrones (hombros)
            r(1, 8, 3, 3, K.armorL);
            r(1, 8, 1, 3, K.armorL);
            p(1, 8, K.gold); p(1, 9, K.gold); p(1, 10, K.gold);
            r(12,8, 3, 3, K.armorG);
            r(14,8, 1, 3, K.armorD);
            p(11,8, K.gold); p(11,9, K.gold); p(11,10, K.gold);

            // Pecho (coraza)
            r(3, 9, 10, 5, K.armorG);
            r(3, 9,  1, 5, K.armorL); // brillo izq
            r(12,9,  1, 5, K.armorD); // sombra der
            r(3, 9, 10, 1, K.armorL); // brillo top

            // Cruz dorada en el pecho
            r(7, 10, 2, 3, K.gold);
            r(5, 11, 6, 1, K.gold);
            p(7, 10, K.goldL); p(8, 10, K.goldL);

            // Cinturón dorado
            r(3, 14, 10, 1, K.goldL);
            r(7, 13,  2, 2, K.goldL);   // hebilla
            p(3, 14, K.gold); p(12,14, K.gold);

            // Faldas (tassetes)
            r(3, 15, 10, 2, K.armorG);
            r(3, 15,  1, 2, K.armorL);
            r(12,15,  1, 2, K.armorD);

            // Piernas (grieves)
            const ll = legStep, rl = -legStep;
            r(3, 17+ll, 4, 3, K.armorG);
            r(3, 17+ll, 1, 3, K.armorL);
            r(9, 17+rl, 4, 3, K.armorG);
            r(12,17+rl, 1, 3, K.armorD);

            // Botas
            r(2, 20+ll, 5, 2, K.boot);
            r(2, 20+ll, 1, 2, K.bootL);
            r(9, 20+rl, 5, 2, K.boot);
            r(13,20+rl, 1, 2, K.armorD);

            // Espada (asoma por la derecha)
            r(13, 9, 2, 4, K.swordS);
            p(14, 9, K.swordL); p(14,10, K.swordL);
            p(13,13, K.hilt); p(14,13, K.hiltL);

        } else if (dir === 1) { // ── ESPALDA (arriba) ─────────────────────────
            // Penacho
            r(7, 0, 2, 1, K.plumeL); p(6, 0, K.plumeR);
            r(6, 1, 3, 1, K.plumeL); p(5, 1, K.plumeR); p(9, 1, K.plumeR);
            r(7, 2, 2, 1, K.plumeR);

            // Casco trasero
            r(4, 3, 8, 1, K.goldL);
            r(3, 4, 10, 5, K.armorG);
            r(3, 4, 1,  5, K.armorL);
            r(12,4, 1,  5, K.armorD);
            r(3, 4, 10, 1, K.armorL);
            r(3, 8, 10, 1, K.gold);

            // No hay visera (es la espalda)
            // Guardacarrillos laterales
            r(3, 4, 1, 5, K.armorL);
            r(12,4, 1, 5, K.armorD);

            // Gola
            r(4, 9, 8, 1, K.goldL);

            // Pauldrones (espalda - idénticos a frente)
            r(1, 9, 3, 3, K.armorL);
            r(1, 9, 1, 3, K.armorL);
            p(1, 9, K.gold); p(1,10, K.gold); p(1,11, K.gold);
            r(12,9, 3, 3, K.armorG);
            r(14,9, 1, 3, K.armorD);
            p(11,9, K.gold); p(11,10, K.gold); p(11,11, K.gold);

            // Espalda de la coraza
            r(3, 10, 10, 4, K.armorG);
            r(3, 10,  1, 4, K.armorL);
            r(12,10,  1, 4, K.armorD);
            r(3, 10, 10, 1, K.armorL);

            // Franja dorada espalda
            r(4, 12, 8, 1, K.gold);
            r(3, 14, 10, 1, K.goldL);  // cinturón
            r(3, 15, 10, 2, K.armorG);
            r(3, 15,  1, 2, K.armorL);
            r(12,15,  1, 2, K.armorD);

            // Piernas
            const ll = legStep, rl = -legStep;
            r(3, 17+ll, 4, 3, K.armorG);
            r(3, 17+ll, 1, 3, K.armorL);
            r(9, 17+rl, 4, 3, K.armorG);
            r(12,17+rl, 1, 3, K.armorD);

            // Botas
            r(2, 20+ll, 5, 2, K.boot);
            r(2, 20+ll, 1, 2, K.bootL);
            r(9, 20+rl, 5, 2, K.boot);
            r(13,20+rl, 1, 2, K.armorD);

            // Espada en la espalda (diagonal)
            r(1, 10, 1, 6, K.swordS);
            p(1, 10, K.swordL); p(1,11, K.swordL);
            p(1, 15, K.hilt); p(1,16, K.hiltL);

        } else if (dir === 2) { // ── DERECHA ──────────────────────────────────
            // Penacho (sale por la izquierda en perfil)
            r(4, 0, 3, 1, K.plumeL); p(3, 0, K.plumeR); p(7, 0, K.plumeR);
            r(3, 1, 4, 1, K.plumeL); p(2, 1, K.plumeR); p(7, 1, K.plumeR);
            r(4, 2, 2, 1, K.plumeR);

            // Casco perfil derecho
            r(4, 3, 7, 1, K.goldL);
            r(3, 4, 8, 5, K.armorG);
            r(3, 4, 1, 5, K.armorL);
            r(10,4, 1, 5, K.armorD);
            r(3, 4, 8, 1, K.armorL);
            r(3, 8, 8, 1, K.gold);

            // Visera de perfil (3 ranuras)
            p(8,5, K.visor); p(9,5, K.visor);
            p(8,6, K.visor); p(9,6, K.visor);
            p(7,5, K.armorD); p(7,6, K.armorD);

            // Guardacarrillo frontal
            r(10,4, 1, 5, K.armorD);

            // Pauldron derecho visible
            r(11,8, 3, 3, K.armorL);
            r(13,8, 1, 3, K.armorD);
            p(11,8, K.gold); p(11,9, K.gold); p(11,10, K.gold);

            // Gola
            r(4, 8, 8, 1, K.goldL);

            // Cuerpo lateral
            r(3, 9, 8, 5, K.armorG);
            r(3, 9, 1, 5, K.armorL);
            r(10,9, 1, 5, K.armorD);
            r(3, 9, 8, 1, K.armorL);

            // Detalle pecho lado
            r(7, 10, 2, 3, K.gold);
            r(3, 14, 8, 1, K.goldL);  // cinturón

            // Faldas
            r(3, 15, 8, 2, K.armorG);
            r(3, 15, 1, 2, K.armorL);
            r(10,15, 1, 2, K.armorD);

            // Pierna delantera y trasera (perfil)
            const fwd = legStep, bwd = -legStep;
            r(4, 17+fwd, 4, 3, K.armorL); // pierna delantera (más brillante)
            r(7, 17+fwd, 1, 3, K.armorD);
            r(2, 17+bwd, 3, 3, K.armorG); // pierna trasera (más oscura)
            r(2, 17+bwd, 1, 3, K.armorD);

            // Botas perfil
            r(3, 20+fwd, 5, 2, K.boot);
            r(3, 20+fwd, 1, 2, K.bootL);
            r(7, 20+fwd, 2, 1, K.bootL); // punta bota delantera
            r(1, 20+bwd, 4, 2, K.boot);
            r(4, 20+bwd, 1, 2, K.armorD);

            // ESPADA extendida hacia la derecha ──────────
            // Hoja
            r(12, 9,  4, 1, K.swordL);  // punta
            r(12, 10, 4, 1, K.swordS);
            r(12, 11, 4, 1, K.swordS);
            r(11, 12, 5, 1, K.swordS);
            r(11, 13, 5, 1, K.swordS);
            // Guardia
            r(11, 14, 1, 3, K.hiltL);
            r(10, 15, 3, 1, K.hiltL);
            // Empuñadura
            r(11, 16, 1, 3, K.hilt);
            r(11, 19, 1, 1, K.hiltL); // pomo

        } else { // ── IZQUIERDA (espejo de derecha) ──────────────────────────
            // Penacho
            r(9,  0, 3, 1, K.plumeL); p(12,0, K.plumeR); p(8,0, K.plumeR);
            r(9,  1, 4, 1, K.plumeL); p(13,1, K.plumeR); p(8,1, K.plumeR);
            r(10, 2, 2, 1, K.plumeR);

            // Casco perfil izquierdo
            r(5, 3, 7, 1, K.goldL);
            r(5, 4, 8, 5, K.armorG);
            r(12,4, 1, 5, K.armorL);
            r(5, 4, 1, 5, K.armorD);
            r(5, 4, 8, 1, K.armorL);
            r(5, 8, 8, 1, K.gold);

            // Visera izquierda
            p(4,5, K.visor); p(5,5, K.visor);
            p(4,6, K.visor); p(5,6, K.visor);
            p(6,5, K.armorD); p(6,6, K.armorD);

            // Pauldron izquierdo visible
            r(2, 8, 3, 3, K.armorL);
            r(2, 8, 1, 3, K.armorD);
            p(4, 8, K.gold); p(4, 9, K.gold); p(4,10, K.gold);

            // Gola
            r(4, 8, 8, 1, K.goldL);

            // Cuerpo lateral izq
            r(5, 9, 8, 5, K.armorG);
            r(12,9, 1, 5, K.armorL);
            r(5, 9, 1, 5, K.armorD);
            r(5, 9, 8, 1, K.armorL);

            // Cinturón
            r(5, 14, 8, 1, K.goldL);
            r(7, 10, 2, 3, K.gold);

            // Faldas
            r(5, 15, 8, 2, K.armorG);
            r(12,15, 1, 2, K.armorL);
            r(5, 15, 1, 2, K.armorD);

            // Piernas
            const fwd = legStep, bwd = -legStep;
            r(8, 17+fwd, 4, 3, K.armorL);
            r(8, 17+fwd, 1, 3, K.armorD);
            r(11,17+bwd, 3, 3, K.armorG);
            r(13,17+bwd, 1, 3, K.armorD);

            // Botas izq
            r(8, 20+fwd, 5, 2, K.boot);
            r(12,20+fwd, 1, 2, K.bootL);
            r(7, 20+fwd, 2, 1, K.bootL);
            r(11,20+bwd, 4, 2, K.boot);
            r(11,20+bwd, 1, 2, K.armorD);

            // ESPADA extendida hacia la izquierda ─────────
            r(0, 9,  4, 1, K.swordL);
            r(0, 10, 4, 1, K.swordS);
            r(0, 11, 4, 1, K.swordS);
            r(0, 12, 5, 1, K.swordS);
            r(0, 13, 5, 1, K.swordS);
            r(4, 14, 1, 3, K.hiltL);
            r(3, 15, 3, 1, K.hiltL);
            r(4, 16, 1, 3, K.hilt);
            r(4, 19, 1, 1, K.hiltL);
        }
    }

    _createAnimations() {
        const frames = (s, e) => {
            const a = [];
            for (let i = s; i <= e; i++) a.push({ key: 'hero', frame: i });
            return a;
        };
        this.anims.create({ key: 'walk-down',  frames: frames(0,  3),  frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-up',    frames: frames(4,  7),  frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-right', frames: frames(8,  11), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-left',  frames: frames(12, 15), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'idle-down',  frames: [{ key: 'hero', frame: 0  }], frameRate: 1 });
        this.anims.create({ key: 'idle-up',    frames: [{ key: 'hero', frame: 4  }], frameRate: 1 });
        this.anims.create({ key: 'idle-right', frames: [{ key: 'hero', frame: 8  }], frameRate: 1 });
        this.anims.create({ key: 'idle-left',  frames: [{ key: 'hero', frame: 12 }], frameRate: 1 });
    }
}
