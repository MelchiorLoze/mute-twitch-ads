import MuteTwitchAdsError from '../utils/error';

const MUTE_BUTTON_SELECTOR = 'button[data-a-target="player-mute-unmute-button"]';
const VOLUME_SLIDER_SELECTOR = 'input[data-a-target="player-volume-slider"]';

export default class PlayerVolumeController {
  private static instance: PlayerVolumeController;

  private muteButton: HTMLButtonElement;
  private volumeSlider: HTMLInputElement;

  private constructor() {
    this.muteButton = PlayerVolumeController.getMuteButton();
    this.volumeSlider = PlayerVolumeController.getVolumeSlider();
  }

  public static getInstance(): PlayerVolumeController {
    if (!PlayerVolumeController.instance) PlayerVolumeController.instance = new PlayerVolumeController();
    return PlayerVolumeController.instance;
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
    if (!this.isMuted()) this.muteButton.click();
  }

  public unmute(): void {
    if (this.isMuted()) this.muteButton.click();
  }

  public isMuted(): boolean {
    return Boolean(this.volumeSlider.value === '0');
  }
}
