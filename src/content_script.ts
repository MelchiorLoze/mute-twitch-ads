import AdMuter from './business/ad-muter';
import Logger from './utils/logger';

Logger.info('Loading content script...');
AdMuter.run();
Logger.info('Content script loaded.');
