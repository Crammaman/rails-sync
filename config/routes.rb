ActiveSync::Engine.routes.draw do
  get '/:model', to: 'models#index'
end
