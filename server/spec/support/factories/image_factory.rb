def build_image(attrs = {})
  Image.new(attrs)
end

def create_image(attrs = {})
  image = build_image(attrs)
  image.save!
  image
end
