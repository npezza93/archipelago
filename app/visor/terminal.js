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
      this.props.session.onFocus(() => {
        this.props.selectSession(this.props.session.id)
      })
    )

    this.subscriptions.add(
      this.props.session.onExit(() => {
        this.props.removeSession(this.props.session.id)
      })
    )
  }
}
