import * as THREE from 'three';
import { GameSettings, GraphicsQuality } from '../data/settings';
import { LevelData } from '../data/levels';
import { levels } from '../data/levels';
import { EventBus } from '../utils/EventBus';
import { clamp } from '../utils/MathUtils';
import { AudioManager } from './AudioManager';
import { CameraController } from './CameraController';
import { GameState, LevelResult } from './GameState';
import { InputManager } from './InputManager';
import { LevelManager } from './LevelManager';
import { SaveManager } from './SaveManager';
import { SceneManager } from './SceneManager';
import { UIManager } from '../ui/ui';
import { BattleSystem } from '../gameplay/BattleSystem';
import { BuiltLevel, LevelBuilder } from '../gameplay/LevelBuilder';
import { PlayerCrowd } from '../gameplay/PlayerCrowd';
import { Effects } from '../gameplay/Effects';

interface UIAction {
  action: string;
  level: number;
}

interface UISetting {
  setting: string;
  value: string | boolean;
}

export class Game {
  private readonly events = new EventBus();
  private readonly save = new SaveManager();
  private readonly scene: SceneManager;
  private readonly input: InputManager;
  private readonly audio: AudioManager;
  private readonly ui: UIManager;
  private readonly camera: CameraController;
  private readonly levelManager = new LevelManager();
  private readonly clock = new THREE.Clock();
  private state = GameState.Boot;
  private previousState = GameState.MainMenu;
  private player: PlayerCrowd | null = null;
  private currentLevel: LevelData | null = null;
  private builtLevel: BuiltLevel | null = null;
  private battle = new BattleSystem();
  private effects: Effects | null = null;
  private lastCoinsSnapshot = 0;

  constructor(canvas: HTMLCanvasElement, uiRoot: HTMLElement) {
    this.scene = new SceneManager(canvas, this.save.settings);
    this.input = new InputManager(canvas);
    this.audio = new AudioManager(this.save.settings);
    this.ui = new UIManager(uiRoot, this.events);
    this.camera = new CameraController(this.scene.camera, this.save.settings);
    this.input.setPauseHandler(() => {
      if (this.state === GameState.Playing) this.pause();
      else if (this.state === GameState.Paused) this.resume();
    });
    this.events.on<UIAction>('ui:action', (payload) => this.handleAction(payload));
    this.events.on<UISetting>('ui:setting', (payload) => this.handleSetting(payload));
  }

  start(): void {
    this.showMainMenu();
    this.clock.start();
    this.loop();
  }

  private loop = (): void => {
    requestAnimationFrame(this.loop);
    const dt = Math.min(0.033, this.clock.getDelta());
    this.update(dt);
    this.scene.render();
  };

  private update(dt: number): void {
    if (this.state !== GameState.Playing || !this.player || !this.currentLevel || !this.builtLevel) {
      return;
    }

    const axis = this.input.getHorizontalAxis();
    this.player.targetX += axis * 9 * dt + this.input.consumeDragDelta();
    this.player.speed = this.battle.active ? 0 : 13.5 + this.currentLevel.id * 0.25;
    this.player.update(dt, performance.now() * 0.001, LevelBuilder.trackWidth / 2);

    const time = performance.now() * 0.001;
    this.builtLevel.gates.forEach((gate) => {
      gate.update(time, this.player!.position.z);
      const hit = gate.check(this.player!.position.x, this.player!.position.z);
      if (!hit) return;
      const delta = this.player!.applyOperation(hit.operation);
      this.effects?.floatingText(hit.label, this.player!.position, hit.positive);
      this.effects?.burst(this.player!.position, hit.positive ? 0x00d9ff : 0xff7043, 18);
      this.effects?.shockwave(this.player!.position, hit.positive ? 0x79ff4f : 0xff4d5d);
      this.ui.pulseHud('count', hit.positive || delta > 0 ? 'good' : 'bad');
      this.ui.flash(hit.positive || delta > 0 ? 'good' : 'bad');
      this.ui.toast(hit.positive || delta > 0 ? `Boost ${hit.label}` : `Penalty ${hit.label}`, hit.positive || delta > 0 ? 'good' : 'bad');
      this.audio.play(hit.positive || delta > 0 ? 'gatePositive' : 'gateNegative');
      this.camera.shake(hit.positive ? 0.1 : 0.22, 0.22);
    });

    this.builtLevel.collectibles.forEach((collectible) => {
      collectible.update(dt, time);
      if (collectible.check(this.player!.position.x, this.player!.position.z, this.player!.radius)) {
        this.player!.add(1);
        this.effects?.floatingText('+1', collectible.group.position, true);
        this.ui.pulseHud('count', 'good');
        this.audio.play('collect');
      }
    });

    this.builtLevel.obstacles.forEach((obstacle) => {
      obstacle.update(dt, time);
      if (obstacle.check(this.player!.position.x, this.player!.position.z, this.player!.radius)) {
        this.player!.setCount(Math.max(0, this.player!.count - obstacle.data.damage));
        this.effects?.floatingText(`-${obstacle.data.damage}`, this.player!.position, false);
        this.effects?.burst(this.player!.position, 0xff4d5d, 18);
        this.effects?.shockwave(this.player!.position, 0xff4d5d);
        this.ui.pulseHud('count', 'bad');
        this.ui.flash('bad');
        this.ui.toast('Obstacle hit', 'bad');
        this.audio.play('hit');
        this.camera.shake(0.42, 0.26);
        if (this.player!.count <= 0) {
          this.lose();
        }
      }
    });

    this.builtLevel.enemies.forEach((enemy) => {
      enemy.update(dt, time);
      if (!enemy.defeated && !this.battle.active) {
        const dx = enemy.group.position.x - this.player!.position.x;
        const dz = enemy.group.position.z - this.player!.position.z;
        if (Math.hypot(dx, dz) < enemy.radius + this.player!.radius * 0.65) {
          this.battle.start(enemy);
          this.ui.toast('Battle!', 'warning');
          this.ui.flash('warning');
          this.audio.play('battle');
          this.camera.shake(0.32, 0.32);
        }
      }
    });

    const battleOutcome = this.battle.update(dt, this.player);
    if (battleOutcome === 'win') {
      this.effects?.floatingText('Won!', this.player.position, true);
      this.effects?.burst(this.player.position, 0x2dff9c, 24);
      this.effects?.shockwave(this.player.position, 0x79ff4f);
      this.ui.toast('Enemy crushed', 'good');
      this.ui.pulseHud('count', 'good');
      this.audio.play('gatePositive');
    }
    if (battleOutcome === 'lose') {
      this.lose();
      return;
    }

    this.effects?.update(dt);
    this.camera.update(dt, this.player.position);
    const progress = clamp((this.player.position.z + 8) / this.currentLevel.length, 0, 1);
    this.ui.updateHud(this.currentLevel.id, this.player.count, this.save.snapshot.coins, progress);

    if (this.player.position.z >= this.currentLevel.length) {
      this.win();
    }
  }

  private startLevel(levelId: number): void {
    this.audio.resume();
    this.scene.clearWorld();
    this.currentLevel = this.levelManager.load(levelId);
    this.battle = new BattleSystem();
    this.effects = new Effects(this.scene.world);
    const builder = new LevelBuilder(this.scene.world);
    this.builtLevel = builder.build(this.currentLevel);
    this.player = new PlayerCrowd(this.currentLevel.startCount, this.save.settings.graphicsQuality);
    this.player.group.position.set(0, 0, -8);
    this.player.targetX = 0;
    this.scene.world.add(this.player.group);
    this.scene.camera.position.set(0, 12, -25);
    this.camera.update(1, this.player.position);
    this.state = GameState.Playing;
    this.lastCoinsSnapshot = this.save.snapshot.coins;
    this.ui.showHud(this.currentLevel.id, this.player.count, this.lastCoinsSnapshot);
    this.ui.toast('Pick the best gate', 'neutral');
  }

  private pause(): void {
    if (this.state !== GameState.Playing) return;
    this.previousState = this.state;
    this.state = GameState.Paused;
    this.ui.showPause();
    this.audio.play('click');
  }

  private resume(): void {
    if (this.state !== GameState.Paused || !this.currentLevel || !this.player) return;
    this.state = this.previousState;
    this.ui.showHud(this.currentLevel.id, this.player.count, this.save.snapshot.coins);
    this.audio.play('click');
  }

  private win(): void {
    if (!this.currentLevel || !this.player || this.state !== GameState.Playing) return;
    this.state = GameState.Win;
    const remaining = this.player.count;
    const stars = this.calculateStars(this.currentLevel, remaining);
    const score = remaining * 10 + this.currentLevel.id * 100 + stars * 250;
    const coinsEarned = remaining * 2 + stars * 35;
    const result: LevelResult = {
      levelId: this.currentLevel.id,
      remainingCrowd: remaining,
      coinsEarned,
      stars,
      score,
    };
    this.save.completeLevel(this.currentLevel.id, score, coinsEarned);
    this.audio.play('win');
    this.camera.shake(0.22, 0.4);
    this.ui.flash('good');
    this.ui.showWin(result);
  }

  private lose(): void {
    if (this.state === GameState.Lose) return;
    this.state = GameState.Lose;
    this.audio.play('lose');
    this.camera.shake(0.55, 0.5);
    this.ui.flash('bad');
    this.ui.showLose();
  }

  private showMainMenu(): void {
    this.state = GameState.MainMenu;
    this.scene.clearWorld();
    this.ui.showMainMenu(this.save.snapshot);
  }

  private showLevelSelect(): void {
    this.state = GameState.LevelSelect;
    this.ui.showLevelSelect(this.save.snapshot);
  }

  private showSettings(): void {
    this.previousState = this.state;
    this.state = GameState.Settings;
    this.ui.showSettings(this.save.settings);
  }

  private handleAction(payload: UIAction): void {
    this.audio.resume();
    this.audio.play('click');
    const action = payload.action;
    if (action === 'play') {
      this.startLevel(Math.min(this.save.snapshot.unlockedLevel, levels.length));
    }
    if (action === 'levels') this.showLevelSelect();
    if (action === 'level') this.startLevel(payload.level);
    if (action === 'settings') this.showSettings();
    if (action === 'main') this.showMainMenu();
    if (action === 'pause') this.pause();
    if (action === 'resume') this.resume();
    if (action === 'retry') this.startLevel(this.currentLevel?.id ?? this.levelManager.currentId);
    if (action === 'next') this.startLevel(Math.min((this.currentLevel?.id ?? 1) + 1, levels.length));
    if (action === 'fullscreen') void document.documentElement.requestFullscreen?.();
    if (action === 'reset' && window.confirm('Reset all Crowd Clash Math progress?')) {
      this.save.reset();
      this.showSettings();
    }
  }

  private handleSetting(payload: UISetting): void {
    const settings: GameSettings = this.save.settings;
    if (payload.setting === 'musicVolume') settings.musicVolume = Number(payload.value);
    if (payload.setting === 'sfxVolume') settings.sfxVolume = Number(payload.value);
    if (payload.setting === 'graphicsQuality') settings.graphicsQuality = payload.value as GraphicsQuality;
    if (payload.setting === 'cameraShake') settings.cameraShake = Boolean(payload.value);
    this.save.updateSettings(settings);
    this.audio.updateSettings(settings);
    this.scene.applySettings(settings);
    this.camera.updateSettings(settings);
  }

  private calculateStars(level: LevelData, remaining: number): number {
    if (remaining >= level.starThresholds[2]) return 3;
    if (remaining >= level.starThresholds[1]) return 2;
    if (remaining >= level.starThresholds[0]) return 1;
    return 0;
  }
}
