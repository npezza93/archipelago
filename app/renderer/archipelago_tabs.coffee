etch = require('etch')
$ = etch.dom
ArchipelagoTab  = require('./archipelago_tab')

module.exports =
class ArchipelagoTabs
  constructor: (properties) ->
    @properties = properties || {}

    @properties.tabs ?= []
    @properties.tabs.push(@newTab())

    etch.initialize(this)

  render: ->
    etch.dom('archipelago-tabs', {}, ...@renderTabs())

  update:  ->
    etch.update(this)

  destroy: ->
    await etch.destroy(this)

  renderTabs: ->
    @properties.tabs.map (tab) ->
      tab.render()

  addTab: ->
    @properties.tabs.forEach (tab) ->
      tab.hide()

    @properties.tabs.push(@newTab())

    @update()

  newTab: ->
    new ArchipelagoTab({ active: true, tabsComponent: this })

  removeTab: (tabToRemove) ->
    tabs = @properties.tabs.filter (tab) =>
      tab != tabToRemove

    @properties.tabs = tabs

    if @properties.tabs.length == 0
      window.close()
    else
      await @update()
      tabs[0].focus()
