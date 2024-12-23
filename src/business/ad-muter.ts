import Logger from '../utils/logger';
import PlayerVolumeController from './player-volume-controller';

const AD_BANNER_SELECTOR = 'span[data-a-target="video-ad-label"]';

export default class AdMuter {
  private wasMutedBeforeAd: boolean = false;
  private isAdPlaying: boolean = false;

  private playerVolumeController: PlayerVolumeController;
  private static instance: AdMuter;

  private constructor() {
    this.playerVolumeController = PlayerVolumeController.getInstance();
  }

  private static getInstance(): AdMuter {
    if (!AdMuter.instance) AdMuter.instance = new AdMuter();
    return AdMuter.instance;
  }

  private static isAdBannerPresent(): boolean {
    return Boolean(document.body.querySelector<HTMLElement>(AD_BANNER_SELECTOR));
  }

  private toggleMuteIfNecessary(): void {
    const isAdPresent = AdMuter.isAdBannerPresent();
    const hasAdAppearedOrDisappeared = this.isAdPlaying !== isAdPresent;

    if (hasAdAppearedOrDisappeared) {
      if (isAdPresent) {
        Logger.info('Ad appeared');
        this.wasMutedBeforeAd = this.playerVolumeController.isMuted();
      } else {
        Logger.info('Ad disappeared');
      }

      if (!this.wasMutedBeforeAd) {
        if (isAdPresent) this.playerVolumeController.mute();
        else this.playerVolumeController.unmute();
      }
      this.isAdPlaying = isAdPresent;
    }
  }

  public static run(): void {
    const instance = AdMuter.getInstance();

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') instance.toggleMuteIfNecessary();
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}
