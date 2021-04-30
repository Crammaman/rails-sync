module ActiveSync
  class ModelsController < ApplicationController

    def index

      render json: params[:model].camelize.constantize.all

    end
  end
end
