/* global window */

const {ipcRenderer} = require('electron')
const React = require('react')

const Tab = require('../sessions/tab')
const TrafficLights = require('../traffic-lights/all')
const PaneList = require('./pane-list')
const TabList = require('./tab-list')
const HamburgerMenu = require('./hamburger-menu')

module.exports =
class App extends React.Component {
  constructor(props) {
    super(props)

    this.pref = this.props.pref()
    const initialTab = new Tab(this.pref)

    this.state = {tabs: [initialTab], currentTabId: initialTab.id}

    ipcRenderer.on('split-horizontal', () => this.split('horizontal'))
    ipcRenderer.on('split-vertical', () => this.split('vertical'))
    ipcRenderer.on('new-tab', () => {
      if (!this.props.profileManager.get('singleTabMode')) {
        this.addTab()
      }
    })
    ipcRenderer.on('close-current-tab', () => {
      this.removeTab(this.state.currentTabId)
    })
  }

  render() {
    return React.createElement(
      'archipelago-app', {
        class: process.platform,
        'data-single-tab-mode': (this.props.profileManager.get('singleTabMode') ? '' : undefined)
      },
      React.createElement(HamburgerMenu, {key: 'hamburger'}),
      React.createElement(
        TabList, {
          key: 'tabs',
          tabs: this.state.tabs,
          currentTabId: this.state.currentTabId,
          selectTab: this.selectTab.bind(this),
          removeTab: this.removeTab.bind(this)
        }
      ),
      React.createElement(TrafficLights, {key: 'traffic-lights'}),
      React.createElement(
        PaneList, {
          key: 'panes',
          tabs: this.state.tabs,
          currentTabId: this.state.currentTabId,
          currentSessionId: this.state.currentSessionId,
          changeTitle: this.changeTitle.bind(this),
          markUnread: this.markUnread.bind(this),
          removeSession: this.removeSession.bind(this),
          selectSession: this.selectSession.bind(this)
        }
      )
    )
  }

  componentWillUnmount() {
    this.state.tabs.map(tab => tab.kill())
    this.pref.dispose()
  }

  componentDidUpdate() {
    const currentSession = this.currentTab().find(
      this.currentTab().root, this.state.currentSessionId
    )

    if (currentSession && !currentSession.isFocused) {
      return currentSession.xterm.focus()
    }
  }

  currentTab(id) {
    let currentTab = null

    for (const tab of this.state.tabs) {
      if (tab.id === (id || this.state.currentTabId)) {
        currentTab = tab
      }
    }

    return currentTab
  }

  selectTab(e, id) {
    e.preventDefault()
    let session = null
    const tabs = this.state.tabs.map(tab => {
      if (tab.id === id) {
        tab.isUnread = false
        const {root} = tab
        session = tab.find(root, this.state.currentSessionId)
        if (!session) {
          session = tab.focusableSession()
        }
      }

      return tab
    })

    return this.setState({tabs, currentTabId: id, currentSessionId: session.id})
  }

  selectSession(id) {
    return this.setState({currentSessionId: id})
  }

  addTab() {
    const newTab = new Tab(this.props.pref())

    return this.setState({
      tabs: this.state.tabs.concat(newTab),
      currentTabId: newTab.id
    })
  }

  removeTab(id) {
    const tabs = this.state.tabs.filter(tab => {
      if (tab.id === id) {
        tab.kill()
      }

      return tab.id !== id
    })

    if (tabs.length === 0) {
      return window.close()
    }
    if (this.state.currentTabId === id) {
      return this.setState({
        currentTabId: tabs[0].id,
        tabs,
        currentSessionId: tabs[0].focusableSession().id
      })
    }
    return this.setState({tabs})
  }

  changeTitle(id, title) {
    const tabs = this.state.tabs.map(tab => {
      if (tab.id === id) {
        tab.title = title
      }

      return tab
    })

    return this.setState({tabs})
  }

  markUnread(id) {
    const tabs = this.state.tabs.map(tab => {
      if (tab.id === id) {
        tab.isUnread = true
      }

      return tab
    })

    return this.setState({tabs})
  }

  removeSession(tabId, sessionId) {
    let removeTab = false

    const tabs = this.state.tabs.map(tab => {
      if (tab.id === tabId) {
        tab.remove(sessionId)

        if (tab.root === null) {
          removeTab = true
        }

        return tab
      }
      return tab
    })

    if (removeTab) {
      return this.removeTab(tabId)
    }
    return this.setState({tabs})
  }

  split(orientation) {
    let newSessionId = null
    const tabs = this.state.tabs.map(tab => {
      if (tab.id === this.state.currentTabId) {
        const newGroup = tab.add(this.state.currentSessionId, orientation)
        newSessionId = newGroup.right.id
      }

      return tab
    })

    this.setState({tabs, currentSessionId: newSessionId})
  }
}
