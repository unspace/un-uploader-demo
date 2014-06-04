class ImageCleaner
  include Sidekiq::Worker

  def perform(image_id)
    image = Image.find(image_id)

    image.destroy

    $storage.delete("uploads/#{image.upload_key}")

    ImageProcessor::VARIANTS.keys.each do |type|
      $storage.delete("assets/images/#{type}-#{image.upload_key}")
    end
  rescue Excon::Errors::NotFound
    Rails.logger.warn "[ImageCleaner] image variant not found for #{image_id}"
  end
end
