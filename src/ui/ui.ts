import { GameSettings, SaveData } from '../data/settings';
import { LevelResult } from '../game/GameState';
import { levels } from '../data/levels';
import { EventBus } from '../utils/EventBus';

type Screen = 'main' | 'levels' | 'settings' | 'pause' | 'win' | 'lose' | 'hud';

export class UIManager {
  private hudCount: HTMLElement | null = null;
  private hudLevel: HTMLElement | null = null;
  private hudCoins: HTMLElement | null = null;
  private progressFill: HTMLElement | null = null;
  private toastEl: HTMLElement | null = null;
  private flashEl: HTMLElement | null = null;
  private toastTimer = 0;

  constructor(
    private readonly root: HTMLElement,
    private readonly events: EventBus,
  ) {
    this.root.addEventListener('click', this.handleClick);
    this.root.addEventListener('input', this.handleInput);
  }

  showMainMenu(save: SaveData): void {
    const nextLevel = Math.min(save.unlockedLevel, levels.length);
    const bestTotal = Object.values(save.bestScores).reduce((sum, score) => sum + score, 0);
    this.renderOverlay('main', `
      <section class="menu-panel title-panel main-shell">
        <div class="brand-block">
          <div class="brand-mark"><span></span><span></span><span></span></div>
          <p class="eyebrow">Toxic Math Runner</p>
          <h1><span>Crowd Clash</span><strong>Math</strong></h1>
          <p class="menu-copy">Choose the cleanest gate, grow the squad, crush red crowds, and hit the finish with style.</p>
        </div>
        <div class="menu-command-stack">
          <button class="primary hero-action" data-action="play">
            <span>Play Level ${nextLevel}</span>
            <small>Continue run</small>
          </button>
          <div class="quick-actions">
            <button data-action="levels"><span>Levels</span><small>${nextLevel}/${levels.length} unlocked</small></button>
            <button data-action="settings"><span>Settings</span><small>Audio and graphics</small></button>
          </div>
        </div>
        <div class="save-strip">
          <span><small>Coins</small><strong>${save.coins}</strong></span>
          <span><small>Unlocked</small><strong>${nextLevel}/${levels.length}</strong></span>
          <span><small>Best Total</small><strong>${bestTotal}</strong></span>
        </div>
      </section>
    `);
  }

  showLevelSelect(save: SaveData): void {
    const buttons = levels
      .map((level) => {
        const unlocked = level.id <= save.unlockedLevel;
        const score = save.bestScores[String(level.id)] ?? 0;
        const status = unlocked ? (score > 0 ? 'Cleared' : 'Ready') : 'Locked';
        return `<button class="level-button ${unlocked ? 'unlocked' : 'locked'}" ${unlocked ? '' : 'disabled'} data-action="level" data-level="${level.id}">
          <span class="level-number">${level.id}</span>
          <span class="level-status">${status}</span>
          <small>${unlocked ? `Best ${score}` : 'Reach previous level'}</small>
        </button>`;
      })
      .join('');
    this.renderOverlay('levels', `
      <section class="menu-panel level-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Campaign</p>
            <h2>Level Select</h2>
          </div>
          <button class="ghost-button" data-action="main">Back</button>
        </div>
        <div class="level-grid">${buttons}</div>
      </section>
    `);
  }

  showSettings(settings: GameSettings): void {
    this.renderOverlay('settings', `
      <section class="menu-panel settings-panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Control Room</p>
            <h2>Settings</h2>
          </div>
          <button class="ghost-button" data-action="main">Back</button>
        </div>
        <div class="settings-grid">
          <label class="setting-row">
            <span><strong>Music</strong><small>Ambient loop volume</small></span>
            <input type="range" min="0" max="1" step="0.05" value="${settings.musicVolume}" data-setting="musicVolume" />
          </label>
          <label class="setting-row">
            <span><strong>SFX</strong><small>Hits, gates, rewards</small></span>
            <input type="range" min="0" max="1" step="0.05" value="${settings.sfxVolume}" data-setting="sfxVolume" />
          </label>
          <label class="setting-row">
            <span><strong>Graphics</strong><small>Rendering quality target</small></span>
            <select data-setting="graphicsQuality">
              <option value="low" ${settings.graphicsQuality === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${settings.graphicsQuality === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="high" ${settings.graphicsQuality === 'high' ? 'selected' : ''}>High</option>
            </select>
          </label>
          <label class="setting-row check-row">
            <span><strong>Camera Shake</strong><small>Impact feedback</small></span>
            <input type="checkbox" ${settings.cameraShake ? 'checked' : ''} data-setting="cameraShake" />
          </label>
        </div>
        <div class="menu-actions compact settings-actions">
          <button data-action="fullscreen">Fullscreen</button>
          <button class="danger" data-action="reset">Reset Progress</button>
        </div>
      </section>
    `);
  }

  showHud(levelId: number, count: number, coins: number): void {
    this.root.innerHTML = `
      <div class="hud">
        <div class="hud-chip level-chip"><small>Level</small><strong id="hud-level">${levelId}</strong></div>
        <div class="hud-chip blue count-chip"><small>Crowd</small><strong id="hud-count">${count}</strong></div>
        <div class="hud-chip gold"><small>Coins</small><strong id="hud-coins">${coins}</strong></div>
        <button class="pause-button" data-action="pause" aria-label="Pause"><span></span><span></span></button>
      </div>
      <div class="progress-wrap">
        <div class="progress-meta"><span>Start</span><span>Finish</span></div>
        <div class="progress"><div id="progress-fill"></div></div>
      </div>
      <div class="game-toast" id="game-toast"></div>
      <div class="screen-flash" id="screen-flash"></div>
    `;
    this.hudLevel = this.root.querySelector('#hud-level');
    this.hudCount = this.root.querySelector('#hud-count');
    this.hudCoins = this.root.querySelector('#hud-coins');
    this.progressFill = this.root.querySelector('#progress-fill');
    this.toastEl = this.root.querySelector('#game-toast');
    this.flashEl = this.root.querySelector('#screen-flash');
  }

  updateHud(levelId: number, count: number, coins: number, progress: number): void {
    if (this.hudLevel) this.hudLevel.textContent = String(levelId);
    if (this.hudCount) this.hudCount.textContent = String(count);
    if (this.hudCoins) this.hudCoins.textContent = String(coins);
    if (this.progressFill) this.progressFill.style.width = `${Math.round(progress * 100)}%`;
  }

  pulseHud(target: 'count' | 'coins' | 'level', tone: 'good' | 'bad' | 'neutral' = 'neutral'): void {
    const element = target === 'count' ? this.hudCount?.closest('.hud-chip') : target === 'coins' ? this.hudCoins?.closest('.hud-chip') : this.hudLevel?.closest('.hud-chip');
    if (!element) {
      return;
    }
    element.classList.remove('pulse-good', 'pulse-bad', 'pulse-neutral');
    void (element as HTMLElement).offsetWidth;
    element.classList.add(`pulse-${tone}`);
  }

  flash(tone: 'good' | 'bad' | 'warning'): void {
    if (!this.flashEl) {
      return;
    }
    this.flashEl.className = `screen-flash flash-${tone}`;
    void this.flashEl.offsetWidth;
    this.flashEl.classList.add('show');
  }

  toast(text: string, tone: 'good' | 'bad' | 'warning' | 'neutral' = 'neutral'): void {
    if (!this.toastEl) {
      return;
    }
    window.clearTimeout(this.toastTimer);
    this.toastEl.textContent = text;
    this.toastEl.className = `game-toast toast-${tone}`;
    void this.toastEl.offsetWidth;
    this.toastEl.classList.add('show');
    this.toastTimer = window.setTimeout(() => {
      this.toastEl?.classList.remove('show');
    }, 950);
  }

  showPause(): void {
    this.renderOverlay('pause', `
      <section class="menu-panel small-panel">
        <p class="eyebrow">Run Paused</p>
        <h2>Paused</h2>
        <div class="menu-actions">
          <button class="primary" data-action="resume">Resume</button>
          <button data-action="retry">Retry</button>
          <button data-action="main">Main Menu</button>
        </div>
      </section>
    `);
  }

  showWin(result: LevelResult): void {
    const stars = [0, 1, 2].map((index) => `<span class="star ${index < result.stars ? 'on' : ''}"></span>`).join('');
    this.renderOverlay('win', `
      <section class="menu-panel result-panel win-panel">
        <p class="eyebrow">Level Complete</p>
        <div class="star-row">${stars}</div>
        <div class="result-stats">
          <span><small>Remaining</small><strong>${result.remainingCrowd}</strong></span>
          <span><small>Coins</small><strong>${result.coinsEarned}</strong></span>
          <span><small>Score</small><strong>${result.score}</strong></span>
        </div>
        <div class="menu-actions">
          <button class="primary" data-action="next">Next Level</button>
          <button data-action="retry">Retry</button>
        </div>
      </section>
    `);
  }

  showLose(): void {
    this.renderOverlay('lose', `
      <section class="menu-panel result-panel lose-panel">
        <p class="eyebrow">Crowd Defeated</p>
        <h2>Game Over</h2>
        <div class="menu-actions">
          <button class="primary" data-action="retry">Retry</button>
          <button data-action="main">Main Menu</button>
        </div>
      </section>
    `);
  }

  private renderOverlay(screen: Screen, html: string): void {
    this.root.innerHTML = `<div class="overlay ${screen}">${html}</div>`;
  }

  private readonly handleClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>('button[data-action]');
    if (!button || button.disabled) {
      return;
    }
    const action = button.dataset.action ?? '';
    const level = Number(button.dataset.level ?? 0);
    this.events.emit('ui:action', { action, level });
  };

  private readonly handleInput = (event: Event): void => {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const setting = target.dataset.setting;
    if (!setting) {
      return;
    }
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value;
    this.events.emit('ui:setting', { setting, value });
  };
}
