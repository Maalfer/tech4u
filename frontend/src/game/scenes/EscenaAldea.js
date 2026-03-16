import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class EscenaAldea extends Scene {
    constructor() {
        super('EscenaAldea');
    }

    create() {
        this.cameras.main.fadeIn(500);

        // Map setup
        // The background is 1240 x 930 but image could be different. We will add it as an image.
        // Or set the bounds to the image size.
        const mapImage = this.add.image(0, 0, 'aldea_mapa').setOrigin(0, 0);

        this.physics.world.setBounds(0, 0, mapImage.width, mapImage.height);
        this.cameras.main.setBounds(0, 0, mapImage.width, mapImage.height);

        // Player setup
        // Escala del personaje reducida para que encaje mejor en el mapa
        this.jugador = this.physics.add.sprite(600, 500, 'orco');
        this.jugador.setCollideWorldBounds(true);
        this.jugador.setScale(0.3); // Ajustar según conveniencia
        // Bajar la caja de colisión para que los pies sean el centro
        this.jugador.body.setSize(100, 80);
        this.jugador.body.setOffset(110, 80);

        // Camera follow & Zoom
        this.cameras.main.startFollow(this.jugador, true, 0.05, 0.05);
        this.cameras.main.setZoom(2.5);

        // Crear un grupo para obstáculos estáticos (Muros invisibles para las casas)
        this.obstaculos = this.physics.add.staticGroup();

        // Muros invisibles sobre las casas (valores aproximados a ajustar según el mapa)
        const casa1 = this.add.rectangle(350, 250, 250, 200, 0x000000, 0); // null opacity for invisible
        this.physics.add.existing(casa1, true); // true = static body
        this.obstaculos.add(casa1);

        const casa2 = this.add.rectangle(850, 300, 300, 250, 0x000000, 0);
        this.physics.add.existing(casa2, true);
        this.obstaculos.add(casa2);

        // Hacer que el jugador choque con los obstáculos
        this.physics.add.collider(this.jugador, this.obstaculos);

        // Control keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Animations from the prompt
        // Caminar hacia ABAJO (Fila 1: frames 0 al 3)
        this.anims.create({ key: 'walk-down', frames: this.anims.generateFrameNumbers('orco', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });

        // Caminar hacia ARRIBA (Fila 2: frames 4 al 7)
        this.anims.create({ key: 'walk-up', frames: this.anims.generateFrameNumbers('orco', { start: 4, end: 7 }), frameRate: 8, repeat: -1 });

        // Caminar hacia la DERECHA (Fila 3: frames 8 al 11)
        this.anims.create({ key: 'walk-right', frames: this.anims.generateFrameNumbers('orco', { start: 8, end: 11 }), frameRate: 8, repeat: -1 });

        // Caminar hacia la IZQUIERDA (Fila 4: frames 12 al 15)
        this.anims.create({ key: 'walk-left', frames: this.anims.generateFrameNumbers('orco', { start: 12, end: 15 }), frameRate: 8, repeat: -1 });


        // Zona de transición (door to the house)
        // Adjust these coordinates based on the aldea_mapa.png later if needed
        this.doorZone = this.add.zone(900, 300, 100, 100);
        this.physics.world.enable(this.doorZone);
        // La zona no se mueve
        this.doorZone.body.setAllowGravity(false);
        this.doorZone.body.moves = false;

        this.physics.add.overlap(this.jugador, this.doorZone, this.handleEnterHouse, null, this);

        this.isTransitioning = false;

        // Show the rules popup via React
        EventBus.emit('SHOW_PAPIRO');

        // Listen to when React closes Papiro
        this.dialogOpen = true;
        EventBus.on('CLOSE_MODAL', () => {
            this.dialogOpen = false;
        });
    }

    handleEnterHouse() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.jugador.setVelocity(0, 0);
        this.jugador.anims.stop();

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('EscenaCasa');
        });
    }

    update() {
        if (this.isTransitioning || this.dialogOpen) {
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

        // Normalization
        if (this.jugador.body.velocity.x !== 0 && this.jugador.body.velocity.y !== 0) {
            this.jugador.body.velocity.normalize().scale(speed);
        }

        if (isMoving) {
            this.jugador.anims.play(playAnim, true);
            this.lastAnim = playAnim;
        } else {
            this.jugador.anims.stop();
            // Go to idle frame of the last animation direction if needed.
            // By stopping, it stays on the last frame. 
            // We can explicitly set frame 0 of that anim:
            if (this.lastAnim) {
                // this.jugador.anims.play(this.lastAnim);
                // this.jugador.anims.stop();
            }
        }
    }
}
