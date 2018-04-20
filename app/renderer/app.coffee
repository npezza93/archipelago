React         = require 'react'
PaneList      = require './pane_list'
TabList       = require './tab_list'
Sessions      = require './sessions'

HamburgerMenu  = require './hamburger_menu'
MinimizeButton = require './minimize_button'
MaximizeButton = require './maximize_button'
CloseButton    = require './close_button'

module.exports =
class App extends React.Component
  constructor: (props) ->
    super(props)

    tabId = Math.random()

    @state =
      tabs: [
        id: tabId, title: '', isUnread: false, sessions: new Sessions
      ]
      currentTabId: tabId

  render: ->
    React.createElement(
      'archipelago-app'
      class: process.platform
      'data-single-tab-mode': '' if archipelago.config.get('singleTabMode')
      React.createElement(HamburgerMenu, key: 'hamburger')
      React.createElement(
        TabList
        key: 'tabs'
        tabs: @state.tabs
        currentTabId: @state.currentTabId
        selectTab: @selectTab.bind(this)
        addTab: @addTab.bind(this)
        removeTab: @removeTab.bind(this)
      )
      React.createElement(MinimizeButton, key: 'minimize')
      React.createElement(MaximizeButton, key: 'maximize')
      React.createElement(CloseButton, key: 'close')
      React.createElement(
        PaneList
        key: 'panes'
        tabs: @state.tabs
        currentTabId: @state.currentTabId
        currentSessionId: @state.currentSessionId
        changeTitle: @changeTitle.bind(this)
        markUnread: @markUnread.bind(this)
        removeSession: @removeSession.bind(this)
        selectSession: @selectSession.bind(this)
      )
    )

  componentWillUnmount: ->
    for tab in @state.tabs
      tab.sessions.kill()

  componentDidUpdate: ->
    currentSession = @currentTab().sessions.find(
      @currentTab().sessions.root, @state.currentSessionId
    )

    if currentSession && !currentSession.isFocused
      currentSession.xterm.focus()

  currentTab: (id) ->
    currentTab = null

    for tab in @state.tabs
      currentTab = tab if tab.id == (id || @state.currentTabId)

    currentTab

  selectTab: (e, id) ->
    e.preventDefault()
    session = null
    tabs = @state.tabs.map (tab) =>
      if tab.id == id
        tab.isUnread = false
        root = tab.sessions.root
        session = tab.sessions.find(root, @state.currentSessionId)
        session = tab.sessions.firstSession() unless session

      tab

    @setState(tabs: tabs, currentTabId: id, currentSessionId: session.id)

  selectSession: (id) ->
    @setState(currentSessionId: id)

  addTab: ->
    tabId = Math.random()

    @setState(
      tabs: @state.tabs.concat(
        id: tabId, title: '', isUnread: false, sessions: new Sessions
      )
      currentTabId: tabId
    )

  removeTab: (id) ->
    tabs = @state.tabs.filter (tab) ->
      tab.sessions.kill() if tab.id == id

      tab.id != id

    if tabs.length == 0
      window.close()
    else if @state.currentTabId == id
      @setState(
        currentTabId: tabs[0].id
        tabs: tabs
        currentSessionId: tabs[0].sessions.firstSession().id
      )
    else
      @setState(tabs: tabs)

  changeTitle: (id, title) ->
    tabs = @state.tabs.map (tab) ->
      tab.title = title if tab.id == id

      tab

    @setState(tabs: tabs)

  markUnread: (id) ->
    tabs = @state.tabs.map (tab) ->
      tab.isUnread = true if tab.id == id

      tab

    @setState(tabs: tabs)

  removeSession: (tabId, sessionId) ->
    removeTab = false

    tabs = @state.tabs.map (tab) ->
      if tab.id == tabId
        tab.sessions.remove(sessionId)

        removeTab = true if tab.sessions.root == null

        tab
      else
        tab

    if removeTab
      @removeTab(tabId)
    else
      @setState(tabs: tabs)

  split: (orientation) ->
    newSessionId = null
    tabs = @state.tabs.map (tab) =>
      if tab.id == @state.currentTabId
        newGroup = tab.sessions.add(@state.currentSessionId, orientation)
        newSessionId = newGroup.right.id

      tab

    @setState(tabs: tabs, currentSessionId: newSessionId)
