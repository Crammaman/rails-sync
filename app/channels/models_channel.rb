require 'digest/md5'

class ModelsChannel < ApplicationCable::Channel
  # For providing DashData with data from rails models
  # To change the data sent (like reducing how much is sent)
  # implement broadcast_model in the respective modelc

  def subscribed

    if filter && filter[:IsReference]

      subscribe_references

    else

      subscribe_models

    end
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  private
  def subscribe_models
    if filter.nil?

      stream_from "#{model.name}_All"
      transmit( model.sync_all )

    else

      stream_from "#{model.name}_#{checksum}"

      # TODO ensure that params are safe to pass to the model then register for syncing to.
      transmit( model.sync_filtered( filter.to_h ) )

    end
  end

  def subscribe_references

    record = model.find( filter[:record_id] )

    if model_association

      transmit( {
        IsReference: true,
        id: record.id,
        model_association[:name] => associated_ids( record )
      })

    else

       raise "#{model} does not reference #{ filter[:association_name] }"

    end

    stream_from "#{model.name}_#{checksum}"

  end

  def associated_ids record
    if defined? record.send( model_association[:name] ).pluck

      record.send( model_association[:name] ).pluck(:id)
    else
      record.send( model_association[:name] ).id
    end
  end

  def model

    if models.include?( params[:model] )

      eval( params[:model] )

    else

      raise 'Model parameter is not a model'

    end
  end

  def model_descriptions
    Rails.application.eager_load! unless Rails.application.config.cache_classes
    ActiveRecord::Base.subclasses[1].descendants.map do |model|
      {
        name: model.name,
        associations: model.reflect_on_all_associations.map do |a|
          { name: a.name.to_s, class: a.class_name, type: a.type }
        end
      }
    end
  end

  def models
    model_descriptions.map{ |md| md[:name] }
  end

  def model_description
    model_descriptions.detect do |description|
      description[:name] == model.name
    end
  end

  def model_association
    model_description[:associations].detect{ |a| a[:name] == filter[:association_name] }
  end

  def filter
    params[:filter]
  end

  def checksum
    # A checksum is generated and used in the stream name so all of the same filtered subscriptions should be on the same Stream
    Digest::MD5.hexdigest( Marshal::dump( filter ) )
  end
end
