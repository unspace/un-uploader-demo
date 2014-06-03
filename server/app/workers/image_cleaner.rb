class ImageCleaner
  include Sidekiq::Worker

  def perform(image_id)
    image = Image.processed.find(image_id)
    image.destroy

    $storage.delete("uploads/#{image.upload_key}")

    ImageProcessor::VARIANTS.keys.each do |type|
      $storage.delete("assets/images/#{type}-#{image.upload_key}")
    end
  end
end
