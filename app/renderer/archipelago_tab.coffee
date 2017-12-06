etch = require('etch')
$ = etch.dom

module.exports =
class ArchipelagoTab
  constructor: (properties) ->
    @properties = properties || {}

    etch.initialize(this)

  render: ->
    etch.dom('archipelago-tab', {
      className: if @properties.active then 'active' else '',
      onclick: () =>
        @focus()
    }, @renderTitle(), @renderExit())

  update: (props) ->
    Object.assign(@properties, props)

    etch.update(this)
    @properties.tabsComponent.update()

  destroy: ->
    await etch.destroy(this)

  hide: ->
    @update({active: false})

  focus: ->
    @properties.tabsComponent.properties.tabs.forEach (tab) =>
      tab.hide()

    @update({active: true})

  renderTitle: () ->
    $.span({}, @properties.title || '')

  renderExit: () ->
    $.div({
      onclick: () =>
        @properties.tabsComponent.removeTab(this)

        @destroy()
    }, "\u00D7")
