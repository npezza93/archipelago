const {activeWindow} = require('electron-util')
const {Component, createElement} = require('react')

module.exports =
class Minimize extends Component {
  render() {
    return createElement(
      'minimize-button',
      {
        style: {
          WebkitAppRegion: 'no-drag',
          flexDirection: 'column',
          justifyContent: 'center',
          display: 'flex',
          height: '16px',
          width: '16px',
          right: '113px',
          top: '14px',
          position: 'fixed',
          zIndex: 4,
          filter: 'invert(20%)',
          cursor: 'pointer'
        },
        onClick() {
          return activeWindow().minimize()
        }
      },
      createElement('div', {style: {height: '1px', background: '#000'}})
    )
  }
}
