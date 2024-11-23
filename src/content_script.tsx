const getMuteButton = (): HTMLButtonElement => {
  const muteButton = document.body.querySelector<HTMLButtonElement>(
    'button[data-a-target="player-mute-unmute-button"]',
  );
  if (!muteButton) throw new Error('Mute button not found');
  return muteButton;
};

const isPlayerMuted = () => {
  const muteButton = getMuteButton();
  return muteButton.getAttribute('aria-label')?.startsWith('Unmute');
};

const mutePlayer = () => {
  const muteButton = getMuteButton();
  if (!isPlayerMuted()) muteButton.click();
};

const unmutePlayer = () => {
  const muteButton = getMuteButton();
  if (isPlayerMuted()) muteButton.click();
};

const isNodeAdIndicator = (node: Node) => {
  return true; // TODO: Add condition to check if an ad was added
};

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        if (isNodeAdIndicator(node)) mutePlayer();
      });
      mutation.removedNodes.forEach(node => {
        if (isNodeAdIndicator(node)) unmutePlayer();
      });
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

console.log('Mute Twitch Ads content script loaded');
