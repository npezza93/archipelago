const {activeWindow} = require('electron-util')
const {Component, createElement} = require('react')

module.exports =
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
