React                = require('react')
ArchipelagoPaneList  = require('./archipelago_pane_list')
ArchipelagoTabList   = require('./archipelago_tab_list')
Sessions             = require('./sessions')

module.exports =
class ArchipelagoApp extends React.Component
  constructor: (props) ->
    super(props)

    tabId = Math.random()

    @state = {
      tabs: [{
        id: tabId, title: '', isUnread: false, terminals: new Sessions()
      }],
      currentTab: tabId
    }

  render: ->
    React.createElement(
      'archipelago-app',
      null,
      [
        React.createElement(
          ArchipelagoTabList, {
            tabs: @state.tabs, currentTab: @state.currentTab,
            key: "tabs",
            selectTab: @selectTab.bind(this),
            addTab: @addTab.bind(this),
            removeTab: @removeTab.bind(this),
          }
        )
        React.createElement(
          ArchipelagoPaneList, {
            tabs: @state.tabs, currentTab: @state.currentTab,
            currentTerminal: @state.currentTerminal,
            key: "panes"
            changeTitle: @changeTitle.bind(this),
            markUnread: @markUnread.bind(this),
            removeTerminal: @removeTerminal.bind(this),
            selectTerminal: @selectTerminal.bind(this)
          }
        )
      ]
    )

  componentWillUnmount: ->
    @state.tabs.map (tabObject) ->
      tabObject.terminals.kill()

  componentDidUpdate: (prevProps, prevState) ->
    currentTerminal = @currentTabObject().terminals.find(
      @currentTabObject().terminals.root, @state.currentTerminal
    )

    if currentTerminal then currentTerminal.xterm.focus()

  currentTabObject: (id) ->
    currentTabObject = null

    @state.tabs.map (tabObject) =>
      if tabObject.id == (id || @state.currentTab)
        currentTabObject = tabObject

    currentTabObject

  selectTab: (e, id) ->
    e.preventDefault()
    session = null
    tabs = @state.tabs.map (tabObject) =>
      if tabObject.id == id
        tabObject.isUnread = false
        root = tabObject.terminals.root
        session = tabObject.terminals.find(root, @state.currentTerminal)
        unless session
          session = tabObject.terminals.firstSession()

      tabObject

    @setState(tabs: tabs, currentTab: id, currentTerminal: session.id)

  selectTerminal: (id) ->
    @setState(currentTerminal: id)

  addTab: ->
    tabId = Math.random()

    @setState(tabs: @state.tabs.concat({
      id: tabId, title: '', isUnread: false, terminals: new Sessions()
    }), currentTab: tabId)

  removeTab: (id) ->
    tabs = @state.tabs.filter (tabObject) ->
      if tabObject.id == id
        tabObject.terminals.kill()

      tabObject.id != id

    if tabs.length == 0
      window.close()
    else if @state.currentTab == id
      session = tabs[0].terminals.firstSession()

      @setState(currentTab: tabs[0].id, tabs: tabs, currentTerminal: session.id)
    else
      @setState(tabs: tabs)

  changeTitle: (id, title) ->
    tabs = @state.tabs.map (tabObject) ->
      if tabObject.id == id
        tabObject.title = title

      tabObject

    @setState(tabs: tabs)

  markUnread: (id) ->
    tabs = @state.tabs.map (tabObject) ->
      if tabObject.id == id
        tabObject.isUnread = true

      tabObject

    @setState(tabs: tabs)

  removeTerminal: (tabId, terminalId) ->
    removeTab = false

    tabs = @state.tabs.map (tabObject) ->
      if tabObject.id == tabId
        tabObject.terminals.remove(terminalId)

        if tabObject.terminals.root == null
          removeTab = true

        tabObject
      else
        tabObject

    if removeTab
      @removeTab(tabId)
    else
      @setState(tabs: tabs)

  split: (orientation) ->
    tabs = @state.tabs.map (tabObject) =>
      if tabObject.id == @state.currentTab
        tabObject.terminals.add(@state.currentTerminal, orientation)

      tabObject

    @setState(tabs: tabs)
