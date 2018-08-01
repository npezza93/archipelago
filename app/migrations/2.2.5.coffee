module.exports =
  run: (config) ->
    contents = config.contents

    contents.version = '2.2.5'

    config._writeSync(contents)
