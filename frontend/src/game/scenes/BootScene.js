import { Scene } from 'phaser';

// ─── BootScene: carga todos los assets reales y arranca EscenaCasa ────────────
export class BootScene extends Scene {
    constructor() { super('BootScene'); }

    preload() {
        // ── Texturas de suelo y pared (tileable) ──────────────────────────────
        this.load.image('rpg_floor', '/assets/game/rpg_floor.png');
        this.load.image('rpg_wall',  '/assets/game/rpg_wall.png');

        // ── Muebles pixel art (fondo eliminado) ───────────────────────────────
        this.load.image('rpg_bed',      '/assets/game/rpg_bed.png');
        this.load.image('rpg_bookshelf','/assets/game/rpg_bookshelf.png');
        this.load.image('rpg_desk',     '/assets/game/rpg_desk.png');
        this.load.image('rpg_table',    '/assets/game/rpg_table.png');
        this.load.image('rpg_plant',    '/assets/game/rpg_plant.png');
        this.load.image('rpg_armor',    '/assets/game/rpg_armor_stand.png');

        // ── Personaje (spritesheet 4 frames: down|left|right|up) ─────────────
        this.load.spritesheet('hero', '/assets/game/hero_sheet.png', {
            frameWidth:  100,
            frameHeight: 130,
        });

        // ── Assets previos de la academia ─────────────────────────────────────
        this.load.image('marco_pj',   '/src/assets/marco_pj.png');
        this.load.image('aldea_mapa', '/src/assets/aldea_mapa.png');
    }

    create() {
        this._createHeroAnimations();
        this.scene.start('EscenaCasa');
    }

    // ── Animaciones del personaje ──────────────────────────────────────────────
    // Hero sheet layout: frame 0=down, 1=left, 2=right, 3=up
    _createHeroAnimations() {
        // Walk animations (2-frame cycle usando el mismo frame con leve offset de cámara)
        // Solo tenemos 1 frame por dirección → usamos el mismo frame con repeat
        const DIRS = [
            { key: 'down',  frame: 0 },
            { key: 'left',  frame: 1 },
            { key: 'right', frame: 2 },
            { key: 'up',    frame: 3 },
        ];

        for (const { key, frame } of DIRS) {
            this.anims.create({
                key:       `walk-${key}`,
                frames:    [{ key: 'hero', frame }],
                frameRate: 8,
                repeat:    -1,
            });
            this.anims.create({
                key:       `idle-${key}`,
                frames:    [{ key: 'hero', frame }],
                frameRate: 1,
                repeat:    -1,
            });
        }
    }
}
