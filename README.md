<p align="center">
  <a href="https://github.com/npezza93/archipelago">
    <img src="https://raw.githubusercontent.com/npezza93/archipelago/master/.github/logo.png" width="350">
  </a>

  <p align="center">
    Archipelago is an open-source terminal emulator built on web technology.
    <br>
    <a href="https://archipelago-terminal.herokuapp.com/download">Download now!</a>
  </p>
</p>

## Why?

I'm a fan of web technologies, so I started using
[Hyper](https://github.com/zeit/hyper) as my default terminal while it was in beta.
Hyper was by far the coolest, best looking, and extensible terminal emulator I had used and being an Electron app, it was cross-platform.

But, I found Hyper(beta and version 1) to be extremely slow, to the point that if I was going to run a command that I knew would have a lot of output, I would opt for using the OS default. Along with that, occasionally buffers would overlap making the terminal unreadable and force me to restart the terminal.

After using Hyper for a while and then finding the [Xterm.js](https://xtermjs.org/) project(Hyper was using [Hterm](https://github.com/chromium/hterm) at this point, it has since switched to Xterm.js as of v2), I thought perhaps I can make a terminal that performs faster than Hyper. So that's what Archipelago is, my perfect terminal, fast, pretty, extensible, and stable.

![Screenshot](https://raw.githubusercontent.com/npezza93/archipelago/master/.github/screenshot.png)

## Get Archipelago

### macOS

Use Homebrew Cask to download the app by running the following

```bash
❯ brew cask install archipelago
```

### Download Links

- [macOS](https://archipelago-terminal.herokuapp.com/download/osx)
- [Debian](https://archipelago-terminal.herokuapp.com/download/linux_deb_64)
- [Fedora](https://archipelago-terminal.herokuapp.com/download/linux_rpm_64)
- [Windows](https://archipelago-terminal.herokuapp.com/download/win)
- [Other Linux distros](https://archipelago-terminal.herokuapp.com/download/64)

## Platforms

Archipelago is compatible with:

- macOS
- Linux
- Windows

## Contributing

Bug reports and pull requests are welcome on [GitHub](https://github.com/npezza93/archipelago).

## Development

Regardless of the platform you are working on, you will need to have Yarn installed. If you have never installed Yarn before, you can find out how [here](https://yarnpkg.com/en/docs/install).

Clone the repo then run `yarn && yarn start` in your console.

## License

Archipelago is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
