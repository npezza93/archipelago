Session      = require('./session')
SessionGroup = require('./session_group')

module.exports =
class Sessions
  constructor: ->
    @root = new Session

  add: (sessionId, orientation) ->
    if @root.isSession
      session = @root
      group = @_newGroup(session, orientation)
      @root = group
    else
      @_newGroup(@find(@root, sessionId), orientation)

  remove: (sessionId) ->
    if @root.isSession && @root.id == sessionId
      @root = null
    else
      sessionToRemove = @find(@root, sessionId)

      return unless sessionToRemove

      sessionToRemove.kill()

      if sessionToRemove.group && sessionToRemove.group.left == sessionToRemove
        sessionToSave = sessionToRemove.group.right
      else if sessionToRemove.group &&
          sessionToRemove.group.right == sessionToRemove
        sessionToSave = sessionToRemove.group.left

      if sessionToSave.group == @root
        @root = sessionToSave
      else if sessionToSave.group.group.left == sessionToSave.group
        sessionToSave.group.group.left = sessionToSave
        sessionToSave.group = sessionToSave.group.group
      else if sessionToSave.group.group.right == sessionToSave.group
        sessionToSave.group.group.right = sessionToSave
        sessionToSave.group = sessionToSave.group.group

  render: (props) ->
    @root.render(props)

  kill: ->
    if @root then @root.kill()

  find: (group, sessionId) ->
    foundSession = null
    @_traverse(group, (session) ->
      if session.id == sessionId then foundSession = session
    )

    foundSession

  firstSession: ->
    session = @root
    until session.isSession
      session = session.left

    session

  _traverse: (group, callback) ->
    unless group? then return

    if group.isSession
      callback(group)

    @_traverse(group.left, callback)
    @_traverse(group.right, callback)

  _newGroup: (session, orientation) ->
    group = new SessionGroup(session.group, orientation)
    group.left = session
    group.right = new Session(group)

    if session.group && session.group.left == session
      session.group.left = group
    else if session.group && session.group.right == session
      session.group.right = group

    session.group = group

    group
