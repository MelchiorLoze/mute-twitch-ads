export default class MuteTwitchAdsError extends Error {
  constructor(message: string) {
    super(`Mute Twitch Ads: ${message}`);
  }
}
