import React from 'react'
import ReactDOM from 'react-dom'

const mountRoute = (route) => {
  ReactDOM.render(React.createElement(route), document.getElementById('app'))
}

if (window.location.hash === '#about') {
  import('@/about/about').then(about => mountRoute(about.default))
} else {
  import('@/app/app').then(app => mountRoute(app.default))
}
