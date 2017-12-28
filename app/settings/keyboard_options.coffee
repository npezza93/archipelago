React      = require('react')
Keybinding = require('./keybinding')

module.exports =
class KeyboardOptions extends React.Component
  constructor: (props) ->
    super(props)
    @state = { keybindings: props.keyboard[process.platform] }

  render: ->
    React.createElement(
      'archipelago-keyboard-options'
      ref: @props.innerRef
      Object.keys(@state.keybindings).map (keybindingId) =>
        React.createElement(
          Keybinding
          key: keybindingId
          id: keybindingId
          accelerator: @state.keybindings[keybindingId].accelerator
          command: @state.keybindings[keybindingId].command
          updateKeystroke: @updateKeystroke.bind(this)
          updateCommand: @updateCommand.bind(this)
          removeKeybinding: @removeKeybinding.bind(this)
        )
      React.createElement(
        'div'
        className: 'create-keybinding'
        onClick: @createKeybinding.bind(this)
        'add new keybinding'
      )
    )

  updateKeystroke: (id, keystroke) ->
    @props.updateOption(@configKey(id, 'accelerator'), keystroke)

  updateCommand: (id, command) ->
    @props.updateOption(@configKey(id, 'command'), command)

  createKeybinding: ->
    id = Math.max(...Object.keys(@state.keybindings)) + 1

    @props.updateOption(
      "keyboard.#{process.platform}.#{id}"
      accelerator: ''
      command: []
    )

  removeKeybinding: (id) ->
    tempState = {}
    Object.assign(tempState, @state.keybindings)
    delete tempState[id]

    @props.updateOption("keyboard.#{process.platform}", tempState)
    @setState(keybindings: tempState)

  configKey: (id, key) ->
    "keyboard.#{process.platform}.#{id}.#{key}"
