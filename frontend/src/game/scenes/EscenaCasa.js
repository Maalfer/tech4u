import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

// ─── Dimensiones del mundo ────────────────────────────────────────────────────
const RW     = 620;
const RH     = 465;
const WALL_H = 72;      // altura de la pared trasera visible
const DOOR_W = 80;
const DOOR_X = (RW - DOOR_W) / 2;

// ─── Escala de muebles ─────────────────────────────────────────────────────────
// Sprites 640×640px → escalamos para que el contenido visible sea ~80-100 world units
const S = {
    BED:      0.26,   // cama: ~80px visible
    SHELF:    0.24,   // estantería: ~75px
    DESK:     0.26,   // escritorio: ~80px
    TABLE:    0.20,   // mesa: ~65px
    PLANT:    0.15,   // planta: ~50px
    ARMOR:    0.24,   // armadura: ~75px
};

// ─── Objetos interactivos ─────────────────────────────────────────────────────
const OBJS = [
    {
        id: 'armor',    label: 'Armería',
        x: 88,  y: 90,  w: 60, h: 55,
        hint:   '[E] Ver personaje',
        route:  '/personaje',
        dialog: 'Tu armadura de conocimiento.\nCada certificación añade una pieza nueva.',
    },
    {
        id: 'computer', label: 'Terminal',
        x: 310, y: 80,  w: 70, h: 60,
        hint:   '[E] Acceder al sistema',
        route:  '/tests',
        dialog: '> SISTEMA ONLINE...\n> Acceso al Test Center activado.',
    },
    {
        id: 'shelf',    label: 'Estantería',
        x: 528, y: 88,  w: 72, h: 60,
        hint:   '[E] Ver recursos',
        route:  '/recursos',
        dialog: 'Manuales técnicos, guías y certificaciones.',
    },
    {
        id: 'book',     label: 'Grimorio',
        x: 136, y: 235, w: 54, h: 36,
        hint:   '[E] Leer teoría',
        route:  '/teoria',
        dialog: 'Un tomo antiguo con esquemas de redes y fórmulas...',
    },
    {
        id: 'bed',      label: 'Cama',
        x: 490, y: 316, w: 96, h: 60,
        hint:   '[E] Descansar',
        route:  null,
        dialog: 'Descansando recuperas fuerzas para los exámenes.\n\nZzz... +50 EXP de sueño.',
    },
];

// ─── Escena principal ──────────────────────────────────────────────────────────
export class EscenaCasa extends Scene {
    constructor() {
        super('EscenaCasa');
        this.dialogOpen = false;
        this.lastDir    = 'down';
        this._walkTick  = 0;
    }

    create() {
        this.cameras.main.fadeIn(800);
        this.physics.world.setBounds(0, 0, RW, RH);
        this.cameras.main.setBounds(0, 0, RW, RH);
        this.cameras.main.setZoom(2);

        // ── 1. ENTORNO (suelo + paredes) ──────────────────────────────────────
        this._buildRoom();

        // ── 2. ALFOMBRA ───────────────────────────────────────────────────────
        this._drawRug();

        // ── 3. MUEBLES CON SPRITES REALES ─────────────────────────────────────
        this._placeFurniture();

        // ── 4. ILUMINACIÓN AMBIENTAL ──────────────────────────────────────────
        this._addLighting();

        // ── 5. FÍSICA (paredes invisibles) ────────────────────────────────────
        this._setupWalls();

        // ── 6. PERSONAJE ──────────────────────────────────────────────────────
        this._spawnPlayer();

        // ── 7. ZONAS DE INTERACCIÓN ────────────────────────────────────────────
        this._setupObjectZones();

        // ── 8. HUD ─────────────────────────────────────────────────────────────
        this._setupHUD();

        // ── 9. CONTROLES ──────────────────────────────────────────────────────
        this.cursors  = this.input.keyboard.createCursorKeys();
        this.wasd     = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
        this.keyE     = this.input.keyboard.addKey('E');

        EventBus.on('CLOSE_MODAL', () => { this.dialogOpen = false; });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ENTORNO: suelo y paredes con texturas reales
    // ══════════════════════════════════════════════════════════════════════════

    _buildRoom() {
        // ── Pared trasera (textura piedra, tileada) ───────────────────────────
        const TS = 0.09; // tile scale: 640 * 0.09 ≈ 57px por tile → aspecto de piedra/madera
        const wall = this.add.tileSprite(RW / 2, WALL_H / 2, RW, WALL_H, 'rpg_wall');
        wall.tileScaleX = TS; wall.tileScaleY = TS;
        wall.setDepth(0);

        // Paredes laterales (mismo tile, franja vertical)
        const wallL = this.add.tileSprite(8, RH / 2, 16, RH, 'rpg_wall');
        wallL.tileScaleX = TS; wallL.tileScaleY = TS;
        wallL.setDepth(0);
        const wallR = this.add.tileSprite(RW - 8, RH / 2, 16, RH, 'rpg_wall');
        wallR.tileScaleX = TS; wallR.tileScaleY = TS;
        wallR.setDepth(0);

        // ── Suelo de madera (tileado) ─────────────────────────────────────────
        const floorH = RH - WALL_H;
        const floor  = this.add.tileSprite(RW / 2, WALL_H + floorH / 2, RW - 32, floorH, 'rpg_floor');
        floor.tileScaleX = TS; floor.tileScaleY = TS;
        floor.setDepth(1);

        // ── Rodapié: línea que separa pared del suelo ─────────────────────────
        const skirting = this.add.graphics().setDepth(2);
        skirting.fillStyle(0x3A1A08);
        skirting.fillRect(16, WALL_H - 1, RW - 32, 4);
        skirting.fillStyle(0x6B3A1F);
        skirting.fillRect(16, WALL_H - 2, RW - 32, 2);

        // ── Pared frontal con puerta ──────────────────────────────────────────
        const frontWall = this.add.graphics().setDepth(1);
        frontWall.fillStyle(0x2A1808);
        frontWall.fillRect(0,             RH - 16, DOOR_X,                  16);
        frontWall.fillRect(DOOR_X + DOOR_W, RH - 16, RW - DOOR_X - DOOR_W, 16);
        // Hueco oscuro de puerta
        frontWall.fillStyle(0x05080F);
        frontWall.fillRect(DOOR_X, RH - 16, DOOR_W, 16);
        // Marco de puerta
        frontWall.fillStyle(0x6B3A1F);
        frontWall.fillRect(DOOR_X - 3,        RH - 22, 3,           22);
        frontWall.fillRect(DOOR_X + DOOR_W,   RH - 22, 3,           22);
        frontWall.fillRect(DOOR_X - 3,        RH - 24, DOOR_W + 6,  3);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ALFOMBRA
    // ══════════════════════════════════════════════════════════════════════════

    _drawRug() {
        const rx = RW / 2 - 125, ry = 170, rw = 250, rh = 125;
        const g  = this.add.graphics().setDepth(3);

        // Base
        g.fillStyle(0x7A1E48);
        g.fillRect(rx, ry, rw, rh);

        // Borde exterior dorado
        g.lineStyle(4, 0xD4A820);
        g.strokeRect(rx + 3, ry + 3, rw - 6, rh - 6);

        // Borde interior
        g.lineStyle(1, 0xB88010);
        g.strokeRect(rx + 10, ry + 10, rw - 20, rh - 20);

        // Patrón central (diamante)
        const cx = rx + rw / 2, cy = ry + rh / 2;
        g.fillStyle(0x9A2858);
        g.fillTriangle(cx, cy - 28, cx - 20, cy, cx, cy + 28);
        g.fillTriangle(cx, cy - 28, cx + 20, cy, cx, cy + 28);

        // Esquinas decorativas
        g.fillStyle(0xD4A820);
        for (const [bx, by] of [
            [rx + 4, ry + 4], [rx + rw - 12, ry + 4],
            [rx + 4, ry + rh - 12], [rx + rw - 12, ry + rh - 12],
        ]) {
            g.fillRect(bx, by, 8, 8);
            g.fillStyle(0xF0C840);
            g.fillRect(bx + 2, by + 2, 4, 4);
            g.fillStyle(0xD4A820);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // MUEBLES: sprites reales con Y-sorting
    // ══════════════════════════════════════════════════════════════════════════

    _placeFurniture() {
        // Depth = OBJS.y → Y-sort correcto (objetos "más arriba" en pantalla = más al fondo)

        // ── Armadura (esquina trasera izquierda) ──────────────────────────────
        this._addSprite('rpg_armor', 88, 90, S.ARMOR, OBJS[0].y);

        // ── Escritorio con PC (pared trasera centro) ──────────────────────────
        this._addSprite('rpg_desk', 310, 80, S.DESK, OBJS[1].y);

        // ── Estantería (esquina trasera derecha) ──────────────────────────────
        this._addSprite('rpg_bookshelf', 528, 88, S.SHELF, OBJS[2].y);

        // ── Mesa redonda con Grimorio (mitad izquierda) ───────────────────────
        this._addSprite('rpg_table', 136, 235, S.TABLE, OBJS[3].y);

        // ── Cama (mitad derecha) ───────────────────────────────────────────────
        this._addSprite('rpg_bed', 490, 316, S.BED, OBJS[4].y);

        // ── Plantas decorativas ────────────────────────────────────────────────
        this._addSprite('rpg_plant', 38,  155, S.PLANT, 155);
        this._addSprite('rpg_plant', 582, 270, S.PLANT, 270);
        this._addSprite('rpg_plant', 40,  345, S.PLANT, 345);
    }

    _addSprite(key, x, y, scale, depth) {
        // Sombra elíptica debajo del sprite
        const shadow = this.add.ellipse(x, y + 20, 64 * scale * 6, 18 * scale * 6, 0x000000, 0.28);
        shadow.setDepth(depth - 1);

        const spr = this.add.image(x, y, key);
        spr.setScale(scale);
        spr.setDepth(depth);
        return spr;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ILUMINACIÓN AMBIENTAL
    // ══════════════════════════════════════════════════════════════════════════

    _addLighting() {
        // Luz central cálida (vela/lámpara)
        const lCentral = this.add.graphics().setDepth(800);
        lCentral.setBlendMode(Phaser.BlendModes.ADD);
        lCentral.fillStyle(0xFFCC44, 0.06);
        lCentral.fillCircle(RW / 2, RH / 2 - 30, 220);

        // Brillo del monitor (verde)
        const lScreen = this.add.graphics().setDepth(800);
        lScreen.setBlendMode(Phaser.BlendModes.ADD);
        lScreen.fillStyle(0x00FF88, 0.05);
        lScreen.fillCircle(310, 90, 70);

        // Calidez vela junto a la mesa
        const lCandle = this.add.graphics().setDepth(800);
        lCandle.setBlendMode(Phaser.BlendModes.ADD);
        lCandle.fillStyle(0xFF8822, 0.06);
        lCandle.fillCircle(136, 200, 80);

        // Viñeta (esquinas oscuras)
        const vig = this.add.graphics().setDepth(801);
        vig.fillStyle(0x000000, 0.22);
        vig.fillRect(0,       0, 85, RH);
        vig.fillRect(RW - 85, 0, 85, RH);
        vig.fillRect(0, 0,       RW, 40);
        vig.fillRect(0, RH - 40, RW, 40);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // FÍSICA
    // ══════════════════════════════════════════════════════════════════════════

    _setupWalls() {
        this.walls = this.physics.add.staticGroup();
        const W = (x, y, w, h) => {
            const o = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0);
            this.physics.add.existing(o, true);
            this.walls.add(o);
        };

        // Límites exteriores
        W(0,       0,       16,   RH);
        W(RW - 16, 0,       16,   RH);
        W(0,       0,       RW,   16);

        // Pared inferior con hueco de puerta
        W(0,              RH - 16, DOOR_X,                 16);
        W(DOOR_X + DOOR_W, RH - 16, RW - DOOR_X - DOOR_W, 16);

        // Colisiones de muebles (ajustadas al contenido visual del sprite)
        W(55,  40,  70, 80);   // armadura
        W(268, 32,  84, 78);   // escritorio
        W(490, 36,  80, 80);   // estantería
        W(106, 196, 62, 52);   // mesa con grimorio
        W(438, 268, 108, 72);  // cama
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PLAYER
    // ══════════════════════════════════════════════════════════════════════════

    _spawnPlayer() {
        // Hero sheet: 100x130 px por frame, personaje visible en ~70% del frame
        this.jugador = this.physics.add.sprite(RW / 2, RH - 80, 'hero', 0);
        this.jugador.setScale(0.33);

        // Hitbox en los pies (parte baja del frame)
        this.jugador.body.setSize(50, 26);
        this.jugador.body.setOffset(25, 100);

        this.jugador.setCollideWorldBounds(true);
        this.jugador.setDepth(300);

        this.physics.add.collider(this.jugador, this.walls);
        this.cameras.main.startFollow(this.jugador, true, 0.08, 0.08);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ZONAS DE INTERACCIÓN
    // ══════════════════════════════════════════════════════════════════════════

    _setupObjectZones() {
        this.objectZones = OBJS.map(obj => {
            const z = this.add.zone(obj.x, obj.y, obj.w + 28, obj.h + 28);
            this.physics.world.enable(z);
            z.body.setAllowGravity(false);
            z.body.moves = false;
            z.objData = obj;
            return z;
        });

        // Zona de salida (puerta)
        const exit = this.add.zone(RW / 2, RH - 8, DOOR_W - 10, 20);
        this.physics.world.enable(exit);
        exit.body.setAllowGravity(false);
        exit.body.moves = false;
        exit.objData = {
            id:     'exit',
            label:  'Salida',
            hint:   '[E] Volver al campus',
            route:  '/dashboard',
            dialog: null,
        };
        this.objectZones.push(exit);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HUD
    // ══════════════════════════════════════════════════════════════════════════

    _setupHUD() {
        this.hintText = this.add.text(RW / 2, RH - 42, '', {
            fontFamily:      '"Courier New", monospace',
            fontSize:        '10px',
            color:           '#C6FF33',
            backgroundColor: 'rgba(0,0,0,0.68)',
            padding: { x: 10, y: 5 },
            stroke:          '#000000',
            strokeThickness: 2,
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(2001)
            .setVisible(false);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // UPDATE
    // ══════════════════════════════════════════════════════════════════════════

    update(time) {
        if (this.dialogOpen) {
            this.jugador.setVelocity(0, 0);
            this.jugador.anims.stop();
            return;
        }

        const speed  = 175;
        let   moving = false;
        this.jugador.setVelocity(0);

        // ── Movimiento horizontal ─────────────────────────────────────────────
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.jugador.setVelocityX(-speed);
            this.jugador.anims.play('walk-left', true);
            this.lastDir = 'left';
            moving = true;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.jugador.setVelocityX(speed);
            this.jugador.anims.play('walk-right', true);
            this.lastDir = 'right';
            moving = true;
        }

        // ── Movimiento vertical ───────────────────────────────────────────────
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.jugador.setVelocityY(-speed);
            if (!moving) this.jugador.anims.play('walk-up', true);
            this.lastDir = 'up';
            moving = true;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.jugador.setVelocityY(speed);
            if (!moving) this.jugador.anims.play('walk-down', true);
            this.lastDir = 'down';
            moving = true;
        }

        if (!moving) {
            this.jugador.anims.play('idle-' + this.lastDir, true);
        }

        // ── Y-sorting dinámico ─────────────────────────────────────────────────
        // Profundidad = coordenada Y de los pies del personaje
        this.jugador.setDepth(this.jugador.y + 12);

        // ── Walk bob suave (simula pasos) ──────────────────────────────────────
        if (moving) {
            const bob = Math.sin(time * 0.012) * 0.015;
            this.jugador.setAngle(bob * (180 / Math.PI));
        } else {
            this.jugador.setAngle(0);
        }

        // ── Interacciones ──────────────────────────────────────────────────────
        let inZone = false;
        this.objectZones.forEach(zone => {
            if (this.physics.overlap(this.jugador, zone)) {
                inZone = true;
                this._showHint(zone.objData.hint);
                if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                    this._interact(zone.objData);
                }
            }
        });

        if (!inZone) {
            this.hintText.setVisible(false);
        }
    }

    // ── Mostrar hint ─────────────────────────────────────────────────────────
    _showHint(text) {
        this.hintText.setText(text).setVisible(true);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // INTERACCIÓN
    // ══════════════════════════════════════════════════════════════════════════

    _interact(obj) {
        if (this.dialogOpen) return;
        this.dialogOpen = true;
        this.jugador.setVelocity(0);
        this.jugador.anims.stop();
        this.jugador.setAngle(0);

        if (obj.route) {
            // Modal de navegación con texto de contexto
            EventBus.emit('NAVIGATE', obj.route, obj.dialog);
        } else {
            // Solo diálogo (cama, sin ruta)
            EventBus.emit('SHOW_DIALOG', {
                title: obj.label,
                text:  obj.dialog,
            });
        }
    }
}
