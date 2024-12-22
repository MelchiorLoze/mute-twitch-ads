class TwitchAdMuter {
  private static instance: TwitchAdMuter;

  private wasMutedBeforeAd: boolean = false;
  private muteButton: HTMLButtonElement;
  private isAdPresent: boolean;

  private constructor() {
    this.muteButton = TwitchAdMuter.getMuteButton();
    this.isAdPresent = TwitchAdMuter.isAdBannerPresent();
  }

  public static getInstance(): TwitchAdMuter {
    if (!TwitchAdMuter.instance) TwitchAdMuter.instance = new TwitchAdMuter();
    return TwitchAdMuter.instance;
  }

  private static getMuteButton(): HTMLButtonElement {
    const muteButton = document.body.querySelector<HTMLButtonElement>(
      'button[data-a-target="player-mute-unmute-button"]',
    );
    if (!muteButton) throw new Error('Mute button not found');
    return muteButton;
  }

  private isPlayerMuted(): boolean {
    return Boolean(this.muteButton.getAttribute('aria-label')?.startsWith('Unmute'));
  }

  private mutePlayer(): void {
    if (!this.isPlayerMuted()) this.muteButton.click();
  }

  private unmutePlayer(): void {
    if (this.isPlayerMuted()) this.muteButton.click();
  }

  private static isAdBannerPresent(): boolean {
    return Boolean(document.body.querySelector<HTMLElement>('span[data-a-target="video-ad-label"]'));
  }

  private initObserver(): void {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          const isAdBannerPresent = TwitchAdMuter.isAdBannerPresent();

          if (isAdBannerPresent && !this.isAdPresent) {
            this.isAdPresent = true;
            this.wasMutedBeforeAd = this.isPlayerMuted();
            if (!this.wasMutedBeforeAd) this.mutePlayer();
          }

          if (!isAdBannerPresent && this.isAdPresent) {
            this.isAdPresent = false;
            if (!this.wasMutedBeforeAd) this.unmutePlayer();
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  public run(): void {
    this.initObserver();
    console.log('Mute Twitch Ads content script loaded');
  }
}

TwitchAdMuter.getInstance().run();
