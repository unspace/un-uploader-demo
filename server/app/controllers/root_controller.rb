class RootController < ApplicationController
  def index
    index = Rails.root + 'public/index.html'
    send_file index, type: 'text/html', disposition: 'inline'
  end
end
