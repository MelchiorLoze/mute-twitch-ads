class TwitchAdMuter {
  private static instance: TwitchAdMuter;
  private wasMutedBeforeAd: boolean = false;
  private muteButton: HTMLButtonElement;

  private constructor() {
    this.muteButton = TwitchAdMuter.getMuteButton();
  }

  public static getInstance(): TwitchAdMuter {
    if (!TwitchAdMuter.instance)
      TwitchAdMuter.instance = new TwitchAdMuter();
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
    return !!this.muteButton.getAttribute('aria-label')?.startsWith('Unmute');
  }

  private mutePlayer(): void {
    if (!this.isPlayerMuted()) this.muteButton.click();
  }

  private unmutePlayer(): void {
    if (this.isPlayerMuted()) this.muteButton.click();
  }

  private isNodeAdIndicator(node: Node): boolean {
    return true; // TODO: Add condition to check if an ad was added
  }

  private initObserver(): void {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (this.isNodeAdIndicator(node)) {
              this.wasMutedBeforeAd = this.isPlayerMuted();
              this.mutePlayer();
            }
          });
          mutation.removedNodes.forEach(node => {
            if (this.isNodeAdIndicator(node) && !this.wasMutedBeforeAd) {
              this.unmutePlayer();
            }
          });
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
