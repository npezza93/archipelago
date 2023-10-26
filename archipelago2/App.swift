//
//  App.swift
//  archipelago2
//
//  Created by Nick Pezza on 10/25/23.
//

import Foundation

struct App {
  static var preferenceFile = PreferenceFile()

  static func activeProfile() -> Config.Profile {
    return preferenceFile.activeProfile()
  }
}
