const {remote} = require('electron')
const React = require('react')

module.exports =
class Maximize extends React.Component {
  render() {
    return React.createElement(
      'maximize-button',
      {
        style: {
          '-webkit-app-region': 'no-drag',
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
          return remote.getCurrentWindow().maximize()
        }
      }
    )
  }
}
