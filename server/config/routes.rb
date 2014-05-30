Rails.application.routes.draw do
  namespace :api, defaults: { format: 'json' } do
    namespace :v1, path: '/', constraints: UploadServer::ApiConstraint.new(version: 1, default: true) do
      resources :images,  only: [:index, :show, :create]
      resources :uploads, only: [:create]
    end
  end

  get '/*path' => 'root#index', as: :root
end
