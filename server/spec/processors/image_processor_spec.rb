require 'spec_helper'

FakeFile = Struct.new('FakeFile', 'body')

class FakeStorage
  def initialize(file)
    @file = file
  end
  def get(key)
    FakeFile.new(IO.binread(@file))
  end

  def upload(*args) end
end

class FakeCleaner
end

describe ImageProcessor do
  it "enqueues an image cleaning if process is successful" do
    img = create_image(upload_key: 'e5cfcd58-4e06-4158-aa89-aaa471c0a6df.png')

    FakeCleaner.should_receive(:perform_in).with(3.hours, img.id)
    ImageProcessor.new(img.id, FakeStorage.new('spec/support/files/image.png'), FakeCleaner).perform
  end

  it "enqueues an immediate image cleaning if process fails" do
    img = create_image(upload_key: 'e5cfcd58-4e06-4158-aa89-aaa471c0a6df.png')

    FakeCleaner.should_receive(:perform_async).with(img.id)
    ImageProcessor.new(img.id, FakeStorage.new('spec/support/files/image-broken.png'), FakeCleaner).perform
  end
end

