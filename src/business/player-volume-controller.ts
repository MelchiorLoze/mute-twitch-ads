import { MuteTwitchAdsError } from '../utils/error';
import Logger from '../utils/logger';

const MUTE_BUTTON_SELECTOR = 'button[data-a-target="player-mute-unmute-button"]';
const VOLUME_SLIDER_SELECTOR = 'input[data-a-target="player-volume-slider"]';

export default class PlayerVolumeController {
  private static instance: PlayerVolumeController;

  private muteButton: HTMLButtonElement;
  private volumeSlider: HTMLInputElement;

  private constructor() {
    this.muteButton = PlayerVolumeController.getMuteButton();
    this.volumeSlider = PlayerVolumeController.getVolumeSlider();
    Logger.info('Volume controls initialized');
  }

  public static getInstance(): PlayerVolumeController {
    if (!PlayerVolumeController.instance) PlayerVolumeController.instance = new PlayerVolumeController();
    return PlayerVolumeController.instance;
  }

  public static isMuteButtonPresent(): boolean {
    return Boolean(document.body.querySelector<HTMLButtonElement>(MUTE_BUTTON_SELECTOR));
  }

  private static getMuteButton(): HTMLButtonElement {
    const muteButton = document.body.querySelector<HTMLButtonElement>(MUTE_BUTTON_SELECTOR);
    if (!muteButton) throw new MuteTwitchAdsError('Mute button not found');
    return muteButton;
  }

  private static getVolumeSlider(): HTMLInputElement {
    const volumeSlider = document.body.querySelector<HTMLInputElement>(VOLUME_SLIDER_SELECTOR);
    if (!volumeSlider) throw new MuteTwitchAdsError('Volume slider not found');
    return volumeSlider;
  }

  public mute(): void {
    Logger.info('Muting player');
    if (!this.isMuted()) this.muteButton.click();
  }

  public unmute(): void {
    Logger.info('Unmuting player');
    if (this.isMuted()) this.muteButton.click();
  }

  public isMuted(): boolean {
    return Boolean(this.volumeSlider.value === '0');
  }
}
