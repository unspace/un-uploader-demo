def create_image(attrs = {})
  Image.create!({
    upload_key: "#{SecureRandom.uuid}.png"
  }.merge(attrs))
end
