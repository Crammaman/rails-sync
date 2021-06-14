ActiveSync::Engine.routes.draw do
  get '/:model', to: 'models#index'
  get '/:model/:id', to: 'models#show'
end
