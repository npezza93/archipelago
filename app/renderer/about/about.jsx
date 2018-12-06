/* global window */

import ipc from 'electron-better-ipc'
import {api, darkMode} from 'electron-util'
import React from 'react'
import {Disposable} from 'event-kit'
import TrafficLights from '../traffic-lights.jsx'
import Component from '../utils/component.jsx'
import './styles.css' // eslint-disable-line import/no-unassigned-import

export default class About extends Component {
  render() {
    return <div id="about" data-theme={this.theme}>
      <TrafficLights />
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="1200.000000pt" height="1200.000000pt" viewBox="0 0 1200.000000 1200.000000" preserveAspectRatio="xMidYMid meet" className="project-logo">
        <g transform="translate(0.000000,1200.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
          <path d="M5088 8625 c-38 -21 -2931 -5083 -2936 -5137 -5 -45 25 -99 63 -116
          38 -17 7533 -17 7570 0 35 16 55 57 55 113 0 42 -80 190 -961 1788 -528 958
          -974 1756 -990 1772 -26 27 -36 30 -89 30 -53 0 -63 -3 -89 -30 -16 -16 -196
          -331 -399 -698 -203 -368 -372 -670 -376 -670 -3 -1 -383 655 -844 1457 -523
          912 -847 1466 -863 1479 -35 25 -106 32 -141 12z m514 -1133 l436 -767 -226
          -3 -227 -2 -393 -393 -392 -392 -309 310 -308 310 486 852 c267 469 488 853
          491 853 3 0 201 -345 442 -768z m2335 -1045 l132 -242 -195 -195 -194 -195
          -116 116 -117 117 174 321 c96 176 176 320 179 320 3 1 64 -108 137 -242z
          m-955 -1406 c451 -788 817 -1435 815 -1437 -2 -2 -1196 -3 -2654 -2 l-2649 3
          775 1362 776 1362 373 -372 372 -372 448 448 447 447 239 -2 240 -3 818 -1434z
          m1858 -231 c348 -630 641 -1160 652 -1178 l20 -32 -698 2 -698 3 -161 280
          c-88 154 -319 558 -514 897 l-354 617 68 123 c37 68 90 163 118 212 l50 88
          178 -178 179 -179 257 257 c164 164 260 253 264 245 4 -6 291 -527 639 -1157z"/>
        </g>
      </svg>

      <div className="centered_column">
        <div className="font-weight-500 m-0 title">Archipelago</div>
        <div id="version">v{api.app.getVersion()}</div>
      </div>

      <p className="m-0">
        Archipelago is an open-source terminal emulator built on web technology.
      </p>

      <p className="m-0">
        Bug reports and pull requests are welcome on
        <a className="font-weight-500" rel="noopener noreferrer" target="_blank" href="https://github.com/npezza93/archipelago/"> GitHub</a>.
      </p>

      <p className="m-0">
        This app is available as open source under the terms of the
        <a className="font-weight-500" rel="noopener noreferrer" target="_blank" href="http://opensource.org/licenses/MIT"> MIT License</a>.
      </p>

      <p className="m-0 font-weight-500">
        Developed and Maintained by
        <br />
        Nick Pezza
      </p>

      <a rel="noopener noreferrer" target="_blank" href="https://pezza.co">
        <svg className="np-logo" width="40" version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000.000000 2000.000000" preserveAspectRatio="xMidYMid meet">
          <g transform="translate(0.000000,2000.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
            <path d="M9535 19600 c-1620 -84 -3135 -542 -4510 -1363 -1070 -639 -2025 -1501 -2782 -2512 -1428 -1908 -2095 -4257 -1887 -6650 163 -1881 876 -3673 2052 -5155 396 -499 864 -982 1342 -1386 1492 -1261 3326 -2039 5260 -2233 324 -33 472 -41 825 -48 1392 -25 2735 241 4030 799 190 81 645 307 834 413 665 373 1270 808 1821 1310 140 127 483 470 620 620 883 965 1563 2099 1994 3326 578 1647 698 3449 345 5169 -337 1639 -1087 3144 -2204 4425 -193 220 -673 701 -890 890 -900 783 -1896 1381 -2980 1788 -897 336 -1781 526 -2780 597 -203 15 -880 21 -1090 10z m-1115 -7662 l1485 -2161 3 2162 2 2161 1388 0 c1377 0 1564 -4 1832 -36 622 -73 1141 -274 1550 -600 113 -90 318 -296 411 -414 441 -553 650 -1205 651 -2025 0 -254 -11 -410 -42 -617 -119 -785 -499 -1438 -1100 -1892 -350 -264 -793 -451 -1280 -540 -287 -52 -501 -66 -1022 -66 l-428 0 0 -1060 0 -1060 -978 0 -979 0 -1664 2585 -1664 2585 -3 -2585 -2 -2585 -960 0 -960 0 0 4155 0 4155 1138 0 1137 -1 1485 -2161z" />
            <path d="M5051 13793 c62 -100 4842 -7539 4850 -7547 5 -6 9 606 9 1551 l0 1562 -1557 2235 -1556 2236 -884 0 -885 0 23 -37z" />
            <path d="M10180 9935 l0 -3895 703 0 704 0 6 1598 c4 878 7 2316 7 3195 l0 1597 663 0 c364 0 706 -5 761 -10 254 -25 442 -113 622 -294 220 -220 343 -494 383 -858 14 -123 14 -474 1 -609 -33 -325 -114 -581 -245 -764 -49 -68 -159 -177 -225 -222 -99 -67 -223 -117 -370 -150 -64 -13 -169 -17 -697 -20 l-623 -4 0 -661 0 -660 518 5 c540 5 626 11 877 57 596 112 1077 357 1454 740 372 379 612 863 704 1420 36 217 47 364 47 622 0 307 -21 518 -76 768 -148 673 -526 1239 -1064 1593 -326 214 -756 358 -1245 416 -217 26 -454 31 -1647 31 l-1258 0 0 -3895z" />
            <path d="M4930 9772 l0 -3752 690 0 690 0 0 2683 0 2684 -681 1059 c-375 582 -686 1063 -690 1069 -5 5 -9 -1612 -9 -3743z" />
            <path d="M11870 10965 l0 -1196 613 4 c594 3 615 4 697 26 338 88 519 349 575 831 20 165 19 505 0 653 -36 277 -137 493 -309 662 -93 92 -197 152 -323 187 -75 21 -101 22 -665 26 l-588 3 0 -1196z" />
          </g>
        </svg>
      </a>
    </div>
  }

  initialState() {
    return {isDarkMode: darkMode.isEnabled}
  }

  bindListeners() {
    this.addSubscription(
      new Disposable(darkMode.onChange(this.handleDarkModeChange))
    )

    ipc.on('close-via-menu', window.close)
    this.addSubscription(
      new Disposable(() => ipc.removeListener('close-via-menu', window.close))
    )
  }
}
