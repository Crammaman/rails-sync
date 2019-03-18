module RailsSync
  class ModelsController < ApplicationController

    def index

      render json: RailsSync::Sync.model_descriptions

    end
  end
end
