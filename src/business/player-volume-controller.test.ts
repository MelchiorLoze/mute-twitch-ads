import Logger from '../utils/logger';
import PlayerVolumeController from './player-volume-controller';

jest.mock('../utils/logger');

document.body.innerHTML =
  '<button data-a-target="player-mute-unmute-button"></button><input data-a-target="player-volume-slider" value="100">';

const muteButton = document.querySelector<HTMLButtonElement>('button')!;
const volumeSlider = document.querySelector<HTMLInputElement>('input')!;

function setVolumeTo(value: string): void {
  volumeSlider.value = value;
}

const mockMuteButtonClick = jest.spyOn(muteButton, 'click');

describe('PlayerVolumeController', () => {
  beforeEach(() => {
    (PlayerVolumeController as any).instance = undefined;
    setVolumeTo('100');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('mute()', () => {
    it('should mute player', () => {
      PlayerVolumeController.getInstance().mute();

      expect(mockMuteButtonClick).toHaveBeenCalledTimes(1);
      expect(Logger.info).toHaveBeenCalledWith('Muting player');
    });

    it('should not mute player if it is already muted', () => {
      setVolumeTo('0');

      PlayerVolumeController.getInstance().mute();

      expect(mockMuteButtonClick).not.toHaveBeenCalled();
      expect(Logger.info).toHaveBeenCalledWith('Muting player');
    });
  });

  describe('unmute()', () => {
    it('should unmute player', () => {
      setVolumeTo('0');

      PlayerVolumeController.getInstance().unmute();

      expect(mockMuteButtonClick).toHaveBeenCalledTimes(1);
      expect(Logger.info).toHaveBeenCalledWith('Unmuting player');
    });

    it('should not unmute player if it is not muted', () => {
      PlayerVolumeController.getInstance().unmute();

      expect(mockMuteButtonClick).not.toHaveBeenCalled();
      expect(Logger.info).toHaveBeenCalledWith('Unmuting player');
    });
  });

  describe('isMuted()', () => {
    it('should return false if player is not muted', () => {
      expect(PlayerVolumeController.getInstance().isMuted()).toBe(false);
    });

    it('should return true if player is muted', () => {
      setVolumeTo('0');

      expect(PlayerVolumeController.getInstance().isMuted()).toBe(true);
    });
  });
});
