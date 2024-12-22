const MUTE_BUTTON_SELECTOR = 'button[data-a-target="player-mute-unmute-button"]';
const VOLUME_SLIDER_SELECTOR = 'input[data-a-target="player-volume-slider"]';
const AD_BANNER_SELECTOR = 'span[data-a-target="video-ad-label"]';

class TwitchAdMuter {
  private static instance: TwitchAdMuter;

  private wasMutedBeforeAd: boolean = false;
  private wasAdPresent: boolean;
  private muteButton: HTMLButtonElement;

  private constructor() {
    this.wasAdPresent = TwitchAdMuter.isAdBannerPresent();
    this.muteButton = TwitchAdMuter.getMuteButton();
  }

  public static getInstance(): TwitchAdMuter {
    if (!TwitchAdMuter.instance) TwitchAdMuter.instance = new TwitchAdMuter();
    return TwitchAdMuter.instance;
  }

  private static getMuteButton(): HTMLButtonElement {
    const muteButton = document.body.querySelector<HTMLButtonElement>(MUTE_BUTTON_SELECTOR);
    if (!muteButton) throw new Error('Mute button not found');
    return muteButton;
  }

  private isPlayerMuted(): boolean {
    const volumeSlider = document.body.querySelector<HTMLInputElement>(VOLUME_SLIDER_SELECTOR);
    if (!volumeSlider) throw new Error('Volume slider not found');

    return Boolean(volumeSlider.value === '0');
  }

  private mutePlayer(): void {
    if (!this.isPlayerMuted()) this.muteButton.click();
  }

  private unmutePlayer(): void {
    if (this.isPlayerMuted()) this.muteButton.click();
  }

  private static isAdBannerPresent(): boolean {
    return Boolean(document.body.querySelector<HTMLElement>(AD_BANNER_SELECTOR));
  }

  private toggleMuteIfNecessary(): void {
    const isAdBannerPresent = TwitchAdMuter.isAdBannerPresent();
    const hasAdAppearedOrDisappeared = this.wasAdPresent !== isAdBannerPresent;

    if (hasAdAppearedOrDisappeared) {
      this.wasAdPresent = isAdBannerPresent;
      if (isAdBannerPresent) this.wasMutedBeforeAd = this.isPlayerMuted();
      if (!this.wasMutedBeforeAd) {
        if (isAdBannerPresent) this.mutePlayer();
        else this.unmutePlayer();
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
