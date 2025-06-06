import AdMuter from './business/ad-muter';
import PlayerVolumeController from './business/player-volume-controller';
import Logger from './utils/logger';

Logger.info('Loading content script...');

const observer = new MutationObserver(() => {
  if (PlayerVolumeController.isMuteButtonPresent()) {
    Logger.info('Player loaded');
    AdMuter.run();
    observer.disconnect();
  }
});

observer.observe(document, {
  childList: true,
  subtree: true,
});

Logger.info('Content script loaded');
Logger.info('Waiting for player to load...');
