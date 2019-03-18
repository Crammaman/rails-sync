module RailsSync
  module ModelsHelper
    def self.model_descriptions
      Rails.application.eager_load! unless Rails.application.config.cache_classes
      ActiveRecord::Base.subclasses[1].descendants.map do |model|
        {
          name: model.name,
          associations: model.reflect_on_all_associations.map do |a|
            { name: a.name, class: a.class_name, type: a.association_class.name }
          end
        }
      end
    end
  end
end
