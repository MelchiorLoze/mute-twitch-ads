import Logger from '../utils/Logger';
import AdMuter from './AdMuter';
import { sendMuteEvent, sendUnmuteEvent } from './soundToggle';

jest.mock('../utils/Logger');
const LoggerMock = jest.mocked(Logger);

jest.mock('./soundToggle');
const sendMuteEventMock = jest.mocked(sendMuteEvent);
const sendUnmuteEventMock = jest.mocked(sendUnmuteEvent);

const mockObserve = jest.fn();
global.MutationObserver = jest.fn().mockImplementation(callback => ({
  observe: mockObserve,
  disconnect: jest.fn(),
  callback,
}));

const AD_BANNER_HTML = `<span data-a-target="video-ad-label"></span>`;
const simulateAdAppearance = () => (document.body.innerHTML = AD_BANNER_HTML);

describe('AdMuter', () => {
  beforeEach(() => {
    (AdMuter as any).instance = undefined; // Reset singleton instance
    document.body.innerHTML = ''; // Clear body content
    jest.clearAllMocks(); // Clear all mocks
  });

  describe('singleton pattern', () => {
    it('returns the same instance on multiple calls', () => {
      const instance1 = (AdMuter as any).getInstance();
      const instance2 = (AdMuter as any).getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('isAdBannerPresent', () => {
    it('returns true when ad banner is present', () => {
      simulateAdAppearance();

      const result = (AdMuter as any).isAdBannerPresent();

      expect(result).toBe(true);
    });

    it('returns false when ad banner is not present', () => {
      const result = (AdMuter as any).isAdBannerPresent();

      expect(result).toBe(false);
    });
  });

  describe('toggleSoundIfNecessary', () => {
    it('mutes sound when ad appears', async () => {
      sendMuteEventMock.mockResolvedValue(true);
      const instance = (AdMuter as any).getInstance();

      simulateAdAppearance();
      await instance.toggleSoundIfNecessary();

      expect(LoggerMock.info).toHaveBeenCalledWith('Ad appeared');
      expect(sendMuteEventMock).toHaveBeenCalledTimes(1);
      expect(instance.wasMutedBeforeAd).toBe(false);
      expect(instance.isAdPlaying).toBe(true);
    });

    it('tracks if sound was already muted when ad appears', async () => {
      sendMuteEventMock.mockResolvedValue(false);
      const instance = (AdMuter as any).getInstance();

      simulateAdAppearance();
      await instance.toggleSoundIfNecessary();

      expect(sendMuteEventMock).toHaveBeenCalledTimes(1);
      expect(instance.wasMutedBeforeAd).toBe(true);
    });

    it('unmutes sound when ad disappears and sound was not muted before', async () => {
      const instance = (AdMuter as any).getInstance();
      instance.isAdPlaying = true;
      instance.wasMutedBeforeAd = false;

      await instance.toggleSoundIfNecessary();

      expect(LoggerMock.info).toHaveBeenCalledWith('Ad disappeared');
      expect(sendUnmuteEventMock).toHaveBeenCalledTimes(1);
      expect(instance.isAdPlaying).toBe(false);
    });

    it('does not unmute sound when ad disappears and sound was muted before', async () => {
      const instance = (AdMuter as any).getInstance();
      instance.isAdPlaying = true;
      instance.wasMutedBeforeAd = true;

      await instance.toggleSoundIfNecessary();

      expect(LoggerMock.info).toHaveBeenCalledWith('Ad disappeared');
      expect(LoggerMock.info).toHaveBeenCalledWith('Sound was muted before ad appeared, not unmuting');
      expect(sendUnmuteEventMock).not.toHaveBeenCalledTimes(1);
      expect(instance.isAdPlaying).toBe(false);
    });

    it('does not do anything when ad state has not changed', async () => {
      const instance = (AdMuter as any).getInstance();

      await instance.toggleSoundIfNecessary();

      expect(sendMuteEventMock).not.toHaveBeenCalledTimes(1);
      expect(sendUnmuteEventMock).not.toHaveBeenCalledTimes(1);
    });
  });

  describe('run', () => {
    it('initializes mutation observer and logs initialization', () => {
      AdMuter.run();

      expect(LoggerMock.info).toHaveBeenCalledWith('Initializing ad muter...');
      expect(LoggerMock.info).toHaveBeenCalledWith('Ad muter running');
      expect(MutationObserver).toHaveBeenCalledTimes(1);
      expect(mockObserve).toHaveBeenCalledWith(document.body, {
        childList: true,
        subtree: true,
      });
    });

    it('calls toggleSoundIfNecessary when childList mutations occur', async () => {
      const instance = (AdMuter as any).getInstance();
      const toggleSpy = jest.spyOn(instance, 'toggleSoundIfNecessary').mockResolvedValue(undefined);

      AdMuter.run();

      // Get the callback function passed to MutationObserver
      const observerCallback = (MutationObserver as jest.MockedClass<typeof MutationObserver>).mock.calls[0][0];

      // Simulate mutations with childList changes
      const mockMutations = [{ type: 'childList' }] as MutationRecord[];
      observerCallback(mockMutations, {} as MutationObserver);

      expect(toggleSpy).toHaveBeenCalledTimes(1);
    });

    it('does not call toggleSoundIfNecessary when no childList mutations occur', async () => {
      const instance = (AdMuter as any).getInstance();
      const toggleSpy = jest.spyOn(instance, 'toggleSoundIfNecessary').mockResolvedValue(undefined);

      AdMuter.run();

      // Get the callback function passed to MutationObserver
      const observerCallback = (MutationObserver as jest.MockedClass<typeof MutationObserver>).mock.calls[0][0];

      // Simulate mutations without childList changes
      const mockMutations = [{ type: 'attributes' }] as MutationRecord[];
      observerCallback(mockMutations, {} as MutationObserver);

      expect(toggleSpy).not.toHaveBeenCalledTimes(1);
    });
  });
});
