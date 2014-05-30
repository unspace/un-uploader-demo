require 'spec_helper'

describe Image do
  it 'is there' do
    expect(Image).to be Image
  end

  it 'requires an upload_key to be created' do
    img = Image.new
    expect(img).to_not be_valid
    expect(img.errors[:upload_key].length).to_not be_zero
  end

  it 'uses the upload_key\'s UUID as its own id on creation' do
    img = Image.create!(upload_key: 'e5cfcd58-4e06-4158-aa89-aaa471c0a6df.png')
    expect(img).to be_valid
    expect(img.id).to eq 'e5cfcd58-4e06-4158-aa89-aaa471c0a6df'
  end

  it 'provides the uploaded files original extension' do
    img = Image.create!(upload_key: 'e5cfcd58-4e06-4158-aa89-aaa471c0a6df.png')
    expect(img.upload_ext).to eq 'png'
  end
end
