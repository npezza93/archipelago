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

  selectTab: (id) ->
    tabs = @state.tabs.map (tabObject) =>
      if tabObject.id == id
        tabObject.isUnread = false

      tabObject

    @setState(tabs: tabs, currentTab: id)

  selectTerminal: (id) ->
    @setState(currentTerminal: id)

  addTab: ->
    tabId = Math.random()

    @setState(tabs: @state.tabs.concat({
      id: tabId, title: '', isUnread: false, terminals: new Sessions()
    }), currentTab: tabId)

  removeTab: (id) ->
    tabs = @state.tabs.filter (tabObject) =>
      id != tabObject.id

    if tabs.length == 0
      window.close()
    else if @state.currentTab == id
      @setState(currentTab: tabs[0].id, tabs: tabs)
    else
      @setState(tabs: tabs)

  changeTitle: (id, title) ->
    tabs = @state.tabs.map (tabObject) =>
      if tabObject.id == id
        tabObject.title = title

      tabObject

    @setState(tabs: tabs)

  markUnread: (id) ->
    tabs = @state.tabs.map (tabObject) =>
      if tabObject.id == id
        tabObject.isUnread = true

      tabObject

    @setState(tabs: tabs)

  removeTerminal: (tabId, terminalId) ->
    removeTab = false

    tabs = @state.tabs.map (tabObject) =>
      if tabObject.id == tabId
        tabObject.terminals.remove(terminalId)

        if tabObject.terminals.trunk == null
          removeTab = true

        tabObject
      else
        tabObject

    if removeTab
      @removeTab(tabId)
    else
      @setState(tabs: tabs)

  split: (orientation) ->
    @state.
    console.log 'split'
