module.exports =
  run: (config) ->
    contents = config.contents

    contents.version = '2.1.2'

    config._writeSync(contents)
