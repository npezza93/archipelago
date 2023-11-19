<p align="center">
  <a href="https://github.com/npezza93/archipelago">
    <img src="https://raw.githubusercontent.com/npezza93/archipelago/master/.github/logo-light.svg#gh-light-mode-only" width="350">
    <img src="https://raw.githubusercontent.com/npezza93/archipelago/master/.github/logo-dark.svg#gh-dark-mode-only" width="350">
  </a>

  <p align="center">
    Archipelago is an open-source terminal emulator built on web technology.
    <br>
    <a href="https://github.com/npezza93/archipelago/releases/download/v5.1.0/Archipelago-5.1.0-arm64-mac.zip">Download now!</a>
  </p>
</p>

![GitHub-Mark-Light](https://raw.githubusercontent.com/npezza93/archipelago/master/.github/logo-light.svg | width=350)
![GitHub-Mark-Dark](https://raw.githubusercontent.com/npezza93/archipelago/master/.github/logo-dark.svg | width=350)

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
and I started making Archipelago. Archipelago works on macOS, Linux, and
Windows, supports theming which can be saved to a profile, pane splitting,
system tests, and much more. Visit [archipelago.dev](https://archipelago.dev)
to see more gifs!

![Screenshot](https://raw.githubusercontent.com/npezza93/archipelago/master/.github/screenshot.gif)

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

Clone the repo then run `yarn && yarn start` in your console.

## License

Archipelago is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
