module ActiveSync
  class ModelsController < ApplicationController

    def index

      render json: ActiveSync::Sync.model_descriptions

    end
  end
end
