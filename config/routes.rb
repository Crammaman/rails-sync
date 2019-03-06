Rails.application.routes.draw do
  get 'models/index'
  get 'models/:model/all' => 'models#all'
  root 'home#show'
end
