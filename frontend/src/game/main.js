import Phaser from 'phaser';

export default function StartGame(parent) {
    return new Phaser.Game({
        type: Phaser.AUTO,
        parent: parent,
        width: 1240, // Match the VirtualWorldView container width proportionally
        height: 930, // 1240 x 930 is roughly 4:3
        // You can also use width: window.innerWidth, height: window.innerHeight depending on requirement.
        // We will make it responsive by scaling.
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1240,
            height: 930,
        },
        physics: {
            default: 'arcade',
            arcade: {
                debug: false // Set to true to view collision boxes
            }
        },
        pixelArt: true,
        autoFocus: true,
        scene: [] // To be populated later
    });
}
