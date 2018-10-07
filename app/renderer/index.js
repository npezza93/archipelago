import React from 'react'
import ReactDOM from 'react-dom'

const mountRoute = (route) => {
  ReactDOM.render(React.createElement(route), document.getElementById('app'))
}

if (window.location.hash === '#about') {
  import('@/about/about').then(about => mountRoute(about.default))
} else if (window.location.hash === '#visor') {
  import('@/visor/visor').then(visor => mountRoute(visor.default))
} else if (window.location.hash === '#settings') {
  // import('@/settings/settings').then(settings => mountRoute(settings.default))  
} else {
  import('@/app/app').then(app => mountRoute(app.default))
}
