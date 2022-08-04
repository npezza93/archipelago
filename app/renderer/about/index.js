const {callMain, answerMain} = electron.ipc

callMain("version").then((version) => {
  document.querySelector('#version').textContent = `v${version}`;
});
answerMain('close-via-menu', window.close);
