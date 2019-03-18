module RailsSync
  class Engine < ::Rails::Engine
    isolate_namespace RailsSync

    initializer "rails_sync", before: :load_config_initializers do |app|
      Rails.application.routes.append do
        mount RailsSync::Engine, at: "/rails_sync"
      end

      ActiveRecord::Base.class_eval { include RailsSync::ActiveRecordExtension }
    end
  end
end
