import { Events } from 'phaser';

// Used to emit events between React components and Phaser scenes
// This avoids coupling the game logic with the UI.
export const EventBus = new Events.EventEmitter();
