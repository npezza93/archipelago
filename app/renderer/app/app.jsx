/* global window, document */

import ipc from 'electron-better-ipc'
import React from 'react'
import autoBind from 'auto-bind'
import Tab from '../sessions/tab'
import TrafficLights from '../traffic-lights.jsx'
import PaneList from './pane-list.jsx'
import TabList from './tab-list.jsx'
import HamburgerMenu from './hamburger-menu.jsx'
import 'xterm/dist/xterm.css' // eslint-disable-line import/no-unassigned-import
import './styles.css' // eslint-disable-line import/no-unassigned-import

export default class App extends React.Component {
  constructor(props) {
    super(props)
    autoBind(this)

    const initialTab = new Tab('default')

    this.state = {tabs: [initialTab], currentTabId: initialTab.id, singleTabMode: false}

    ipc.callMain('single-tab-mode').then(value => this.setState({singleTabMode: value}))
    ipc.answerMain('split', direction => this.split(direction))
    ipc.answerMain('new-tab', this.addTab)
    ipc.answerMain('close-current-tab', () => this.removeTab(this.state.currentTabId))
    ipc.answerMain('search-next', this.searchNext)
    ipc.answerMain('search-previous', this.searchPrevious)
    ipc.answerMain('setting-changed', this.handleSettingChanged)
    ipc.answerMain('active-profile-changed', this.handleActiveProfileChanged)
    ipc.answerMain('close', this.handleClose)
    this.resetCssSettings()
  }

  render() {
    return <archipelago-app class={this.htmlClasses()}>
      <HamburgerMenu />
      <TabList
        tabs={this.state.tabs}
        currentTabId={this.state.currentTabId}
        selectTab={this.selectTab}
        removeTab={this.removeTab} />
      <TrafficLights />
      <PaneList
        tabs={this.state.tabs}
        currentTabId={this.state.currentTabId}
        changeTitle={this.changeTitle}
        markUnread={this.markUnread}
        removeSession={this.removeSession}
        selectSession={this.selectSession} />
    </archipelago-app>
  }

  htmlClasses() {
    let classNames = process.platform
    if (this.state.singleTabMode) {
      classNames += ' single-tab-mode'
    }

    return classNames
  }

  componentWillUnmount() {
    this.state.tabs.map(tab => tab.kill())
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
        session = tab.find(root, this.state.currentSessionId) || tab.find(root, tab.lastActiveSessionId)
      }

      return tab
    })

    return this.setState({tabs, currentTabId: id, currentSessionId: session.id})
  }

  selectSession(id) {
    this.currentTab().lastActiveSessionId = id

    return this.setState({currentSessionId: id})
  }

  addTab() {
    if (!this.state.singleTabMode) {
      const newTab = new Tab('default')

      this.setState({
        tabs: this.state.tabs.concat(newTab),
        currentTabId: newTab.id
      })
    }
  }

  async removeTab(id) {
    const [found, remaining] = this.state.tabs.reduce((partition, tab) => {
      if (tab.id === id) {
        partition[0] = tab
      } else {
        partition[1].push(tab)
      }
      return partition
    }, [null, []])

    await found.kill()

    if (remaining.length === 0) {
      window.close()
    } else if (this.state.currentTabId === id) {
      this.setState({
        currentTabId: remaining[0].id,
        tabs: remaining,
        currentSessionId: remaining[0].lastActiveSessionId
      })
    } else {
      this.setState({tabs: remaining})
    }
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

  searchNext({query, options}) {
    const currentTab = this.currentTab()
    const session = currentTab.find(currentTab.root, currentTab.lastActiveSessionId)
    session.searchNext(query, options)
  }

  searchPrevious({query, options}) {
    const currentTab = this.currentTab()
    const session = currentTab.find(currentTab.root, currentTab.lastActiveSessionId)
    session.searchPrevious(query, options)
  }

  get docStyles() {
    return document.documentElement.style
  }

  get styleProperties() {
    return {
      fontFamily: '--font-family',
      windowBackground: '--background-color',
      tabColor: '--tab-color',
      tabBorderColor: '--tab-border-color',
      fontSize: '--font-size',
      padding: '--terminal-padding',
      'theme.selection': '--selection-color'
    }
  }

  resetCssSettings() {
    ipc.callMain('css-settings').then(settings => {
      for (const property in this.styleProperties) {
        this.docStyles.setProperty(this.styleProperties[property], settings[property])
      }
    })
  }

  handleSettingChanged({property, value}) {
    if (property === 'singleTabMode') {
      this.setState({singleTabMode: value})
    } else if (property in this.styleProperties) {
      this.docStyles.setProperty(this.styleProperties[property], value)
    }
  }

  handleActiveProfileChanged(profile) {
    this.setState({singleTabMode: profile.singleTabMode})
    this.resetCssSettings()
  }

  async handleClose() {
    const killers = []
    for (const tab of this.state.tabs) {
      killers.push(tab.kill())
    }
    await Promise.all(killers)
  }
}
