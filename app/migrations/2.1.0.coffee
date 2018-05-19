module.exports =
  run: (config) ->
    contents = config.contents

    contents.version = '2.1.0'

    config._writeSync(contents)
