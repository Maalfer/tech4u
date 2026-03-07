import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

// ─── Paleta cálida estilo cozy RPG ────────────────────────────────────────────
const C = {
    // Suelo madera cálido
    floorA:    0xB07840,  // tablón base ámbar
    floorB:    0xA06C38,  // tablón alternativo
    floorC:    0xC08850,  // tablón claro (reflejo luz)
    floorEdge: 0x704828,  // borde entre tablones
    floorSh:   0x5A3820,  // sombra bajo objetos

    // Pared trasera (zona superior)
    wallBase:  0xC8A070,  // piedra arenosa cálida
    wallBrick: 0xB89060,  // ladrillo
    wallDark:  0x8A6040,  // junta de ladrillo
    wallLight: 0xDCC090,  // ladrillo iluminado

    // Marco de la habitación
    frameWood:  0x6B3A1F,
    frameLight: 0x8B5230,
    frameDark:  0x3A1A08,

    // Armario teal (como la imagen ref)
    teal:      0x3A8070,
    tealL:     0x58A090,
    tealD:     0x1E5040,
    tealTop:   0x4A9080,

    // Madera muebles
    wood:      0x8B5230,
    woodL:     0xAA6A40,
    woodD:     0x4A2810,
    woodTop:   0x9A6040,

    // Terminal/ordenador
    deskDark:  0x1A1A2E,
    screenGlow: 0x00DD88,
    neon:      0xC6FF33,
    screenFace: 0x080818,

    // Libros
    bookR:     0xA82828,
    bookB:     0x1858A0,
    bookG:     0x208040,
    bookY:     0xC09020,
    bookPage:  0xF0E0C0,

    // Cama
    bedFrame:  0x7A4A28,
    bedFrameD: 0x4A2810,
    bedSheet:  0xE8D8A8,
    bedSheetD: 0xC8B888,
    pillow:    0xF4ECD8,
    pillowD:   0xD8CCBC,

    // Armadura
    armorG:    0x8090A0,
    armorL:    0xA0B8CC,
    armorD:    0x485870,
    goldTrim:  0xD4A820,
    goldL:     0xF0C840,

    // Plantas
    leaf1:     0x40A040,
    leaf2:     0x308030,
    leaf3:     0x50C050,
    pot:       0xA05030,
    potD:      0x703010,

    // Alfombra
    rugBase:   0x8B2252,
    rugBorder: 0xD4A820,
    rugPat:    0xA83060,

    // Luz ambiente cálida
    warmGlow:  0xFFCC44,
    warmDim:   0xFF9920,

    // Sombra drop-shadow objetos
    dropSh:    0x000000,
};

// ─── Room layout ──────────────────────────────────────────────────────────────
const RW = 620, RH = 465;
const WALL_H   = 36;   // altura pared trasera visible
const FLOOR_Y  = WALL_H;
const FLOOR_Y2 = RH - 32;
const DOOR_W   = 80;
const DOOR_X   = (RW - DOOR_W) / 2;

// ─── Objetos interactivos ─────────────────────────────────────────────────────
const OBJS = [
    { id: 'armor',    label: 'Armería',  x: 88,  y: 90,  w: 60, h: 55, hint: '[E] Ver personaje',  route: '/personaje', dialog: 'Tu armadura de conocimiento.\nCada certificación añade una pieza nueva.' },
    { id: 'computer', label: 'Terminal', x: 310, y: 80,  w: 70, h: 60, hint: '[E] Acceder al sistema', route: '/tests',     dialog: '> SISTEMA ONLINE...\n> Acceso a Test Center activado.' },
    { id: 'shelf',    label: 'Estantería', x: 528, y: 88, w: 72, h: 60, hint: '[E] Ver recursos', route: '/recursos',  dialog: 'Manuales técnicos, guías y certificaciones.' },
    { id: 'book',     label: 'Grimorio', x: 136, y: 235, w: 54, h: 36, hint: '[E] Leer teoría',  route: '/teoria',    dialog: 'Un tomo antiguo con esquemas de redes y fórmulas...' },
    { id: 'bed',      label: 'Cama',     x: 490, y: 316, w: 96, h: 60, hint: '[E] Descansar',    route: null,         dialog: 'Descansando recuperas fuerzas para los exámenes.\n\nZzz... +50 EXP de sueño.' },
];

// ─── Escena ───────────────────────────────────────────────────────────────────
export class EscenaCasa extends Scene {
    constructor() {
        super('EscenaCasa');
        this.dialogOpen  = false;
        this.lastDir     = 'down';
        this.currentZone = null;
    }

    create() {
        this.cameras.main.fadeIn(700);
        this.physics.world.setBounds(0, 0, RW, RH);
        this.cameras.main.setBounds(0, 0, RW, RH);
        this.cameras.main.setZoom(2);

        // ── Capas de dibujo ───────────────────────────────────────────────────
        this._drawFloor();
        this._drawWallBack();
        this._drawRoomFrame();
        this._drawRug();

        // ── Muebles con profundidad ───────────────────────────────────────────
        this._drawArmorStand(88, 52);
        this._drawComputerDesk(310, 52);
        this._drawBookshelf(528, 48);
        this._drawTableWithBook(136, 198);
        this._drawBed(490, 270);

        // ── Plantas decorativas ───────────────────────────────────────────────
        this._drawPlant(38, 130, 'small');
        this._drawPlant(582, 250, 'medium');
        this._drawPlant(38, 320, 'medium');

        // ── Luz ambiente cálida ───────────────────────────────────────────────
        this._drawLighting();

        // ── Física: paredes y colisiones ──────────────────────────────────────
        this._setupWalls();

        // ── Jugador ───────────────────────────────────────────────────────────
        this.jugador = this.physics.add.sprite(RW / 2, RH - 90, 'hero', 0);
        this.jugador.setScale(2.2);
        this.jugador.body.setSize(10, 8);
        this.jugador.body.setOffset(3, 16);
        this.jugador.setCollideWorldBounds(true);
        this.jugador.setDepth(10);
        this.physics.add.collider(this.jugador, this.walls);
        this.cameras.main.startFollow(this.jugador, true, 0.08, 0.08);

        // ── Zonas de interacción ──────────────────────────────────────────────
        this._setupObjectZones();

        // ── HUD ───────────────────────────────────────────────────────────────
        this._setupHUD();

        // ── Controles ─────────────────────────────────────────────────────────
        this.cursors  = this.input.keyboard.createCursorKeys();
        this.wasd     = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
        this.keyE     = this.input.keyboard.addKey('E');
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        EventBus.on('CLOSE_MODAL', () => { this.dialogOpen = false; });
    }

    // ─── SUELO ────────────────────────────────────────────────────────────────
    _drawFloor() {
        const g = this.add.graphics();
        const plankH = 10;
        const colors = [C.floorA, C.floorB, C.floorA, C.floorC, C.floorB];

        for (let y = FLOOR_Y; y < FLOOR_Y2; y += plankH) {
            const rowIdx = Math.floor((y - FLOOR_Y) / plankH);
            const base = colors[rowIdx % colors.length];

            // Tablón base
            g.fillStyle(base);
            g.fillRect(0, y, RW, plankH - 1);

            // Veta del tablón (efecto madera)
            g.fillStyle(C.floorEdge, 0.4);
            g.fillRect(0, y + plankH - 1, RW, 1);

            // Variaciones horizontales (juntas de tablón)
            const offset = (rowIdx % 3) * 80 + 40;
            for (let x = offset; x < RW; x += 120) {
                g.fillStyle(C.floorEdge, 0.35);
                g.fillRect(x, y, 1, plankH - 1);
            }

            // Brillo cálido en el centro del tablón
            g.fillStyle(C.floorC, 0.15);
            g.fillRect(0, y + 3, RW, 3);
        }

        // Suelo adicional bajo pared trasera
        g.fillStyle(C.floorSh);
        g.fillRect(0, FLOOR_Y, RW, 6);
    }

    // ─── PARED TRASERA ────────────────────────────────────────────────────────
    _drawWallBack() {
        const g = this.add.graphics();

        // Fondo pared
        g.fillStyle(C.wallBase);
        g.fillRect(0, 0, RW, WALL_H + 10);

        // Ladrillos en la pared
        let rowOdd = false;
        for (let wy = 0; wy < WALL_H; wy += 12) {
            const off = rowOdd ? 0 : 30;
            for (let wx = -off; wx < RW + 30; wx += 60) {
                const bw = Math.min(58, RW - wx);
                if (bw > 4) {
                    g.fillStyle(C.wallBrick);
                    g.fillRect(wx, wy, bw, 11);
                    g.fillStyle(C.wallLight);
                    g.fillRect(wx, wy, bw, 1);  // brillo top
                    g.fillRect(wx, wy, 1, 11);  // brillo izq
                }
            }
            g.fillStyle(C.wallDark);
            g.fillRect(0, wy + 11, RW, 1); // junta horizontal
            rowOdd = !rowOdd;
        }

        // Transición pared→suelo (sombra gradiente)
        for (let i = 0; i < 8; i++) {
            g.fillStyle(0x000000, 0.08 * (8 - i));
            g.fillRect(0, WALL_H + i, RW, 1);
        }
    }

    // ─── MARCO DE LA HABITACIÓN ───────────────────────────────────────────────
    _drawRoomFrame() {
        const g = this.add.graphics();
        const T = 16; // grosor del marco

        // Franjas laterales (madera de marco)
        const drawWoodPanel = (x, y, w, h) => {
            g.fillStyle(C.frameWood);
            g.fillRect(x, y, w, h);
            g.fillStyle(C.frameLight);
            g.fillRect(x, y, w, 2);
            g.fillStyle(C.frameDark);
            g.fillRect(x, y + h - 2, w, 2);
            // Veta
            for (let vy = y + 4; vy < y + h - 4; vy += 8) {
                g.fillStyle(C.frameDark, 0.2);
                g.fillRect(x, vy, w, 1);
            }
        };

        drawWoodPanel(0,    0,    T, RH);        // izquierda
        drawWoodPanel(RW-T, 0,    T, RH);        // derecha
        drawWoodPanel(0,    0,    RW, T);         // arriba
        drawWoodPanel(0,    RH-T, RW, T);         // abajo

        // Puerta (apertura en la pared inferior)
        g.fillStyle(C.floorA);
        g.fillRect(DOOR_X, RH - T, DOOR_W, T);

        // Marco de la puerta dorado
        g.lineStyle(2, C.goldTrim);
        g.strokeRect(DOOR_X - 1, RH - T - 2, DOOR_W + 2, T + 4);

        // Arco de la puerta
        g.fillStyle(0x1a0e04);
        g.fillRect(DOOR_X, RH - T - 2, DOOR_W, T + 2);

        // Esquinas decorativas doradas
        const corner = (cx, cy) => {
            g.fillStyle(C.goldTrim);
            g.fillRect(cx - 5, cy - 5, 10, 10);
            g.fillStyle(C.frameWood);
            g.fillRect(cx - 3, cy - 3, 6, 6);
            g.fillStyle(C.goldL);
            g.fillRect(cx - 1, cy - 1, 2, 2);
        };
        corner(T, T); corner(RW - T, T);
        corner(T, RH - T); corner(RW - T, RH - T);
    }

    // ─── ALFOMBRA CENTRAL ─────────────────────────────────────────────────────
    _drawRug() {
        const g = this.add.graphics();
        const rx = RW/2 - 110, ry = 170, rw = 220, rh = 110;

        g.fillStyle(C.rugBase);
        g.fillRect(rx, ry, rw, rh);

        // Borde dorado
        g.lineStyle(3, C.rugBorder);
        g.strokeRect(rx + 2, ry + 2, rw - 4, rh - 4);
        g.lineStyle(1, C.rugBorder, 0.5);
        g.strokeRect(rx + 8, ry + 8, rw - 16, rh - 16);

        // Patrón interior
        g.fillStyle(C.rugPat);
        g.fillRect(rx + 12, ry + 12, rw - 24, rh - 24);

        // Cruz central
        g.fillStyle(C.rugBorder);
        g.fillRect(rx + rw/2 - 1, ry + 12, 2, rh - 24);
        g.fillRect(rx + 12, ry + rh/2 - 1, rw - 24, 2);

        // Rombos decorativos
        const dmnd = (dx, dy) => {
            g.fillStyle(C.rugBorder);
            g.fillRect(dx - 4, dy, 8, 2); g.fillRect(dx, dy - 4, 2, 8);
        };
        dmnd(rx + 22, ry + 22);
        dmnd(rx + rw - 22, ry + 22);
        dmnd(rx + 22, ry + rh - 22);
        dmnd(rx + rw - 22, ry + rh - 22);
        dmnd(rx + rw/2, ry + rh/2);
    }

    // ─── HELPER: dibuja objeto con profundidad ────────────────────────────────
    // x,y = esquina sup-izq del objeto. topH = altura de la "cara superior"
    _objDepth(g, x, y, w, frontH, topH, topCol, frontCol, sideCol) {
        // Sombra en el suelo
        g.fillStyle(C.dropSh, 0.2);
        g.fillRect(x + 4, y + frontH + topH, w - 2, 5);

        // Cara superior (vista desde arriba, más clara)
        g.fillStyle(topCol);
        g.fillRect(x, y, w, topH);
        // Brillo top
        const tc = Phaser.Display.Color.IntegerToColor(topCol);
        g.fillStyle(Phaser.Display.Color.GetColor(
            Math.min(255, tc.red   + 20),
            Math.min(255, tc.green + 20),
            Math.min(255, tc.blue  + 20)
        ));
        g.fillRect(x, y, w, 2);

        // Cara frontal (la que realmente se ve)
        g.fillStyle(frontCol);
        g.fillRect(x, y + topH, w, frontH);
        // Highlight izquierda
        const fc = Phaser.Display.Color.IntegerToColor(frontCol);
        g.fillStyle(Phaser.Display.Color.GetColor(
            Math.min(255, fc.red   + 15),
            Math.min(255, fc.green + 15),
            Math.min(255, fc.blue  + 15)
        ));
        g.fillRect(x, y + topH, 3, frontH);

        // Sombra derecha
        g.fillStyle(sideCol);
        g.fillRect(x + w - 4, y + topH, 4, frontH);
        // Línea inferior
        g.fillStyle(sideCol);
        g.fillRect(x, y + topH + frontH - 2, w, 2);
    }

    // ─── ARMERÍA (soporte de armadura) ────────────────────────────────────────
    _drawArmorStand(x, y) {
        const g = this.add.graphics();

        // Soporte de madera con profundidad
        this._objDepth(g, x - 30, y, 60, 72, 6, C.woodTop, C.wood, C.woodD);

        // Superficie del mueble
        g.fillStyle(C.woodL);
        g.fillRect(x - 28, y + 6, 56, 2); // borde bajo cara top

        // Tela de fondo (paño oscuro)
        g.fillStyle(0x1a1428);
        g.fillRect(x - 22, y + 10, 44, 62);
        g.fillStyle(0x2a2038);
        g.fillRect(x - 22, y + 10, 44, 1); // borde superior

        // CORAZA con profundidad
        g.fillStyle(C.armorD);
        g.fillRect(x - 16, y + 12, 32, 3); // cara top de la coraza
        g.fillStyle(C.armorG);
        g.fillRect(x - 16, y + 15, 32, 28); // cara frontal
        g.fillStyle(C.armorL);
        g.fillRect(x - 16, y + 15, 3, 28); // brillo izq
        g.fillStyle(C.armorD);
        g.fillRect(x + 12, y + 15, 4, 28); // sombra der

        // Cruz dorada
        g.fillStyle(C.goldTrim);
        g.fillRect(x - 2, y + 18, 4, 18);
        g.fillRect(x - 10, y + 24, 20, 4);
        g.fillStyle(C.goldL);
        g.fillRect(x - 1, y + 18, 2, 2);

        // Hombros (pauldrones redondeados)
        g.fillStyle(C.armorD);
        g.fillRect(x - 20, y + 14, 8, 2); // top hombro izq
        g.fillStyle(C.armorG);
        g.fillRect(x - 20, y + 16, 8, 14);
        g.fillStyle(C.armorL);
        g.fillRect(x - 20, y + 16, 2, 14);
        g.fillStyle(C.armorD);
        g.fillRect(x + 12, y + 14, 8, 2);
        g.fillStyle(C.armorG);
        g.fillRect(x + 12, y + 16, 8, 14);
        g.fillStyle(C.armorD);
        g.fillRect(x + 18, y + 16, 2, 14);

        // Casco encima (con penacho)
        g.fillStyle(C.armorD);
        g.fillRect(x - 12, y + 2, 24, 3); // top casco
        g.fillStyle(C.armorG);
        g.fillRect(x - 12, y + 5, 24, 8);
        g.fillStyle(C.armorL);
        g.fillRect(x - 12, y + 5, 3, 8);
        g.fillStyle(0x0a0a14);
        g.fillRect(x - 6, y + 7, 12, 4); // visera
        g.fillStyle(C.goldTrim);
        g.fillRect(x - 12, y + 5, 24, 1); // rim dorado
        // Penacho rojo
        g.fillStyle(0xe83030);
        g.fillRect(x - 4, y - 6, 8, 3);
        g.fillStyle(0xcc2020);
        g.fillRect(x - 2, y - 10, 4, 6);
        g.fillStyle(0xee5050);
        g.fillRect(x - 2, y - 10, 2, 3);

        // Espada al lado (con profundidad)
        g.fillStyle(C.armorD);
        g.fillRect(x + 22, y + 2, 5, 2); // top espada
        g.fillStyle(C.armorL);
        g.fillRect(x + 22, y + 4, 5, 58); // hoja
        g.fillStyle(0xe8f0f8);
        g.fillRect(x + 23, y + 4, 2, 58); // brillo hoja
        g.fillStyle(C.goldTrim);
        g.fillRect(x + 18, y + 18, 14, 4); // guarda
        g.fillStyle(C.goldL);
        g.fillRect(x + 18, y + 18, 14, 1);
        g.fillStyle(C.woodL);
        g.fillRect(x + 22, y + 22, 5, 10); // empuñadura

        // Marco/borde del mueble
        g.lineStyle(1, C.frameDark, 0.6);
        g.strokeRect(x - 30, y, 60, 78);
    }

    // ─── TERMINAL / ORDENADOR ─────────────────────────────────────────────────
    _drawComputerDesk(x, y) {
        const g = this.add.graphics();

        // Mesa de escritorio con profundidad
        this._objDepth(g, x - 36, y + 28, 72, 24, 5, C.woodTop, C.wood, C.woodD);
        // Patas de la mesa
        g.fillStyle(C.woodD);
        g.fillRect(x - 32, y + 57, 5, 12);
        g.fillRect(x + 27, y + 57, 5, 12);

        // Monitor - base (cuña de profundidad)
        g.fillStyle(C.deskDark);
        g.fillRect(x - 26, y + 4, 52, 3); // cara top del monitor
        // Monitor - cara frontal
        g.fillStyle(C.deskDark);
        g.fillRect(x - 26, y + 7, 52, 32);
        g.fillStyle(0x2a2a4a);
        g.fillRect(x - 26, y + 7, 3, 32); // borde izq highlight
        g.fillStyle(0x0e0e1e);
        g.fillRect(x + 23, y + 7, 3, 32); // borde der shadow

        // Pantalla encendida
        g.fillStyle(C.screenFace);
        g.fillRect(x - 20, y + 11, 40, 24);

        // Líneas de texto en la terminal
        g.fillStyle(C.screenGlow);
        g.fillRect(x - 18, y + 14, 30, 1);
        g.fillRect(x - 18, y + 17, 22, 1);
        g.fillRect(x - 18, y + 20, 35, 1);
        g.fillRect(x - 18, y + 23, 18, 1);
        g.fillRect(x - 18, y + 26, 28, 1);
        g.fillRect(x - 18, y + 29, 12, 1);

        // Prompt ">" parpadeante
        g.fillStyle(C.neon);
        g.fillRect(x - 18, y + 29, 4, 2);

        // Borde neon en el monitor
        g.lineStyle(1, C.neon, 0.7);
        g.strokeRect(x - 26, y + 4, 52, 35);

        // Pie del monitor
        g.fillStyle(C.deskDark);
        g.fillRect(x - 8, y + 36, 16, 4);

        // Teclado sobre la mesa (con perspectiva)
        g.fillStyle(0x1a1a2a);
        g.fillRect(x - 20, y + 34, 40, 8);
        g.fillStyle(0x2a2a3e);
        g.fillRect(x - 20, y + 34, 40, 2); // top teclado
        // Teclas
        for (let ky = 0; ky < 2; ky++) {
            for (let kx = 0; kx < 7; kx++) {
                g.fillStyle(0x2a2a40);
                g.fillRect(x - 18 + kx * 6, y + 36 + ky * 3, 5, 2);
            }
        }

        // Texto en la tapa del monitor
        g.fillStyle(C.neon);
        g.fillRect(x - 4, y + 8, 8, 1); // línea decorativa neon
    }

    // ─── ESTANTERÍA (estilo teal, como la imagen ref) ─────────────────────────
    _drawBookshelf(x, y) {
        const g = this.add.graphics();
        const W = 76, frontH = 80;

        // Cuerpo principal con profundidad
        this._objDepth(g, x - W/2, y, W, frontH, 7, C.tealTop, C.teal, C.tealD);

        // Interior (fondo oscuro de los estantes)
        g.fillStyle(C.tealD);
        g.fillRect(x - W/2 + 4, y + 9, W - 8, frontH - 4);

        // Estantes horizontales (3 estantes)
        for (let s = 0; s < 3; s++) {
            const sy = y + 7 + s * 24;
            g.fillStyle(C.tealTop);
            g.fillRect(x - W/2 + 2, sy, W - 4, 4);
            g.fillStyle(C.teal);
            g.fillRect(x - W/2 + 2, sy + 3, W - 4, 1);
        }

        // Libros en los estantes
        const bookData = [
            [C.bookR, 10], [C.bookB, 8], [C.bookG, 11], [C.bookY, 7],
            [C.bookR, 9],  [C.bookB, 10], [C.bookG, 7],
        ];
        for (let s = 0; s < 2; s++) {
            let bx = x - W/2 + 6;
            const by = y + 11 + s * 24;
            bookData.forEach(([col, bw]) => {
                if (bx + bw > x + W/2 - 4) return;
                // Cara top del libro
                g.fillStyle(Phaser.Display.Color.IntegerToColor(col).darken(15).color);
                g.fillRect(bx, by - 3, bw - 1, 3);
                // Cara frontal del libro
                g.fillStyle(col);
                g.fillRect(bx, by, bw - 1, 14);
                // Brillo lomo
                g.fillStyle(Phaser.Display.Color.IntegerToColor(col).lighten(25).color);
                g.fillRect(bx, by, 1, 14);
                g.fillRect(bx, by - 3, 1, 3);
                // Página
                g.fillStyle(C.bookPage);
                g.fillRect(bx + bw - 1, by, 1, 14);
                bx += bw + 2;
            });
        }

        // Objeto decorativo (trofeo/planta) en el estante superior
        g.fillStyle(C.goldTrim);
        g.fillRect(x + 14, y + 8, 12, 2);
        g.fillRect(x + 18, y + 2, 4, 8);
        g.fillTriangle(x + 18, y + 2, x + 22, y + 2, x + 20, y - 4);
        g.fillStyle(C.goldL);
        g.fillRect(x + 18, y + 2, 2, 2);

        // Marco decorativo de la estantería
        g.lineStyle(2, C.tealL, 0.6);
        g.strokeRect(x - W/2, y, W, 7);
    }

    // ─── MESA CON LIBRO ───────────────────────────────────────────────────────
    _drawTableWithBook(x, y) {
        const g = this.add.graphics();

        // Mesa redonda/ovalada con profundidad
        // Cara top (ovalada)
        g.fillStyle(C.woodTop);
        g.fillEllipse(x, y + 2, 58, 18);
        g.fillStyle(C.woodL);
        g.fillEllipse(x - 2, y, 56, 14);
        g.fillStyle(C.woodD);
        g.fillEllipse(x, y + 3, 54, 8); // borde de la cara top

        // Pata central
        g.fillStyle(C.woodD);
        g.fillRect(x - 4, y + 7, 8, 20);
        g.fillStyle(C.wood);
        g.fillRect(x - 3, y + 7, 3, 20);
        // Base de la pata
        g.fillStyle(C.woodD);
        g.fillRect(x - 16, y + 25, 32, 5);
        g.fillStyle(C.wood);
        g.fillRect(x - 16, y + 25, 32, 2);

        // LIBRO ABIERTO encima de la mesa (con perspectiva)
        // Cara top (vista desde arriba - pequeña franja)
        g.fillStyle(C.woodD);
        g.fillRect(x - 20, y - 8, 40, 3);
        // Página izquierda (cara frontal)
        g.fillStyle(C.bookPage);
        g.fillRect(x - 20, y - 5, 19, 16);
        g.fillStyle(C.bookPage);
        g.fillRect(x + 1, y - 5, 19, 16);
        // Lomo central
        g.fillStyle(C.bookR);
        g.fillRect(x - 2, y - 8, 4, 19);
        // Brillo lomo
        g.fillStyle(0xcc4040);
        g.fillRect(x - 2, y - 8, 1, 19);
        // Líneas de texto en las páginas
        g.fillStyle(0x998880);
        for (let li = 0; li < 4; li++) {
            g.fillRect(x - 18, y - 3 + li * 4, 14, 1);
            g.fillRect(x + 4,  y - 3 + li * 4, 14, 1);
        }
        // Ilustración pequeña en página derecha
        g.fillStyle(0x2858A0);
        g.fillRect(x + 4, y - 2, 8, 6); // diagrama red

        // Vela al lado
        g.fillStyle(0xF0F0E0);
        g.fillRect(x + 22, y - 8, 5, 14); // vela
        g.fillStyle(0xE0E0C0);
        g.fillRect(x + 22, y - 8, 5, 2); // top vela
        g.fillStyle(0xFF8800);
        g.fillRect(x + 23, y - 14, 3, 8); // llama
        g.fillStyle(0xFFCC44);
        g.fillRect(x + 24, y - 16, 1, 4); // punta llama
        // Base de vela
        g.fillStyle(C.woodD);
        g.fillRect(x + 20, y + 7, 8, 3);

        // Pequeño objeto (tarro/cactus) al otro lado
        g.fillStyle(0x228844);
        g.fillRect(x - 32, y - 6, 8, 10);
        g.fillStyle(0x2AA050);
        g.fillRect(x - 32, y - 6, 2, 10);
        g.fillStyle(C.pot);
        g.fillRect(x - 33, y + 3, 10, 8); // maceta
        g.fillStyle(C.potD);
        g.fillRect(x - 33, y + 10, 10, 1); // sombra maceta
    }

    // ─── CAMA ─────────────────────────────────────────────────────────────────
    _drawBed(x, y) {
        const g = this.add.graphics();
        const W = 100, bedLen = 70;

        // Estructura de la cama con profundidad
        // Cabecero (parte trasera)
        g.fillStyle(C.bedFrameD);
        g.fillRect(x - W/2, y, W, 5);     // top cabecero
        g.fillStyle(C.bedFrame);
        g.fillRect(x - W/2, y + 5, W, 22); // cara frontal cabecero
        g.fillStyle(C.woodL);
        g.fillRect(x - W/2, y + 5, 4, 22); // brillo izq
        g.fillStyle(C.bedFrameD);
        g.fillRect(x + W/2 - 4, y + 5, 4, 22); // sombra der

        // Tablones decorativos del cabecero
        for (let i = 0; i < 4; i++) {
            g.fillStyle(i % 2 === 0 ? C.bedFrame : C.bedFrameD);
            g.fillRect(x - W/2 + 6 + i * 24, y + 7, 22, 18);
        }
        // Adorno central del cabecero
        g.fillStyle(C.goldTrim);
        g.fillRect(x - 8, y + 11, 16, 2);
        g.fillRect(x - 1, y + 9, 2, 6);

        // Colchón / cuerpo de la cama
        g.fillStyle(C.bedFrameD);
        g.fillRect(x - W/2, y + 27, W, 4);   // top lateral cama
        g.fillStyle(C.bedFrame);
        g.fillRect(x - W/2, y + 31, 6, bedLen);  // lateral izq
        g.fillRect(x + W/2 - 6, y + 31, 6, bedLen); // lateral der

        // Sábana (con perspectiva de profundidad)
        g.fillStyle(C.bedSheetD);
        g.fillRect(x - W/2 + 6, y + 27, W - 12, 6); // cara top sábana
        g.fillStyle(C.bedSheet);
        g.fillRect(x - W/2 + 6, y + 33, W - 12, bedLen - 6); // cara frontal sábana

        // Pliegues de la sábana
        g.fillStyle(C.bedSheetD);
        for (let f = 0; f < 4; f++) {
            g.fillRect(x - W/2 + 12 + f * 22, y + 33, 1, bedLen - 6);
        }

        // Cruz decorativa en la manta
        g.fillStyle(C.goldTrim);
        g.fillRect(x - 2, y + 40, 4, 30);
        g.fillRect(x - 18, y + 52, 36, 4);

        // Almohadas (2 almohadas, con profundidad)
        g.fillStyle(C.pillowD);
        g.fillRect(x - 38, y + 27, 36, 4);   // top almohada izq
        g.fillRect(x + 2,  y + 27, 36, 4);   // top almohada der
        g.fillStyle(C.pillow);
        g.fillRect(x - 38, y + 31, 36, 12);  // cara frontal almohada izq
        g.fillRect(x + 2,  y + 31, 36, 12);  // cara frontal almohada der
        // Bordado en almohadas
        g.lineStyle(1, C.pillowD, 0.7);
        g.strokeRect(x - 36, y + 32, 32, 10);
        g.strokeRect(x + 4,  y + 32, 32, 10);

        // Pie de cama
        g.fillStyle(C.bedFrameD);
        g.fillRect(x - W/2, y + 31 + bedLen, W, 4);  // top
        g.fillStyle(C.bedFrame);
        g.fillRect(x - W/2, y + 35 + bedLen, W, 8);  // cara frontal pie
    }

    // ─── PLANTAS DECORATIVAS ──────────────────────────────────────────────────
    _drawPlant(x, y, size) {
        const g = this.add.graphics();
        const sc = size === 'small' ? 0.7 : 1.0;

        // Maceta con profundidad
        const pw = Math.floor(16 * sc), ph = Math.floor(14 * sc);
        g.fillStyle(C.potD);
        g.fillRect(x - pw/2, y + 2, pw, 2); // top maceta
        g.fillStyle(C.pot);
        g.fillRect(x - pw/2, y + 4, pw, ph);
        g.fillStyle(Phaser.Display.Color.IntegerToColor(C.pot).lighten(15).color);
        g.fillRect(x - pw/2, y + 4, 3, ph);
        g.fillStyle(C.potD);
        g.fillRect(x - pw/2, y + 4 + ph - 2, pw, 2);

        // Tierra
        g.fillStyle(0x5A3018);
        g.fillRect(x - pw/2 + 2, y + 4, pw - 4, 4);

        // Hojas
        const offsets = size === 'small'
            ? [[-5,-12,8,8], [0,-16,8,8], [5,-10,8,8]]
            : [[-8,-18,12,12], [-2,-22,12,12], [6,-16,12,12], [-4,-10,10,10]];
        offsets.forEach(([ox, oy, lw, lh], i) => {
            const col = i % 2 === 0 ? C.leaf1 : C.leaf2;
            g.fillStyle(col);
            g.fillEllipse(x + ox, y + oy, lw, lh);
            g.fillStyle(C.leaf3);
            g.fillRect(x + ox, y + oy, 1, lh * 0.6);
        });
    }

    // ─── LUZ AMBIENTE CÁLIDA ──────────────────────────────────────────────────
    _drawLighting() {
        // Glow cálido en el centro del techo (ventana invisible)
        const gl = this.add.graphics();
        gl.setBlendMode(Phaser.BlendModes.ADD);

        // Círculo de luz principal (centro superior)
        gl.fillStyle(C.warmGlow, 0.06);
        gl.fillCircle(RW/2, 80, 200);
        gl.fillStyle(C.warmGlow, 0.04);
        gl.fillCircle(RW/2, 80, 280);

        // Reflejos cálidos en el suelo (debajo de donde estarían ventanas)
        gl.fillStyle(C.warmDim, 0.05);
        gl.fillCircle(450, 250, 120);

        // Esquinas con sombra (vignette)
        const vig = this.add.graphics();
        vig.fillStyle(0x000000, 0.15);
        vig.fillRect(0, 0, 60, RH);   // izq
        vig.fillRect(RW-60, 0, 60, RH); // der
        vig.fillStyle(0x000000, 0.1);
        vig.fillRect(0, 0, RW, 30);   // arriba
        vig.fillRect(0, RH-30, RW, 30); // abajo
    }

    // ─── PAREDES DE COLISIÓN ──────────────────────────────────────────────────
    _setupWalls() {
        this.walls = this.physics.add.staticGroup();
        const W = (x, y, w, h) => {
            const o = this.add.rectangle(x + w/2, y + h/2, w, h, 0x000000, 0);
            this.physics.add.existing(o, true);
            this.walls.add(o);
        };
        W(0,    0,    16, RH);               // pared izq
        W(RW-16,0,    16, RH);               // pared der
        W(0,    0,    RW, 16);               // pared top
        W(0,    RH-16,DOOR_X, 16);           // pared bot izq
        W(DOOR_X+DOOR_W, RH-16, RW-DOOR_X-DOOR_W, 16); // pared bot der

        // Objetos
        W(58,  40,  60, 80);   // soporte armadura
        W(274, 32,  72, 72);   // escritorio ordenador
        W(492, 32,  72, 76);   // estantería
        W(109, 188, 60, 44);   // mesa con libro
        W(440, 260, 100, 80);  // cama
    }

    // ─── ZONAS DE INTERACCIÓN ─────────────────────────────────────────────────
    _setupObjectZones() {
        this.objectZones = OBJS.map(obj => {
            const z = this.add.zone(obj.x, obj.y, obj.w + 24, obj.h + 24);
            this.physics.world.enable(z);
            z.body.setAllowGravity(false);
            z.body.moves = false;
            z.objData = obj;
            return z;
        });
        // Zona de salida
        const exit = this.add.zone(RW/2, RH - 8, DOOR_W - 10, 20);
        this.physics.world.enable(exit);
        exit.body.setAllowGravity(false);
        exit.body.moves = false;
        exit.objData = { id: 'exit', label: 'Salida', hint: '[E] Volver al campus', route: '/dashboard', dialog: null };
        this.objectZones.push(exit);
    }

    // ─── HUD ─────────────────────────────────────────────────────────────────
    _setupHUD() {
        this.hintBg = this.add.graphics().setDepth(50);
        this.hintLabel = this.add.text(0, 0, '', {
            fontFamily: 'monospace', fontSize: '7px',
            color: '#c6ff33',
            padding: { x: 5, y: 3 },
        }).setDepth(51).setOrigin(0.5, 1).setVisible(false);

        // Labels de los objetos
        OBJS.forEach(obj => {
            this.add.text(obj.x, obj.y - obj.h/2 - 8, obj.label, {
                fontFamily: 'monospace', fontSize: '5px',
                color: '#ffffff66',
                stroke: '#00000088', strokeThickness: 2,
            }).setOrigin(0.5, 1).setDepth(5);
        });

        // Controles (esquina inf-izq)
        this.add.text(20, RH - 22, 'WASD/↑↓←→  ·  [E] Interactuar', {
            fontFamily: 'monospace', fontSize: '5px',
            color: '#ffffff44',
        }).setDepth(50);
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    update() {
        if (this.dialogOpen) {
            this.jugador.setVelocity(0, 0);
            this.jugador.anims.play(`idle-${this.lastDir}`, true);
            return;
        }

        const speed = 110;
        let vx = 0, vy = 0;

        if (this.cursors.left.isDown  || this.wasd.left.isDown)  { vx = -speed; this.lastDir = 'left'; }
        if (this.cursors.right.isDown || this.wasd.right.isDown) { vx =  speed; this.lastDir = 'right'; }
        if (this.cursors.up.isDown    || this.wasd.up.isDown)    { vy = -speed; this.lastDir = 'up'; }
        if (this.cursors.down.isDown  || this.wasd.down.isDown)  { vy =  speed; this.lastDir = 'down'; }

        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
        this.jugador.setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            this.jugador.anims.play(`walk-${this.lastDir}`, true);
        } else {
            this.jugador.anims.play(`idle-${this.lastDir}`, true);
        }

        // Detectar zona cercana
        this.currentZone = null;
        this.objectZones.forEach(z => {
            if (this.physics.overlap(this.jugador, z)) this.currentZone = z;
        });

        // Mostrar hint
        if (this.currentZone) {
            const jx = this.jugador.x;
            const jy = this.jugador.y - 16;
            this.hintLabel.setText(this.currentZone.objData.hint).setPosition(jx, jy).setVisible(true);
            this.hintBg.clear()
                .fillStyle(0x000000, 0.7)
                .fillRoundedRect(jx - 55, jy - 14, 110, 14, 4);
        } else {
            this.hintLabel.setVisible(false);
            this.hintBg.clear();
        }

        // Interacción
        const pressed = Phaser.Input.Keyboard.JustDown(this.keyE)
                     || Phaser.Input.Keyboard.JustDown(this.keySpace)
                     || Phaser.Input.Keyboard.JustDown(this.keyEnter);

        if (pressed && this.currentZone) {
            this.dialogOpen = true;
            this.jugador.setVelocity(0, 0);
            this.jugador.anims.stop();
            const data = this.currentZone.objData;
            if (data.route) {
                EventBus.emit('NAVIGATE', data.route, data.dialog);
            } else {
                EventBus.emit('SHOW_DIALOG', { title: data.label, text: data.dialog });
            }
        }
    }
}
