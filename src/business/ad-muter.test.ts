import Logger from '../utils/logger';
import AdMuter from './ad-muter';
import PlayerVolumeController from './player-volume-controller';

jest.mock('../utils/logger');

const playerVolumeControllerMock = {
  mute: jest.fn(),
  unmute: jest.fn(),
  isMuted: jest.fn(),
};
jest
  .spyOn(PlayerVolumeController, 'getInstance')
  .mockReturnValue(playerVolumeControllerMock as unknown as PlayerVolumeController);

const mutationObserverMock = jest.fn();
global.MutationObserver = jest.fn(cb => {
  mutationObserverMock.mockImplementation(cb);
  return { observe: jest.fn(), disconnect: jest.fn(), takeRecords: jest.fn() };
});

const AD_BANNER_HTML = `<span data-a-target="video-ad-label"></span>`;

describe('AdMuter', () => {
  beforeEach(() => {
    (AdMuter as any).instance = undefined;
    playerVolumeControllerMock.isMuted.mockReturnValue(false);
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should mute when ad appears and unmute when ad disappears', () => {
    AdMuter.run();
    const mutationObserverCallback = (MutationObserver as any).mock.calls[0][0];

    // Simulate ad appearing
    document.body.innerHTML = AD_BANNER_HTML;
    mutationObserverCallback([{ type: 'childList' }]);

    expect(Logger.info).toHaveBeenCalledWith('Ad appeared');
    expect(playerVolumeControllerMock.mute).toHaveBeenCalled();

    // Simulate ad disappearing
    document.body.innerHTML = '';
    mutationObserverCallback([{ type: 'childList' }]);

    expect(Logger.info).toHaveBeenCalledWith('Ad disappeared');
    expect(playerVolumeControllerMock.unmute).toHaveBeenCalled();
  });

  it('should not unmute if it was muted before ad', () => {
    playerVolumeControllerMock.isMuted.mockReturnValue(true);

    AdMuter.run();
    const mutationObserverCallback = (MutationObserver as any).mock.calls[0][0];

    // Simulate ad appearing
    document.body.innerHTML = AD_BANNER_HTML;
    mutationObserverCallback([{ type: 'childList' }]);

    expect(Logger.info).toHaveBeenCalledWith('Ad appeared');
    expect(playerVolumeControllerMock.mute).not.toHaveBeenCalled();

    // Simulate ad disappearing
    document.body.innerHTML = '';
    mutationObserverCallback([{ type: 'childList' }]);

    expect(Logger.info).toHaveBeenCalledWith('Ad disappeared');
    expect(playerVolumeControllerMock.unmute).not.toHaveBeenCalled();
  });

  it('should not unmute if ad does not dissapear', () => {
    AdMuter.run();
    const mutationObserverCallback = (MutationObserver as any).mock.calls[0][0];

    // Simulate ad appearing
    document.body.innerHTML = AD_BANNER_HTML;
    mutationObserverCallback([{ type: 'childList' }]);

    expect(Logger.info).toHaveBeenCalledWith('Ad appeared');
    expect(playerVolumeControllerMock.mute).toHaveBeenCalled();

    // Simulate no change in ad state
    mutationObserverCallback([{ type: 'childList' }]);

    expect(Logger.info).toHaveBeenCalledTimes(1);
    expect(playerVolumeControllerMock.mute).toHaveBeenCalledTimes(1);
  });

  it('should not mute if ad does not appear', () => {
    AdMuter.run();
    const mutationObserverCallback = (MutationObserver as any).mock.calls[0][0];

    // Simulate no change in ad state
    mutationObserverCallback([{ type: 'childList' }]);

    expect(Logger.info).not.toHaveBeenCalled();
    expect(playerVolumeControllerMock.mute).not.toHaveBeenCalled();
  });
});
