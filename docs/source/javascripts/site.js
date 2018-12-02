/* global document */
document.addEventListener('DOMContentLoaded', () => {
  ['#tabs-video', '#search-video', '#visor-video', '#profiles-video'].forEach(video => {
    document.querySelector(`${video} .wrapper-2`).addEventListener('mouseover', () => {
      document.querySelector(`${video} video`).play()
    })
    document.querySelector(`${video} .wrapper-2`).addEventListener('mouseout', () => {
      document.querySelector(`${video} video`).pause()
    })
  })
})
