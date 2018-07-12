module.exports =
  run: (config) ->
    contents = config.contents

    contents.version = '2.2.1'

    config._writeSync(contents)
