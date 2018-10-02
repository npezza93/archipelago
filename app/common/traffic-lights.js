const {Component, createElement} = require('react')
const {platform, activeWindow} = require('electron-util')

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

class Maximize extends Component {
  render() {
    return createElement(
      'maximize-button',
      {
        style: {
          WebkitAppRegion: 'no-drag',
          flexDirection: 'column',
          justifyContent: 'center',
          display: 'flex',
          height: '12px',
          width: '12px',
          right: '61px',
          top: '14px',
          position: 'fixed',
          zIndex: 4,
          border: '#000 1px solid',
          filter: 'invert(20%)',
          cursor: 'pointer'
        },
        onClick() {
          activeWindow().maximize()
        }
      }
    )
  }
}

class Close extends Component {
  render() {
    return createElement(
      'close-button',
      {
        style: {
          WebkitAppRegion: 'no-drag',
          height: '16px',
          width: '16px',
          right: '13px',
          top: '14px',
          position: 'fixed',
          zIndex: 4,
          filter: 'invert(20%)',
          cursor: 'pointer'
        },
        onClick() {
          activeWindow().close()
        }
      },
      createElement(
        'div',
        {
          style: {
            height: '1px',
            position: 'absolute',
            width: '20px',
            top: '7px',
            left: '-2px',
            background: '#000',
            transform: 'rotate(45deg)'
          }
        }
      ),
      createElement(
        'div',
        {
          style: {
            height: '1px',
            position: 'absolute',
            width: '20px',
            top: '7px',
            left: '-2px',
            background: '#000',
            transform: 'rotate(135deg)'
          }
        }
      )
    )
  }
}

module.exports =
class TrafficLights extends Component {
  render() {
    return platform({
      macos: null,
      default: createElement(
        'div',
        {},
        createElement(Minimize), createElement(Maximize), createElement(Close)
      )
    })
  }
}
