class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  after_update :sync_update
  after_create :sync_change

  def sync_update
    sync_change if saved_changes?
  end

  def sync_change

  	ActionCable.server.broadcast("#{self.class}_All", sync_hash)

    #TODO send sync to all registered filtered channels that have this objects id.

  end

  # Sync hash for all of self records
  def self.sync_all

  	self.all.map( &:sync_hash )

  end

  def self.sync_filtered filter
    self.where( filter ).map( &:sync_hash )

  end

  # Configures the sync_hash that is used in general sync communication
  def self.sync *attributes

    attributes.each do | attribute |

      if attribute == :all_attributes

        @@sync_attributes = attribute_names

      else

        @@sync_attributes << attribute.to_s

      end

    end
  end

  #Hash used in all general sync communication for a given model.
  def sync_hash
    @@sync_attributes.reduce( {} ) do | hash, attribute |
      hash[ attribute ] = self.send( attribute )
      hash
    end
  end

end
