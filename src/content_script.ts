const MUTE_BUTTON_SELECTOR = 'button[data-a-target="player-mute-unmute-button"]';
const VOLUME_SLIDER_SELECTOR = 'input[data-a-target="player-volume-slider"]';
const AD_BANNER_SELECTOR = 'span[data-a-target="video-ad-label"]';

class MuteTwitchAdsError extends Error {
  constructor(message: string) {
    super(`Mute Twitch Ads: ${message}`);
  }
}

class PlayerVolumeController {
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

class TwitchAdMuter {
  private static instance: TwitchAdMuter;

  private wasMutedBeforeAd: boolean = false;
  private wasAdPresent: boolean;
  private playerVolumeController: PlayerVolumeController;

  private constructor() {
    this.wasAdPresent = TwitchAdMuter.isAdBannerPresent();
    this.playerVolumeController = PlayerVolumeController.getInstance();
  }

  public static getInstance(): TwitchAdMuter {
    if (!TwitchAdMuter.instance) TwitchAdMuter.instance = new TwitchAdMuter();
    return TwitchAdMuter.instance;
  }

  private static isAdBannerPresent(): boolean {
    return Boolean(document.body.querySelector<HTMLElement>(AD_BANNER_SELECTOR));
  }

  private toggleMuteIfNecessary(): void {
    const isAdBannerPresent = TwitchAdMuter.isAdBannerPresent();
    const hasAdAppearedOrDisappeared = this.wasAdPresent !== isAdBannerPresent;

    if (hasAdAppearedOrDisappeared) {
      this.wasAdPresent = isAdBannerPresent;
      if (isAdBannerPresent) this.wasMutedBeforeAd = this.playerVolumeController.isMuted();
      if (!this.wasMutedBeforeAd) {
        if (isAdBannerPresent) this.playerVolumeController.mute();
        else this.playerVolumeController.unmute();
      }
    }
  }

  public run(): void {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') this.toggleMuteIfNecessary();
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log('Mute Twitch Ads content script loaded');
  }
}

TwitchAdMuter.getInstance().run();
