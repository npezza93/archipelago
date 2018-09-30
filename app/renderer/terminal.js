/* global ResizeObserver */

const {Component, createElement} = require('react')
const {CompositeDisposable} = require('event-kit')

module.exports =
class Terminal extends Component {
  constructor(props) {
    super(props)
    this.subscriptions = new CompositeDisposable()
    this.resizeObserver = new ResizeObserver(() => this.props.session.fit())

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

    this.resizeObserver.observe(this.refs.container)
    this.subscriptions.add(this.props.session.bindScrollListener())
  }

  componentWillUnmount() {
    this.resizeObserver.unobserve(this.refs.container)
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
