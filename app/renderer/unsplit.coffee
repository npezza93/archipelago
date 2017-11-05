require('../utils/attr')

module.exports =
class Unsplit
  constructor: (@terminalContainer) ->
    if @terminalContainer?
      @nodeToMove = Array.from(@terminalContainer.children).filter((node) =>
        return !node.classList.contains("separator")
      )[0]

  unsplit: ->
    if @terminalContainer? && @nodeToMove? && @terminalContainer.classList.contains("terminal-container")
      @terminalContainer.replaceWith(@nodeToMove)
