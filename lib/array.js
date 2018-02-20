Array.prototype.flatten = function(){
  return this.reduce((a, b) => a.concat(Array.isArray(b) ? b.flatten() : b), [])
}
