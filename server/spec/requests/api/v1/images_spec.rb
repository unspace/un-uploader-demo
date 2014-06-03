require 'spec_helper'

describe 'Images API' do
  it 'replies with a list of visible images' do
    images = [
      create_image(state: :processed),
      create_image(state: :processed),
      create_image(state: :processing)
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

  it 'enqueues images for processing' do
    post '/api/images', image: {
      upload_key: '3a9edbe1-be14-4375-88ee-96cf9803ab73.png'
    }

    expect(response).to be_success
    expect(json[:image][:id]).to eq '3a9edbe1-be14-4375-88ee-96cf9803ab73'
    expect(ImageProcessor).to have(1).enqueued.jobs
  end

  it 'enqueues image for later deletion' do
    post '/api/images', image: {
      upload_key: '3a9edbe1-be14-4375-88ee-96cf9803ab73.png'
    }

    expect(ImageCleaner).to have(1).enqueued.jobs
    expect(ImageCleaner).to have_queued_job_at(3.hours.from_now, "3a9edbe1-be14-4375-88ee-96cf9803ab73")
  end
end
