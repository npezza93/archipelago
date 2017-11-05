mdc = require('material-components-web/dist/material-components-web')
Profile = require('./profile')
ColorField = require('./settings_fields/color_field')
SelectField = require('./settings_fields/select_field')
SwitchField = require('./settings_fields/switch_field')
TextField = require('./settings_fields/text_field')
ProfileSelectorField = require('./settings_fields/profile_selector_field')

document.addEventListener 'DOMContentLoaded', () =>
  jsColorPicker '#theme input[type="text"]',
    customBG: '#fff'
    init: (elm, colors) ->
      elm.style.backgroundColor = elm.value
      elm.style.color = if colors.rgbaMixCustom.luminance > 0.22 then '#222' else '#ddd'
      return
    actionCallback: (e, action) ->
      if action == 'changeXYValue' or action == 'changeOpacityValue'
        @input.dispatchEvent new Event('change', bubbles: true)
      return

  document.querySelector('.newProfile').addEventListener 'click', (e) =>
    e.preventDefault()
    Profile.create()

  document.querySelector('form').addEventListener 'submit', (e) =>
    e.preventDefault()

  Profile.loadAll()

  tabBar = new mdc.tabs.MDCTabBar(document.querySelector('.mdc-tab-bar'))

  tabBar.tabs.forEach (tab) =>
    tab.preventDefaultOnClick = true

  tabBar.listen 'MDCTabBar:change', ({detail: tabs}) =>
    index = tabs.activeTabIndex
    panels = document.querySelector('.panels')

    activePanel = panels.querySelector('.panel.active');
    activePanel.classList.remove('active') if activePanel?

    newActivePanel = panels.querySelector('.panel:nth-child(' + (index + 1) + ')')
    newActivePanel.classList.add('active') if newActivePanel?

  mdc.autoInit()
