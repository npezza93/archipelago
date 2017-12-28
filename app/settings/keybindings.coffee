React      = require('react')
Keybinding = require('./keybinding')

module.exports =
class Keybindings extends React.Component
  constructor: (props) ->
    super(props)
    @state = { keybindings: props.keybindings[process.platform] }

  render: ->
    React.createElement(
      'archipelago-keybindings'
      ref: @props.innerRef
      React.createElement(
        'div'
        className: 'keybindings-info'
        'Keybinding commands should be a comma separated list of ascii character codes'
        React.createElement(
          'div'
          className: 'keybinding-dialog-trigger'
          style:
            marginLeft: '5px'
          onClick: () ->
            document.querySelector('dialog').showModal()
          '\u24D8'
        )
      )
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
      "keybindings.#{process.platform}.#{id}"
      accelerator: ''
      command: []
    )

  removeKeybinding: (id) ->
    tempState = {}
    Object.assign(tempState, @state.keybindings)
    delete tempState[id]

    @props.updateOption("keybindings.#{process.platform}", tempState)
    @setState(keybindings: tempState)

  configKey: (id, key) ->
    "keybindings.#{process.platform}.#{id}.#{key}"
