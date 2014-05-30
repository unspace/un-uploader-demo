class ImageProcessor
  include Sidekiq::Worker

  class Error < StandardError; end
  class InvalidError < Error; end

  CHANNEL = 'images'

  ACCEPTED_MIMES = {
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif'
  }

  VARIANTS = {
    thumb:  '180x>',
    normal: '640x>',
    large:  '1200x>'
  }

  def perform(image_id)
    @image = Image.unprocessed.find(image_id)

    @image.processing!
    notify :processing

    download
    process

    @image.processed!
    notify :processed
  rescue => error
    @image && @image.destroy
    notify :failed, message: error.message
  end

  def download
    remote_file = $storage.get("uploads/#{@image.upload_key}")
    original_file.write(remote_file.body)
    original_file.close
  end

  def process
    VARIANTS.each do |type, size|
      key   = "assets/images/#{@image.id}-#{type}.jpg"
      image = MiniMagick::Image.open(original_file_path)
      mime  = ACCEPTED_MIMES[@image.upload_ext.to_sym]

      if image.mime_type != mime
        invalid! "invalid format: #{image.mime_type}, expected: #{mime}"
      end

      image.combine_options do |opt|
        opt.resize(size)
        opt.quality 80
        opt.auto_orient
      end

      image.format 'jpeg'

      $storage.upload(image.path, key, acl: 'public-read')
    end
  end

  private

  def original_file
    @original_file ||= begin
      tmp = Tempfile.new(['image-upload', ".#{@image.upload_ext}"])
      tmp.binmode
      tmp
    end
  end

  def original_file_path
    original_file.path
  end

  def notify(event_name, opts = {})
    event = event_name.to_s.dasherize
    data  = {}
    data[:image_id] = @image.id if @image
    data.update(opts)
    Pusher[CHANNEL].trigger(event, data)
  end

  def invalid!(msg)
    raise InvalidError, msg
  end
end
