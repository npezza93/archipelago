import React from 'react'
import ReactDOM from 'react-dom'

const mountRoute = (route) => {
  ReactDOM.render(React.createElement(route), document.getElementById('app'))
}

if (window.location.hash === '#about') {
  import('@/about/about').then(({default: about}) => mountRoute(about))
} else if (window.location.hash === '#settings') {
  import('@/settings/settings').then(({default: settings}) => mountRoute(settings))
} else if (window.location.hash === '#search') {
  import('@/search/search').then(({default: search}) => mountRoute(search))
} else {
  import('@/app/app').then(({default: app}) => mountRoute(app))
}
