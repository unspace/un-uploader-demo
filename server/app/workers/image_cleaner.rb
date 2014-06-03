class ImageCleaner
  include Sidekiq::Worker

  def perform(image_id)
    image = Image.processed.find(image_id)
    remote_file = $storage.delete("uploads/#{image.upload_key}")
    image.destroy
  end

end

