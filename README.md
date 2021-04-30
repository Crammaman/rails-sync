# ActiveSync
Dynamically created and updated front end models. 

Active record adds an active record interface to your front end. Configured models are available 
within your Javascript application with many active record type functions such as 'where'.

Records are lazy loaded and then dynamically updated through actioncable. So any records looked up
through ActiveSync will be dynamically updated whether updated by the current user or any one else.

Currently the only Javascript framework supported is Vue

## Usage
How to use my plugin.

## Installation

### Install gem
Add this line to your application's Gemfile:

```ruby
gem 'active_sync'
```

And then execute:
```bash
$ bundle
```

### Import package
In packs/application.js import active-sync and create an instance with a list of Models that you
want available.

```javascript
import ActiveSync from 'active-sync'

let activeSync = new ActiveSync({ modelNames: ['Customer', 'Site'] })
```

### Vue setup

Before creating your Vue instance :

```javascript
Vue.use( activeSync )
```

Then any new Vue instances will have Models globally available

## Contributing
Contribution directions go here.

## License
The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
