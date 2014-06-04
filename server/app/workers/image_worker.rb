class ImageWorker
  include Sidekiq::Worker

  def perform(image_id)
    ImageProcessor.new(image_id).perform
  end
end

