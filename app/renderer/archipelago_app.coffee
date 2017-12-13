React                = require('react')
ArchipelagoPaneList  = require('./archipelago_pane_list')
ArchipelagoTabList   = require('./archipelago_tab_list')

module.exports =
class ArchipelagoApp extends React.Component
  constructor: (props) ->
    super(props)

    id = Math.random()
    @state = { ids: [id], currentTab: id }

  render: ->
    React.createElement(
      'archipelago-app',
      null,
      [
        React.createElement(
          ArchipelagoTabList, {
            ids: @state.ids,
            currentTab: @state.currentTab,
            selectTab: @selectTab.bind(this),
            addTab: @addTab.bind(this),
            removeTab: @removeTab.bind(this),
            key: "tabs"
          }
        )
        React.createElement(
          ArchipelagoPaneList, {
            ids: @state.ids,
            currentTab: @state.currentTab,
            key: "panes"
          }
        )
      ]
    )

  selectTab: (id) ->
    @setState(currentTab: id)

  addTab: ->
    id = Math.random()
    @setState(ids: @state.ids.concat(id), currentTab: id)

  removeTab: (id) ->
    ids = @state.ids.filter (tabId) =>
      tabId != id

    if ids.length == 0
      window.close()
    else if @state.currentTab == id
      @setState(currentTab: ids[0], ids: ids)
    else
      @setState(ids: ids)
