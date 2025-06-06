import AdMuter from './business/AdMuter';
import Logger from './utils/Logger';

Logger.info('Loading content script...');

AdMuter.run();

Logger.info('Content script loaded');
