import ipc from 'electron-better-ipc'
import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import Component from '../utils/component.jsx'
import Tab from './tab.jsx'

export default class TabList extends Component {
  render() {
    return <archipelago-tab-list>
      <ReactCSSTransitionGroup
        transitionName="archipelago-tab"
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}>
        {this.props.tabs.map(tab => (
          <Tab
            id={tab.id}
            key={tab.id}
            title={tab.title}
            isUnread={tab.isUnread}
            currentStyles={this.state.styles}
            active={this.props.currentTabId === tab.id}
            selectTab={this.props.selectTab}
            removeTab={this.props.removeTab} />
        ))}
      </ReactCSSTransitionGroup>
    </archipelago-tab-list>
  }

  initialState() {
    return {
      styles: {
        fontFamily: this.props.currentProfile.get('fontFamily'),
        color: this.props.currentProfile.get('tabColor')
      }
    }
  }

  resetStyles() {
    this.setState(this.initialState())
  }

  bindListeners() {
    ipc.answerMain('setting-changed', this.resetStyles)
    ipc.answerMain('active-profile-changed', this.resetStyles)
  }
}
