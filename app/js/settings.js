const { join } = require('path')
const Profile = require(join(__dirname, '/js/profile'))

document.addEventListener('DOMContentLoaded', () => {
  jsColorPicker('#theme input[type="text"]', {
    customBG: '#fff',
    init: function(elm, colors) {
      elm.style.backgroundColor = elm.value
      elm.style.color = colors.rgbaMixCustom.luminance > 0.22 ? '#222' : '#ddd'
    },
    actionCallback: function(e, action) {
      if (action === 'changeXYValue' || action === 'changeOpacityValue') {
        this.input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
  })

  document.querySelector('.newProfile').addEventListener('click', () => {
    Profile.create()
  })

  Profile.loadAll()
})

let tabBar = new mdc.tabs.MDCTabBar(document.querySelector('.mdc-tab-bar'));
var panels = document.querySelector('.panels');

tabBar.tabs.forEach(function(tab) {
  tab.preventDefaultOnClick = true;
});

function updatePanel(index) {
  var activePanel = panels.querySelector('.panel.active');
  if (activePanel) {
    activePanel.classList.remove('active');
  }
  var newActivePanel = panels.querySelector('.panel:nth-child(' + (index + 1) + ')');
  if (newActivePanel) {
    newActivePanel.classList.add('active');
  }
}

tabBar.listen('MDCTabBar:change', function ({detail: tabs}) {
  var nthChildIndex = tabs.activeTabIndex;

  updatePanel(nthChildIndex);
});
