const { remote } = require('electron');

if (process.platform !== 'darwin') {
  const React = require('react');
  const ReactDOM = require('react-dom');
  const TrafficLights = require('../traffic_lights');

  document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
      React.createElement(TrafficLights),
      document.querySelector('#traffic-lights')
    );
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#version').innerText = `v${remote.app.getVersion()}`;
});
