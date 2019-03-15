RailsSync::Engine.routes.draw do
  resources :models, only: [ :index ]
end
