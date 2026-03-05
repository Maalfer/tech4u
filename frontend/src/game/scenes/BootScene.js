import { Scene } from 'phaser';

export class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Cargar mapa
        this.load.image('aldea_mapa', '/src/assets/aldea_mapa.png');

        // Cargar personajes y papiro
        this.load.image('admin_pj', '/src/assets/admin_pj.png');
        this.load.image('papiro_rules', '/src/assets/papiro_rules.png');

        // Cargar el spritesheet del orco (4x4)
        this.load.spritesheet('orco', '/src/assets/sides_png.png', {
            frameWidth: Math.floor(1280 / 4), // 320 píxeles exactos
            frameHeight: Math.floor(698 / 4) // 174 píxeles exactos
        });
    }

    create() {
        // Una vez cargados los assets, pasar a la escena de la aldea
        this.scene.start('EscenaAldea');
    }
}
