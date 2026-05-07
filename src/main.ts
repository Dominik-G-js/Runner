import './styles/global.css';
import './ui/ui.css';
import { Game } from './game/Game';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
const uiRoot = document.querySelector<HTMLElement>('#ui-root');

if (!canvas || !uiRoot) {
  throw new Error('Crowd Clash Math boot failed: required DOM roots are missing.');
}

const game = new Game(canvas, uiRoot);
game.start();
