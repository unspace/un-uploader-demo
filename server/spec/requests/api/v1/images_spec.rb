require 'spec_helper'

describe 'Images API' do
  it 'replies with a list of visible images' do
    images = [
      create_image(state: Image.states[:ready]),
      create_image(state: Image.states[:ready]),
      create_image(state: Image.states[:processing])
    ]

    get '/api/images'

    expect(response).to be_success
    expect(json[:images].length).to eq 2
    expect(json[:images].map { |i| i[:id] }).not_to include images[2].id
  end

  it 'replies with a single image' do
    images = [
      create_image,
      create_image
    ]

    get "/api/images/#{images[0].id}"

    expect(response).to be_success
    expect(json[:image][:id]).to eq images[0].id
  end
end
