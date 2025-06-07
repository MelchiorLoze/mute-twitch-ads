import { MuteTwitchAdsError } from '../utils/errors';
import Logger from '../utils/Logger';
import { sendMuteEvent, sendUnmuteEvent, startSoundToggleEventListener } from './soundToggle';

jest.mock('../utils/Logger');
const LoggerMock = jest.mocked(Logger);

// Mock Chrome APIs
const mockSendMessage = jest.fn();
const mockAddListener = jest.fn();
const mockTabsUpdate = jest.fn();

global.chrome = {
  runtime: {
    sendMessage: mockSendMessage,
    onMessage: {
      addListener: mockAddListener,
    },
  },
  tabs: {
    update: mockTabsUpdate,
  },
} as any;

describe('soundToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMuteEvent', () => {
    it('sends mute message and returns response', async () => {
      mockSendMessage.mockResolvedValue(true);

      const result = await sendMuteEvent();

      expect(mockSendMessage).toHaveBeenCalledWith('muteSound');
      expect(result).toBe(true);
    });

    it('returns false when mute fails', async () => {
      mockSendMessage.mockResolvedValue(false);

      const result = await sendMuteEvent();

      expect(result).toBe(false);
    });
  });

  describe('sendUnmuteEvent', () => {
    it('sends unmute message and returns response', async () => {
      mockSendMessage.mockResolvedValue(true);

      const result = await sendUnmuteEvent();

      expect(mockSendMessage).toHaveBeenCalledWith('unmuteSound');
      expect(result).toBe(true);
    });

    it('returns false when unmute fails', async () => {
      mockSendMessage.mockResolvedValue(false);

      const result = await sendUnmuteEvent();

      expect(result).toBe(false);
    });
  });

  describe('startSoundToggleEventListener', () => {
    it('logs initialization and adds event listener', () => {
      startSoundToggleEventListener();

      expect(LoggerMock.info).toHaveBeenCalledWith('Starting sound control event listener...');
      expect(mockAddListener).toHaveBeenCalledTimes(1);
    });

    describe('event listener', () => {
      let eventListener: (
        event: string,
        sender: chrome.runtime.MessageSender,
        sendResponse: (success: boolean) => void,
      ) => void;

      beforeEach(() => {
        startSoundToggleEventListener();
        eventListener = mockAddListener.mock.calls[0][0];
      });

      it('throws error when tab ID is not present', () => {
        const sender = { tab: undefined } as chrome.runtime.MessageSender;
        const sendResponse = jest.fn();

        expect(() => eventListener('muteSound', sender, sendResponse)).toThrow(
          new MuteTwitchAdsError('Tab ID is not present in the event sender'),
        );
      });

      it('handles mute event for unmuted tab', () => {
        const sender = {
          tab: { id: 123, mutedInfo: { muted: false } },
        } as chrome.runtime.MessageSender;
        const sendResponse = jest.fn();

        eventListener('muteSound', sender, sendResponse);

        expect(LoggerMock.info).toHaveBeenCalledWith("Received event 'muteSound' from tab 123");
        expect(LoggerMock.info).toHaveBeenCalledWith('Muting tab sound');
        expect(mockTabsUpdate).toHaveBeenCalledWith(123, { muted: true });
        expect(sendResponse).toHaveBeenCalledWith(true);
      });

      it('handles mute event for already muted tab', () => {
        const sender = {
          tab: { id: 123, mutedInfo: { muted: true } },
        } as chrome.runtime.MessageSender;
        const sendResponse = jest.fn();

        eventListener('muteSound', sender, sendResponse);

        expect(mockTabsUpdate).toHaveBeenCalledWith(123, { muted: true });
        expect(sendResponse).toHaveBeenCalledWith(false);
      });

      it('handles unmute event for muted tab', () => {
        const sender = {
          tab: { id: 456, mutedInfo: { muted: true } },
        } as chrome.runtime.MessageSender;
        const sendResponse = jest.fn();

        eventListener('unmuteSound', sender, sendResponse);

        expect(LoggerMock.info).toHaveBeenCalledWith("Received event 'unmuteSound' from tab 456");
        expect(LoggerMock.info).toHaveBeenCalledWith('Unmuting tab sound');
        expect(mockTabsUpdate).toHaveBeenCalledWith(456, { muted: false });
        expect(sendResponse).toHaveBeenCalledWith(true);
      });

      it('handles unmute event for already unmuted tab', () => {
        const sender = {
          tab: { id: 456, mutedInfo: { muted: false } },
        } as chrome.runtime.MessageSender;
        const sendResponse = jest.fn();

        eventListener('unmuteSound', sender, sendResponse);

        expect(mockTabsUpdate).toHaveBeenCalledWith(456, { muted: false });
        expect(sendResponse).toHaveBeenCalledWith(false);
      });

      it('handles tab with undefined mutedInfo', () => {
        const sender = {
          tab: { id: 789, mutedInfo: undefined },
        } as chrome.runtime.MessageSender;
        const sendResponse = jest.fn();

        eventListener('muteSound', sender, sendResponse);

        expect(mockTabsUpdate).toHaveBeenCalledWith(789, { muted: true });
        expect(sendResponse).toHaveBeenCalledWith(true);
      });

      it('throws error for unknown message type', () => {
        const sender = {
          tab: { id: 123, mutedInfo: { muted: false } },
        } as chrome.runtime.MessageSender;
        const sendResponse = jest.fn();

        expect(() => eventListener('unknownEvent' as any, sender, sendResponse)).toThrow(
          new MuteTwitchAdsError('Unknown message type: unknownEvent'),
        );
      });
    });
  });
});
