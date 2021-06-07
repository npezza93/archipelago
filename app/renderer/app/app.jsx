/* global window, document */

import {ipcRenderer as ipc} from 'electron-better-ipc'
import React from 'react'
import {Disposable} from 'event-kit'
import Tab from '../sessions/tab'
import Component from '../utils/component.jsx'
import CurrentProfile from '../utils/current-profile'
import TabList from './tab-list.jsx'
import 'xterm/css/xterm.css'
import './styles.css'
import Terminal from './terminal.jsx'

export default class App extends Component {
  render() {
    return <archipelago-app class={this.htmlClasses()}>
      <TabList
        tabs={this.state.tabs}
        currentTabId={this.state.currentTabId}
        selectTab={this.selectTab}
        currentProfile={this.currentProfile}
        removeTab={this.removeTab} />
      <Terminal
        key={this.state.tabs[0].root.id}
        session={this.state.tabs[0].root}
        tabId={this.state.tabs[0].id}
        currentTabId={this.state.currentTabId}
        changeTitle={this.changeTitle}
        markUnread={this.markUnread}
        removeSession={this.removeSession}
        selectSession={this.selectSession} />
    </archipelago-app>
  }

  initialState() {
    const initialTab = new Tab('default')

    return {
      tabs: [initialTab],
      currentTabId: initialTab.id,
      singleTabMode: this.currentProfile.get('singleTabMode')
    }
  }

  initialize() {
    this.currentProfile = new CurrentProfile()
    this.resetCssSettings()
  }

  htmlClasses() {
    let classNames = process.platform
    if (this.state.singleTabMode) {
      classNames += ' single-tab-mode'
    }

    return classNames
  }

  cleanup() {
    this.state.tabs.map(tab => tab.kill())
  }

  componentWillUnmount() {
    this.cleanup()
    window.removeEventListener('beforeunload', this.cleanup)
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

  selectTab(event, id) {
    event.preventDefault()
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

    this.setState({currentSessionId: id})
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

    this.setState({tabs})
  }

  markUnread(id) {
    const tabs = this.state.tabs.map(tab => {
      if (tab.id === id) {
        tab.isUnread = true
      }

      return tab
    })

    this.setState({tabs})
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
      this.removeTab(tabId)
    } else {
      this.setState({tabs})
    }
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

  get docStyles() {
    return document.documentElement.style
  }

  get styleProperties() {
    return {
      'theme.background': '--background-color',
      tabBorderColor: '--tab-border-color',
      padding: '--terminal-padding'
    }
  }

  resetCssSettings() {
    for (const property in this.styleProperties) {
      this.docStyles.setProperty(
        this.styleProperties[property],
        this.currentProfile.get(property)
      )
    }
  }

  handleSettingChanged({property, value}) {
    if (property === 'singleTabMode') {
      this.setState({singleTabMode: value})
    } else if (property in this.styleProperties) {
      this.docStyles.setProperty(this.styleProperties[property], value)
    }
  }

  handleActiveProfileChanged() {
    this.setState({singleTabMode: this.currentProfile.get('singleTabMode')})
    this.resetCssSettings()
  }

  async handleClose() {
    const killers = []
    for (const tab of this.state.tabs) {
      killers.push(tab.kill())
    }

    await Promise.all(killers)
  }

  closeViaMenu() {
    if (document.querySelector('webview')) {
      document.querySelector('webview').remove()
    } else {
      this.removeTab(this.state.currentTabId)
    }
  }

  bindListeners() {
    this.addSubscription(
      new Disposable(() => ipc.removeListener('close-via-menu', this.closeViaMenu))
    )
    ipc.on('close-via-menu', this.closeViaMenu)
    this.addSubscription(new Disposable(ipc.answerMain('split', this.split)))
    this.addSubscription(new Disposable(ipc.answerMain('new-tab', this.addTab)))
    this.addSubscription(new Disposable(ipc.answerMain('setting-changed', this.handleSettingChanged)))
    this.addSubscription(new Disposable(ipc.answerMain('active-profile-changed', this.handleActiveProfileChanged)))
    this.addSubscription(new Disposable(ipc.answerMain('close', this.handleClose)))
  }
}
