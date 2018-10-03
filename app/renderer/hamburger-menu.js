const {
  Component,
  createElement,
} = require('react');
const {
  platform,
} = require('electron-util');
const ipc = require('electron-better-ipc');

module.exports = class HamburgerMenu extends Component {
  render() {
    return platform({
      macos: null,
      default: createElement(
        'hamburger-menu', {
          onClick(event) {
            const {
              right,
              bottom,
            } = event.currentTarget.getBoundingClientRect();
            ipc.callMain('open-hamburger-menu', {
              x: right,
              y: bottom,
            });
          },
        },
        createElement('div'),
        createElement('div'),
        createElement('div'),
      ),
    });
  }
};
