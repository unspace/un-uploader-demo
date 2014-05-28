require 'spec_helper'

describe 'Uploads API' do
  it 'responds with a signed upload URL when given an acceptable file' do
    post '/uploads', upload: { file_name: 'test.png' }

    expect(response).to be_success
    expect(json[:upload][:signed_url]).to be_present
  end

  it 'responds with error data when given an unacceptable file' do
    post '/uploads', upload: { file_name: 'test.exe' }

    expect(response.status).to eq 422
    expect(json[:errors][:base]).to be_present
  end

  it 'responds with an error when no file name is given' do
    post '/uploads', upload: { tile_fame: 'boop.lol' }

    expect(response.status).to eq 422
    expect(json[:errors][:file_name]).to be_present
  end
end
