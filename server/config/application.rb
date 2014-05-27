require File.expand_path('../boot', __FILE__)

require 'active_model/railtie'
require 'active_record/railtie'
require 'action_controller/railtie'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module UploadServer
  class Application < Rails::Application
    require 'upload_server/api_constraint'

    config.generators do |g|
      g.assets false
      g.helper false
      g.view_specs false
    end
  end
end
