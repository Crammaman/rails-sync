module RailsSync
  class Sync

    # Describes what of each model should be sent as the sync records,
    # this is populated through calls to 'sync' in the model class
    @@model_descriptions = {}
    @@loaded = false

    def self.model_descriptions
      ( Rails.application.eager_load! && @@loaded = true ) unless Rails.application.config.cache_classes || @@loaded
      @@model_descriptions
    end

    def self.is_sync_model? model
      
      model_name = model.class == String ? model : model.name

      model_descriptions.keys.include? model_name

    end


    #Hash used in all general sync communication for a given model.
    def self.sync_record record
      @@model_descriptions[ record.class.name ][ :attributes ].reduce( {} ) do | hash, attribute |
        hash[ attribute ] = record.send( attribute )
        hash
      end
    end

    def self.configure_model_description model, options

      @@model_descriptions[ model.name ] = {
        attributes:   [],
        associations: []
      }

      options.each do | option |

        case
        when option == :all_attributes_and_associations

          add_attributes_to_description model, model.attribute_names
          add_associations_to_description model, model.reflect_on_all_associations.map( &:name )

        when option == :all_attributes

          add_attributes_to_description model, model.attribute_names

        when first_key( option ) == :attributes

          add_attributes_to_description model, option[:attributes].map(&:to_s)

        when option == :all_associations

          add_associations_to_description model, model.reflect_on_all_associations.map( &:name )

        when first_key( option ) == :associations

          add_associations_to_description model, option[ :associations ]

        else

          throw "Unknown sync option: #{option}"

        end
      end

    end

    def self.add_attributes_to_description model, attributes

      attributes.each{ |attribute| @@model_descriptions[ model.name ][ :attributes ] << attribute.to_s }

    end

    def self.add_associations_to_description model, association_names
      association_names.each do |association_name|

        association = model.reflect_on_all_associations.find{ |a| a.name == association_name }

        unless association.nil?

          @@model_descriptions[ model.name ][ :associations ] << { name: association.name.to_s, class: association.class_name, type: association.association_class.name }

        else

          throw "Association #{ association_name } not found for #{ model.name }"

        end
      end
    end

    def self.get_model_association model, association_name
      @@model_descriptions[ model.name ][:associations].find{ |a| a[:name] == association_name }
    end

    def self.first_key obj
      obj.respond_to?( :keys ) ? obj.keys.first : nil
    end
  end
end
