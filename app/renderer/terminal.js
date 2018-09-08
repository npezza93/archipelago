/* global document */
const {Component, createElement} = require('react')
const {CompositeDisposable} = require('event-kit')

module.exports =
class Terminal extends Component {
  constructor(props) {
    super(props)
    this.subscriptions = new CompositeDisposable()
    this.bindDataListeners()
  }

  render() {
    return createElement('archipelago-terminal', {ref: 'container'})
  }

  componentDidMount() {
    const {session} = this.props

    session.xterm.open(this.refs.container)
    session.resetTheme()
    session.xterm.focus()

    if (!document.querySelector('#boot').classList.contains('booted')) {
      document.querySelector('#boot').classList.add('booted')
    }

    this.subscriptions.add(this.props.session.bindScrollListener())
  }

  componentWillUnmount() {
    this.subscriptions.dispose()
  }

  bindDataListeners() {
    this.subscriptions.add(
      this.props.session.onDidFocus(() => {
        this.props.selectSession(this.props.session.id)
        this.props.changeTitle(this.props.tabId, this.props.session.title)
      })
    )

    this.subscriptions.add(
      this.props.session.onDidChangeTitle(title => {
        this.props.changeTitle(this.props.tabId, title)
      })
    )

    this.subscriptions.add(
      this.props.session.onDidExit(() => {
        this.props.removeSession(this.props.tabId, this.props.session.id)
      })
    )

    this.subscriptions.add(
      this.props.session.onData(() => {
        if (this.props.currentTabId !== this.props.tabId) {
          this.props.markUnread(this.props.tabId)
        }
      })
    )
  }
}
