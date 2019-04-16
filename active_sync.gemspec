$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "active_sync/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "active-sync"
  s.version     = ActiveSync::VERSION
  s.authors     = ["crammaman"]
  s.email       = ["smadams00@gmail.com"]
  s.homepage    = "https://github.com/Crammaman/rails-sync"
  s.summary     = "Live updated JS objects for use in reactive JS frameworks"
  s.description = "With minimal set up ActiveSync presents limited rails model interfaces within the JS font end. Records accessed are kept updated through action cable."
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency "rails", ">= 5.1.3"
  s.add_dependency "puma", ">= 3.11"

  s.add_development_dependency "webpacker", ">= 3.5.5"
  s.add_development_dependency "sqlite3", "~> 1.3.6"
end
