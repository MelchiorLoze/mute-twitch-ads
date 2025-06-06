import { startSoundToggleEventListener } from './business/soundToggle';
import Logger from './utils/Logger';

Logger.info('Loading background script...');

startSoundToggleEventListener();

Logger.info('Background script loaded');
