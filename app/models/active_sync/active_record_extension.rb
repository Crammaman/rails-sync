module ActiveSync
  module ActiveRecordExtension
    extend ActiveSupport::Concern

    included do
      # after_update :sync_update
      after_commit :sync_change

      @@sync_record_subscriptions = {}
    end

    def sync_update
      sync_change if saved_changes?
    end

    def sync_change
      if ActiveSync::Sync.is_sync_model? self.class
        #TODO properly accommodate multi process environment, since sync sync_subscriptions
        # exists only in one process, if one process has a filter sub but another does not
        # not all users will necessarily get broadcast to.
        ActionCable.server.broadcast("#{self.class}_All", ActiveSync::Sync.sync_record( self ) )
        self.class.sync_record_subscriptions.each do | stream, filter |
          unless filter[:IsReference]

            match = true
            filter.each do | key, value |
              unless self.send( key ) == value
                match = false
                break
              end
            end

            ActionCable.server.broadcast( stream, ActiveSync::Sync.sync_record( self ) ) if match

          else

            model_association = ActiveSync::Sync.get_model_association( filter[:subscribed_model], filter[:association_name] )

            record = filter[:subscribed_model].find( filter[:record_id] )

            if defined? record.send( model_association[:name] ).pluck

              referenced = record.send( model_association[:name] ).pluck(:id).include? id
            else
              referenced = record.send( model_association[:name] ).id == id
            end

            if referenced
              ActionCable.server.broadcast( stream, ActiveSync::Sync.association_record( model_association, record ))
            end
          end
        end
      end
    end


    class_methods do

      def register_sync_subscription stream, filter
        @@sync_record_subscriptions[ self.name ] = {} if @@sync_record_subscriptions[ self.name ].nil?
        @@sync_record_subscriptions[ self.name ][ stream ] = filter
      end

      def sync_record_subscriptions
        @@sync_record_subscriptions[ self.name ] || {}
      end

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

        ActiveSync::Sync.configure_model_description self, attributes

      end

      # Sync hash for all of self records
      def sync_all

      	self.all.map do |record|
          ActiveSync::Sync.sync_record record
        end

      end

      def sync_filtered filter

        self.where( filter ).map do |record|
          ActiveSync::Sync.sync_record record
        end
      end
    end
  end
end
