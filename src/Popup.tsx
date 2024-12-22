import React from 'react';
import { createRoot } from 'react-dom/client';

const Popup = () => {
  return (
    <a href="https://github.com/MelchiorLoze/mute-twitch-ads" target="_blank">
      Github
    </a>
  );
};

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
