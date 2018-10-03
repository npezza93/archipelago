<p align="center">
  <a href="https://github.com/npezza93/archipelago">
    <img src="https://github.com/npezza93/archipelago/blob/master/.github/logo.png" width="150">
  </a>

  <h3 align="center">Archipelago</h3>

  <p align="center">
    Archipelago is an open-source terminal emulator built on web technology.
    <br>
    <a href="https://archipelago-terminal.herokuapp.com/download">Download now!</a>
  </p>
</p>

## Why?

I've been a proponent of web technologies for some time, thus I've been using
[Hyper](https://github.com/zeit/hyper) as my default terminal since it was in beta.
Hyper was by far the coolest, best looking, and extensible terminal emulator I had used and being an Electron app, it was cross-platform. But, I found Hyper(beta and version 1) to be extremely slow, to the point that if I was going to run a command that I knew would have a lot of output, I would opt for using the OS default. Along with that, occasionally buffers would overlap making the terminal unreadable and force me to restart the terminal. After using Hyper for a while and then finding the [Xterm.js](https://xtermjs.org/) project, I thought perhaps I can make a terminal that performs faster than Hyper. So that's what Archipelago is, my perfect terminal. All the speed of the OS default with all the extensibility that HTML, CSS, and JavaScript provides.

![Screenshot](https://raw.githubusercontent.com/npezza93/archipelago/master/.github/screenshot.png)

## Download

- [macOS](https://archipelago-terminal.herokuapp.com/download/osx)
- [Windows](https://archipelago-terminal.herokuapp.com/download/win)
- [Debian](https://archipelago-terminal.herokuapp.com/download/linux_deb_64)
- [Fedora](https://archipelago-terminal.herokuapp.com/download/linux_rpm_64)
- [Other Linux distros](https://archipelago-terminal.herokuapp.com/download/64)

## Platforms

Archipelago is compatible with:

- macOS
- Linux
- A Windows package is available but not yet tested

## Contributing

Bug reports and pull requests are welcome on [GitHub](https://github.com/npezza93/archipelago).

## Development

Regardless of the platform you are working on, you will need to have Yarn installed. If you have never installed Yarn before, you can find out how [here](https://yarnpkg.com/en/docs/install).

##### macOS

Clone the repo then run `yarn && yarn start` in your console:

```bash
$ yarn

yarn install v1.10.1
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 📃  Building fresh packages...
success Saved lockfile.
$ electron-builder install-app-deps
  • electron-builder version=20.28.4
  • loaded configuration file=package.json ("build" field)
  • rebuilding native production dependencies platform=darwin arch=x64
  • rebuilding native dependency name=keyboard-layout
  • rebuilding native dependency name=node-pty
  • rebuilding native dependency name=pathwatcher
```

```bash
$ yarn start

yarn run v1.10.1
ELECTRON_DISABLE_SECURITY_WARNINGS=true ./node_modules/.bin/electron .
2018-10-02 21:22:24.583 Electron[78826:4102660] *** WARNING: Textured window <AtomNSWindow: 0x7fc29bc2b1c0>
is getting an implicitly transparent titlebar. This will break when linking against newer SDKs. Use NSWindows -titlebarAppearsTransparent=YES instead.
```

## License

Archipelago is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
