ActiveSync::Engine.routes.draw do
  get '/index/:model', to: 'active_sync/models#index'
end
