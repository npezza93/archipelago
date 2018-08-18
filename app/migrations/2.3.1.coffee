module.exports =
  run: (config) ->
    contents = config.contents

    contents.version = '2.3.1'

    config._writeSync(contents)
