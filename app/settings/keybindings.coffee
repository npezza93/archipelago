React      = require 'react'
Keybinding = require './keybinding'

module.exports =
class Keybindings extends React.Component
  render: ->
    React.createElement(
      'archipelago-keybindings'
      ref: @props.innerRef
      @make keymapId for keymapId of @keymaps()
      @create()
    )

  configKey: (id, key) ->
    "keybindings.#{process.platform}.#{id}.#{key}"

  create: ->
    React.createElement(
      'div'
      className: 'create-keybinding'
      onClick: @createKeymap.bind(this)
      'add new keybinding'
    )

  createKeymap: ->
    id = Math.max(...Object.keys(@keymaps())) + 1

    @props.updateOption(
      "keybindings.#{process.platform}.#{id}"
      accelerator: ''
      command: []
    )

  keymap: (id) ->
    @keymaps()[id]

  keymaps: ->
    archipelago.config.get('keybindings')[process.platform]

  make: (keymapId) ->
    React.createElement(
      Keybinding
      key: keymapId
      id: keymapId
      accelerator: @keymap(keymapId).accelerator
      command: @keymap(keymapId).command
      updateKeystroke: @updateKeystroke.bind(this)
      updateCommand: @updateCommand.bind(this)
      removeKeybinding: @removeKeybinding.bind(this)
    )

  removeKeybinding: (id) ->
    props = {}
    Object.assign(props, @keymaps())
    delete props[id]

    @props.updateOption("keybindings.#{process.platform}", props)

  updateKeystroke: (id, keystroke) ->
    @props.updateOption(@configKey(id, 'accelerator'), keystroke)

  updateCommand: (id, command) ->
    @props.updateOption(@configKey(id, 'command'), command)
