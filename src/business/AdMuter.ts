import Logger from '../utils/Logger';
import { sendMuteEvent, sendUnmuteEvent } from './soundToggle';

const AD_BANNER_SELECTOR = 'span[data-a-target="video-ad-label"]';

export default class AdMuter {
  private wasMutedBeforeAd: boolean = false;
  private isAdPlaying: boolean = false;

  private static instance: AdMuter;

  private static getInstance(): AdMuter {
    if (!AdMuter.instance) AdMuter.instance = new AdMuter();
    return AdMuter.instance;
  }

  private static isAdBannerPresent(): boolean {
    return Boolean(document.body.querySelector<HTMLElement>(AD_BANNER_SELECTOR));
  }

  private async toggleSoundIfNecessary(): Promise<void> {
    const isAdPresent = AdMuter.isAdBannerPresent();
    const hasAdAppearedOrDisappeared = this.isAdPlaying !== isAdPresent;

    if (hasAdAppearedOrDisappeared) {
      if (isAdPresent) {
        Logger.info('Ad appeared');
        const success = await sendMuteEvent();
        this.wasMutedBeforeAd = !success;
      } else {
        Logger.info('Ad disappeared');
        if (!this.wasMutedBeforeAd) sendUnmuteEvent();
        else Logger.info('Sound was muted before ad appeared, not unmuting');
      }

      this.isAdPlaying = isAdPresent;
    }
  }

  public static run(): void {
    Logger.info('Initializing ad muter...');
    const instance = AdMuter.getInstance();

    new MutationObserver(mutations => {
      if (mutations.some(mutation => mutation.type === 'childList')) instance.toggleSoundIfNecessary();
    }).observe(document.body, {
      childList: true,
      subtree: true,
    });

    Logger.info('Ad muter running');
  }
}
