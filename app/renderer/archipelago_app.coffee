React                = require('react')
ArchipelagoPaneList  = require('./archipelago_pane_list')
ArchipelagoTabList   = require('./archipelago_tab_list')

module.exports =
class ArchipelagoApp extends React.Component
  constructor: (props) ->
    super(props)

    id = Math.random()
    @state = { tabs: [{ id: id, title: '', isUnread: false }], currentTab: id }

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
            key: "panes"
            changeTitle: @changeTitle.bind(this),
            markUnread: @markUnread.bind(this),
            removeTab: @removeTab.bind(this),
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

  addTab: ->
    id = Math.random()
    @setState(tabs: @state.tabs.concat({ id: id, title: ''}), currentTab: id)

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
