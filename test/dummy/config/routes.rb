Rails.application.routes.draw do
  root 'home#show'
  mount RailsSync::Engine => "/rails_sync"
end
