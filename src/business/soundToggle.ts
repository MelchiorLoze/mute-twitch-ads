import { MuteTwitchAdsError } from '../utils/errors';
import Logger from '../utils/Logger';

const mute = (tabId: number): void => void chrome.tabs.update(tabId, { muted: true });
const unmute = (tabId: number): void => void chrome.tabs.update(tabId, { muted: false });

type SoundControlEvent = 'muteSound' | 'unmuteSound';

export const sendMuteEvent = async (): Promise<boolean> =>
  await chrome.runtime.sendMessage<SoundControlEvent, boolean>('muteSound');
export const sendUnmuteEvent = async (): Promise<boolean> =>
  await chrome.runtime.sendMessage<SoundControlEvent, boolean>('unmuteSound');

export const startSoundToggleEventListener = (): void => {
  Logger.info('Starting sound control event listener...');

  chrome.runtime.onMessage.addListener(
    (event: SoundControlEvent, sender: chrome.runtime.MessageSender, sendResponse: (success: boolean) => void) => {
      const tabId = sender.tab?.id;
      if (!tabId) throw new MuteTwitchAdsError('Tab ID is not present in the event sender');

      const isMuted = sender.tab?.mutedInfo?.muted || false;

      Logger.info(`Received event '${event}' from tab ${tabId}`);
      switch (event) {
        case 'muteSound':
          Logger.info('Muting tab sound');
          mute(tabId);
          sendResponse(!isMuted);
          break;
        case 'unmuteSound':
          Logger.info('Unmuting tab sound');
          unmute(tabId);
          sendResponse(isMuted);
          break;
        default:
          throw new MuteTwitchAdsError(`Unknown message type: ${event}`);
      }
    },
  );
};
