module ActiveSync
  class Engine < ::Rails::Engine
    isolate_namespace ActiveSync

    initializer "active_sync", before: :load_config_initializers do |app|
      Rails.application.routes.append do
        mount ActiveSync::Engine, at: "/active_sync"
      end

    end
  end
end
