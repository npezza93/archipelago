Function::attr = (prop, desc) ->
  Object.defineProperty @prototype, prop, desc
