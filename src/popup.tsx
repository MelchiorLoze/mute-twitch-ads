import React from 'react';
import { createRoot } from 'react-dom/client';

const Popup = () => {
  return <h1>Mute Twitch Ads</h1>;
};

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
