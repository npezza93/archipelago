import Cocoa
import Foundation
import UserNotifications

class CheckForUpdatesMenuItem: NSMenuItem {
  override init(title string: String, action selector: Selector?, keyEquivalent charCode: String) {
    super.init(title: string, action: selector, keyEquivalent: charCode)
    commonInit()
  }

  required init(coder: NSCoder) {
    super.init(coder: coder)
    commonInit()
  }

  private func commonInit() {
    self.target = self
    self.action = #selector(checkForUpdateAction)
  }

  @objc private func checkForUpdateAction() {
    let url = URL(string: "https://api.github.com/repos/npezza93/archipelago/releases?per_page=100")
    let task = URLSession.shared.dataTask(with: url!) { data, response, error in
        // Check for errors and unwrap data safely
        if let error = error {
            print("Error: \(error)")
            return
        }
        guard let data = data else {
            print("No data received")
            return
        }

        do {
          if var currentVersion = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") {
            currentVersion = Version("\(currentVersion)")
            //currentVersion = Version("4.1.0")
            let releases = try JSONDecoder().decode([Release].self, from: data)
            let viableReleases = releases.filter{ !$0.prerelease && Version($0.tagName) > currentVersion as! Version  }
            let sorted = viableReleases.sorted { Version($0.tagName) > Version($1.tagName) }
            if sorted.isEmpty {
                let content = UNMutableNotificationContent()
                content.title = "Up to date!"

                let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
                UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
            } else {
              print(sorted[0])
            }
          }
        } catch {
            print("JSON Decoding Error: \(error)")
        }
    }

    task.resume()
  }
}

public struct Release: Codable {
    public let id: Int
    public let url: URL
    public let htmlURL: URL
    public let assetsURL: URL
    public let tarballURL: URL?
    public let zipballURL: URL?
    public let nodeId: String
    public let tagName: String
    public let commitish: String
    public let name: String
    public let body: String
    public let draft: Bool
    public let prerelease: Bool
    public let createdAt: String
    public let publishedAt: String?
    public let author: User

    public init(id: Int,
                url: URL,
                htmlURL: URL,
                assetsURL: URL,
                tarballURL: URL?,
                zipballURL: URL?,
                nodeId: String,
                tagName: String,
                commitish: String,
                name: String,
                body: String,
                draft: Bool,
                prerelease: Bool,
                createdAt: String,
                publishedAt: String?,
                author: User) {
        self.id = id
        self.url = url
        self.htmlURL = htmlURL
        self.assetsURL = assetsURL
        self.tarballURL = tarballURL
        self.zipballURL = zipballURL
        self.nodeId = nodeId
        self.tagName = tagName
        self.commitish = commitish
        self.name = name
        self.body = body
        self.draft = draft
        self.prerelease = prerelease
        self.createdAt = createdAt
        self.publishedAt = publishedAt
        self.author = author
    }

    enum CodingKeys: String, CodingKey {
        case id, url, name, body, draft, prerelease, author

        case htmlURL = "html_url"
        case assetsURL = "assets_url"
        case tarballURL = "tarball_url"
        case zipballURL = "zipball_url"
        case nodeId = "node_id"
        case tagName = "tag_name"
        case commitish = "target_commitish"
        case createdAt = "created_at"
        case publishedAt = "published_at"
    }
}

open class User: Codable {
    open internal(set) var id: Int
    open var login: String?
    open var avatarURL: String?
    open var gravatarID: String?
    open var type: String?
    open var name: String?
    open var company: String?
    open var blog: String?
    open var location: String?
    open var email: String?
    open var numberOfPublicRepos: Int?
    open var numberOfPublicGists: Int?
    open var numberOfPrivateRepos: Int?
    open var nodeID: String?
    open var url: String?
    open var htmlURL: String?
    open var followersURL: String?
    open var followingURL: String?
    open var gistsURL: String?
    open var starredURL: String?
    open var subscriptionsURL: String?
    open var reposURL: String?
    open var eventsURL: String?
    open var receivedEventsURL: String?
    open var siteAdmin: Bool?
    open var hireable: Bool?
    open var bio: String?
    open var twitterUsername: String?
    open var numberOfFollowers: Int?
    open var numberOfFollowing: Int?
    open var createdAt: String?
    open var updatedAt: Date?
    open var numberOfPrivateGists: Int?
    open var numberOfOwnPrivateRepos: Int?
    open var amountDiskUsage: Int?
    open var numberOfCollaborators: Int?
    open var twoFactorAuthenticationEnabled: Bool?
    open var subscriptionPlan: Plan?

    public init(id: Int = -1,
                login: String? = nil,
                avatarURL: String? = nil,
                gravatarID: String? = nil,
                type: String? = nil,
                name: String? = nil,
                company: String? = nil,
                blog: String? = nil,
                location: String? = nil,
                email: String? = nil,
                numberOfPublicRepos: Int? = nil,
                numberOfPublicGists: Int? = nil,
                numberOfPrivateRepos: Int? = nil,
                nodeID: String? = nil,
                url: String? = nil,
                htmlURL: String? = nil,
                followersURL: String? = nil,
                followingURL: String? = nil,
                gistsURL: String? = nil,
                starredURL: String? = nil,
                subscriptionsURL: String? = nil,
                reposURL: String? = nil,
                eventsURL: String? = nil,
                receivedEventsURL: String? = nil,
                siteAdmin: Bool? = nil,
                hireable: Bool? = nil,
                bio: String? = nil,
                twitterUsername: String? = nil,
                numberOfFollowers: Int? = nil,
                numberOfFollowing: Int? = nil,
                createdAt: String? = nil,
                updatedAt: Date? = nil,
                numberOfPrivateGists: Int? = nil,
                numberOfOwnPrivateRepos: Int? = nil,
                amountDiskUsage: Int? = nil,
                numberOfCollaborators: Int? = nil,
                twoFactorAuthenticationEnabled: Bool? = nil,
                subscriptionPlan: Plan? = nil) {
        self.id = id
        self.login = login
        self.avatarURL = avatarURL
        self.gravatarID = gravatarID
        self.type = type
        self.name = name
        self.company = company
        self.blog = blog
        self.location = location
        self.email = email
        self.numberOfPublicRepos = numberOfPublicRepos
        self.numberOfPublicGists = numberOfPublicGists
        self.numberOfPrivateRepos = numberOfPrivateRepos
        self.nodeID = nodeID
        self.url = url
        self.htmlURL = htmlURL
        self.followersURL = followersURL
        self.followingURL = followingURL
        self.gistsURL = gistsURL
        self.starredURL = starredURL
        self.subscriptionsURL = subscriptionsURL
        self.reposURL = reposURL
        self.eventsURL = eventsURL
        self.receivedEventsURL = receivedEventsURL
        self.siteAdmin = siteAdmin
        self.hireable = hireable
        self.bio = bio
        self.twitterUsername = twitterUsername
        self.numberOfFollowers = numberOfFollowers
        self.numberOfFollowing = numberOfFollowing
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.numberOfPrivateGists = numberOfPrivateGists
        self.numberOfOwnPrivateRepos = numberOfOwnPrivateRepos
        self.amountDiskUsage = amountDiskUsage
        self.numberOfCollaborators = numberOfCollaborators
        self.twoFactorAuthenticationEnabled = twoFactorAuthenticationEnabled
        self.subscriptionPlan = subscriptionPlan
    }

    enum CodingKeys: String, CodingKey {
        case id
        case login
        case avatarURL = "avatar_url"
        case gravatarID = "gravatar_id"
        case type
        case name
        case company
        case blog
        case location
        case email
        case numberOfPublicRepos = "public_repos"
        case numberOfPublicGists = "public_gists"
        case numberOfPrivateRepos = "total_private_repos"
        case nodeID = "node_id"
        case url
        case htmlURL = "html_url"
        case followersURL = "followers_url"
        case followingURL = "following_url"
        case gistsURL = "gists_url"
        case starredURL = "starred_url"
        case subscriptionsURL = "subscriptions_url"
        case reposURL = "repos_url"
        case eventsURL = "events_url"
        case receivedEventsURL = "received_events_url"
        case siteAdmin = "site_admin"
        case hireable
        case bio
        case twitterUsername = "twitter_username"
        case numberOfFollowers = "followers"
        case numberOfFollowing = "following"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case numberOfPrivateGists = "private_gists"
        case numberOfOwnPrivateRepos = "owned_private_repos"
        case amountDiskUsage = "disk_usage"
        case numberOfCollaborators = "collaborators"
        case twoFactorAuthenticationEnabled = "two_factor_authentication"
        case subscriptionPlan = "plan"
    }
}

open class Plan: Codable {
  open var name: String?
  open var space: Int?
  open var numberOfCollaborators: Int?
  open var numberOfPrivateRepos: Int?
  
  public init(name: String? = nil,
              space: Int? = nil,
              numberOfCollaborators: Int? = nil,
              numberOfPrivateRepos: Int? = nil) {
    self.name = name
    self.space = space
    self.numberOfCollaborators = numberOfCollaborators
    self.numberOfPrivateRepos = numberOfPrivateRepos
  }
  
  enum CodingKeys: String, CodingKey {
    case name
    case space
    case numberOfCollaborators = "collaborators"
    case numberOfPrivateRepos = "private_repos"
  }
}

class Version: Comparable {
  static func < (lhs: Version, rhs: Version) -> Bool {
    if lhs.major != rhs.major {
        return lhs.major < rhs.major
    }
    if lhs.minor != rhs.minor {
        return lhs.minor < rhs.minor
    }
    return lhs.patch < rhs.patch
  }
  
  static func == (lhs: Version, rhs: Version) -> Bool {
    lhs.major == rhs.major && lhs.minor == rhs.minor && lhs.patch == rhs.patch
  }
  
  open var major: Int
  open var minor: Int
  open var patch: Int
  
  public init(_ version: String) {
    var newVersion = version
    
    if version.starts(with: "v") {
      newVersion = String(newVersion.dropFirst())
    }
    let parts = newVersion.split(separator: ".")
    
    self.major = Int(parts[0])!
    self.minor = Int(parts[1])!
    self.patch = Int(parts[2])!
  }
}
