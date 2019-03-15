module RailsSync
  class ModelsController < ApplicationController

    def index

      render json: RailsSync::ApplicationHelper.model_descriptions

    end
  end
end
