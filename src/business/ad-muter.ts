import Logger from '../utils/logger';
import PlayerVolumeController from './player-volume-controller';

const AD_BANNER_SELECTOR = 'span[data-a-target="video-ad-label"]';

export default class AdMuter {
  private static instance: AdMuter;

  private wasMutedBeforeAd: boolean = false;
  private wasAdPresent: boolean;
  private playerVolumeController: PlayerVolumeController;

  private constructor() {
    this.wasAdPresent = AdMuter.isAdBannerPresent();
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
    const isAdBannerPresent = AdMuter.isAdBannerPresent();
    const hasAdAppearedOrDisappeared = this.wasAdPresent !== isAdBannerPresent;

    if (hasAdAppearedOrDisappeared) {
      if (isAdBannerPresent) {
        Logger.info('Ad appeared');
        this.wasMutedBeforeAd = this.playerVolumeController.isMuted();
      } else {
        Logger.info('Ad disappeared');
      }

      if (!this.wasMutedBeforeAd) {
        if (isAdBannerPresent) this.playerVolumeController.mute();
        else this.playerVolumeController.unmute();
      }
      this.wasAdPresent = isAdBannerPresent;
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
