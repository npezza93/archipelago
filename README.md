<p align="center">
  <a href="https://github.com/npezza93/archipelago#gh-light-mode-only">
    <img src="https://raw.githubusercontent.com/npezza93/archipelago/main/.github/logo-light.svg#gh-light-mode-only" width="350">
  </a>

  <a href="https://github.com/npezza93/archipelago#gh-dark-mode-only">
    <img src="https://raw.githubusercontent.com/npezza93/archipelago/main/.github/logo-dark.svg#gh-dark-mode-only" width="350">
  </a>

  <p align="center">
    Archipelago is an open-source terminal emulator built on web technology.
    <br>
    <a href="https://github.com/npezza93/archipelago/releases/download/v6.0.0/Archipelago.zip">Download now!</a>
  </p>
</p>

## Why?

Archipelago is inspired by [Hyper](https://github.com/zeit/hyper). I
started using Hyper as my default terminal while it was in beta and into
v1. It was by far the coolest, best looking, minimal, and extensible
terminal emulator I had used. But, I found it to be really slow, to the
point where if I was going to run a command that I knew would have a lot of
output, I would opt for using a different terminal. Along with that,
occasionally buffers would overlap making the terminal unreadable and
force me to restart.

At the time Hyper was using [Hterm](https://github.com/chromium/hterm)
which was the culprit of all my issues, so I found the
[Xterm.js](https://xtermjs.org/) project which solved all these problems
and I started making Archipelago.

![Screenshot](https://raw.githubusercontent.com/npezza93/archipelago/main/.github/screenshot.png)

## Get Archipelago

### macOS

Use Homebrew Cask to download the app by running the following

```bash
❯ brew install --cask archipelago
```

or

[Download](https://archipelago-terminal.herokuapp.com/download/osx)

## Contributing

Bug reports and pull requests are welcome on [GitHub](https://github.com/npezza93/archipelago).

## Development

Regardless of the platform you are working on, you will need to have Yarn installed. If you have never installed Yarn before, you can find out how [here](https://yarnpkg.com/en/docs/install).

Clone the repo then run `cd archipelago/WebView; bun install` in your console.
Then open the app in Xcode.

## Releasing

- Create archive in Xcode with new version
- Export notarized app to dist/
- Create release in GitHub for new version
- create zip file (`ditto -c -k --keepParent dist/Archipelago.app
  dist/Archipelago.zip`)

## License

Archipelago is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
