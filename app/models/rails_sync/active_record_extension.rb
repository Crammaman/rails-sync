module RailsSync
  module ActiveRecordExtension
    extend ActiveSupport::Concern

    included do
      after_update :sync_update
      after_create :sync_change
    end

    def sync_update
      sync_change if saved_changes?
    end

    def sync_change

    	ActionCable.server.broadcast("#{self.class}_All", RailsSync::Sync.sync_record( self ) )

      #TODO send sync to all registered filtered channels that have this objects id.

    end


    class_methods do

      # Sync configures the data that is used in general sync communication
      # This can be passed the following options:
      #
      # Example use in Model:
      # sync :all_references, associations: [ :sites ]

      # ATTRIBUTE OPTIONS
      # Attributes are data that is sent in the actual sync data (this will always include the ID)

      # :all_attributes - sync data will have all attributes
      # :attributes - an array of symbols that will be called on the record and sent as attributes

      # ASSOCIATION OPTIONS
      # Associations are lazy loaded, data will not go with the record but the front end will be told that
      # there is an association to load the data of when accessed.

      # :all_associations - sync data will be associated
      # :associations - an array of symbols

      def sync *attributes

        RailsSync::Sync.configure_model_description self, attributes

      end

      # Sync hash for all of self records
      def sync_all

      	self.all.map do |record|
          RailsSync::Sync.sync_record record
        end

      end

      def sync_filtered filter

        self.where( filter ).map do |record|
          RailsSync::Sync.sync_record record
        end
      end
    end
  end
end
