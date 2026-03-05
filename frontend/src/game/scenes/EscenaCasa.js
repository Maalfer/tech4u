import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class EscenaCasa extends Scene {
    constructor() {
        super('EscenaCasa');
    }

    create() {
        this.cameras.main.fadeIn(500);

        // Map setup (Interior / Tech room)
        // Usamos un fondo oscuro, se puede reemplazar por un tilemap de una casa
        this.add.rectangle(0, 0, 1240, 930, 0x0a1428).setOrigin(0, 0);

        // Boundaries
        this.physics.world.setBounds(0, 0, 1240, 930);
        this.cameras.main.setBounds(0, 0, 1240, 930);

        // NPC Admin
        this.npc = this.physics.add.staticSprite(600, 300, 'admin_pj');
        this.npc.setScale(0.8);

        // Player
        this.jugador = this.physics.add.sprite(600, 800, 'orco');
        this.jugador.setCollideWorldBounds(true);
        this.jugador.setScale(0.3);
        this.jugador.body.setSize(100, 80);
        this.jugador.body.setOffset(110, 80);

        this.cameras.main.startFollow(this.jugador, true, 0.05, 0.05);
        this.cameras.main.setZoom(2.5);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // NPC Interaction Zone
        this.npcZone = this.add.zone(this.npc.x, this.npc.y, 150, 150);
        this.physics.world.enable(this.npcZone);
        this.npcZone.body.setAllowGravity(false);
        this.npcZone.body.moves = false;

        // Terminal Interaction Zones (7 Infographics)
        const terminalPositions = [
            { id: 1, x: 200, y: 200, title: 'Ciberseguridad Ofensiva' },
            { id: 2, x: 1000, y: 200, title: 'Arquitectura Cloud' },
            { id: 3, x: 200, y: 500, title: 'Administración de BBDD' },
            { id: 4, x: 1000, y: 500, title: 'Desarrollo Full Stack' },
            { id: 5, x: 400, y: 700, title: 'Sistemas Operativos' },
            { id: 6, x: 800, y: 700, title: 'DevOps & CI/CD' },
            { id: 7, x: 600, y: 150, title: 'Certificaciones IT' }
        ];

        this.terminals = [];
        terminalPositions.forEach(pos => {
            // Placeholder visuals for terminals
            this.add.rectangle(pos.x, pos.y, 60, 60, 0x00ffaa).setAlpha(0.3);
            this.add.text(pos.x, pos.y - 40, pos.id.toString(), { fontSize: '20px', fill: '#00ffaa' }).setOrigin(0.5);

            let zone = this.add.zone(pos.x, pos.y, 100, 100);
            this.physics.world.enable(zone);
            zone.body.setAllowGravity(false);
            zone.body.moves = false;
            zone.info = pos;
            this.terminals.push(zone);
        });

        // Current Interactive Target
        this.currentTarget = null;
        this.dialogOpen = false;

        // Listen to when React closes Modals
        EventBus.on('CLOSE_MODAL', () => {
            this.dialogOpen = false;
        });
    }

    update() {
        if (this.dialogOpen) {
            this.jugador.setVelocity(0, 0);
            if (this.jugador.anims.isPlaying) {
                this.jugador.anims.stop();
            }
            return;
        }

        const speed = 250;
        let isMoving = false;
        let playAnim = '';

        this.jugador.setVelocity(0);

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.jugador.setVelocityX(-speed);
            playAnim = 'walk-left';
            isMoving = true;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.jugador.setVelocityX(speed);
            playAnim = 'walk-right';
            isMoving = true;
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.jugador.setVelocityY(-speed);
            playAnim = 'walk-up';
            isMoving = true;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.jugador.setVelocityY(speed);
            playAnim = 'walk-down';
            isMoving = true;
        }

        // Normalize
        if (this.jugador.body.velocity.x !== 0 && this.jugador.body.velocity.y !== 0) {
            this.jugador.body.velocity.normalize().scale(speed);
        }

        if (isMoving) {
            this.jugador.anims.play(playAnim, true);
        } else {
            this.jugador.anims.stop();
        }

        // Check Overlaps for interactions
        this.currentTarget = null;

        // Check NPC overlap
        if (this.physics.overlap(this.jugador, this.npcZone)) {
            this.currentTarget = { type: 'NPC' };
        }

        // Check Terminals overlap
        this.terminals.forEach(term => {
            if (this.physics.overlap(this.jugador, term)) {
                this.currentTarget = { type: 'TERMINAL', info: term.info };
            }
        });

        // Interaction processing
        if (Phaser.Input.Keyboard.JustDown(this.space) || Phaser.Input.Keyboard.JustDown(this.enter)) {
            if (this.currentTarget) {
                this.dialogOpen = true; // Block movement
                this.jugador.setVelocity(0, 0);
                this.jugador.anims.stop();

                if (this.currentTarget.type === 'NPC') {
                    EventBus.emit('SHOW_DIALOG', {
                        title: 'Marco (Admin)',
                        text: '¡Bienvenido al hub tecnológico central! Aquí puedes revisar todas las infografías interactuando con las terminales verdes.'
                    });
                } else if (this.currentTarget.type === 'TERMINAL') {
                    EventBus.emit('SHOW_INFOGRAPHIC', this.currentTarget.info);
                }
            }
        }
    }
}
