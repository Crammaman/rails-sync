module ActiveSync
  class ModelsController < ApplicationController

    def index
      render json: model.sync_filtered(properties)
    end

    def show

    end

    def properties
      params.permit(ActiveSync::Sync.model_descriptions[model.name][:attributes])
    end

    def model
      params[:model].singularize.camelize.safe_constantize || params[:model].camelize.safe_constantize
    end
  end
end
