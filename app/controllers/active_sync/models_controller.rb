module ActiveSync
  class ModelsController < ApplicationController

    def index
      render json: params[:model].camelize.safe_constantize.all
    end
  end
end
