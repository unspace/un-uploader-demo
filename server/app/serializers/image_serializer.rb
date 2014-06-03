class ImageSerializer < ApplicationSerializer
  BUCKET   = Rails.application.secrets.s3_bucket
  LOCATION = "http://#{BUCKET}.s3.amazonaws.com/assets/images"

  attributes \
    :id,
    :state

  def attributes
    h = super

    if object.processed?
      ImageProcessor::VARIANTS.keys.each do |type|
        h[:"#{type}_url"] = "#{LOCATION}/#{h[:id]}-#{type}.jpg"
      end
    end

    h
  end
end
