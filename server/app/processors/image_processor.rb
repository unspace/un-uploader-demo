class ImageProcessor

  class Error < StandardError; end
  class MaxWaitError < Error; end
  class InvalidError < Error; end

  CHANNEL   = 'images'
  MAX_TRIES = 10

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

  def initialize(image_id, storage = $storage, cleaner = ImageCleaner)
    @image = Image.unprocessed.find(image_id)
    @storage = storage
    @cleaner = cleaner
  end

  def perform
    @image.processing!
    notify :processing

    download
    process

    @image.processed!
    notify :processed
    @cleaner.perform_in(3.hours, @image.id)
  rescue InvalidError, MaxWaitError => error
    @cleaner.perform_async(@image.id)
    notify :failed, message: error.message
  rescue => error
    log "processing failed: #{error.class} - #{error.message}\n\n" \
        "#{error.backtrace.join("\n")}"
    notify :failed, message: 'Processing failed, try again later'
  end

  def upload_name
    "uploads/#{@image.upload_key}"
  end

  def download
    remote_file = try_until_remote_file_available
    original_file.write(remote_file.body)
    original_file.close
  end

  def try_until_remote_file_available
    count       = 0
    remote_file = nil

    loop do
      if count == MAX_TRIES
        raise MaxWaitError, 'Unable to find uploaded image'
      end

      count += 1
      sleep 1
      notify :try, count: count

      begin
        remote_file = @storage.get(upload_name)
        break
      rescue Excon::Errors::NotFound
        log 'Retrying fetch from S3'
        next
      end
    end

    remote_file
  end


  def process
    VARIANTS.each do |type, size|
      key   = "assets/images/#{@image.id}-#{type}.jpg"
      image = MiniMagick::Image.open(original_file_path)
      mime  = ACCEPTED_MIMES[@image.upload_ext.to_sym]

      if image.mime_type != mime
        invalid! 'Unsupported image format, try PNG, GIF, or JPEG'
      end

      image.combine_options do |opt|
        opt.resize(size)
        opt.quality 80
        opt.auto_orient
      end

      image.format 'jpeg'

      @storage.upload(image.path, key, acl: 'public-read')
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

  def notify(event, opts = {})
    data = {}
    data[:image_id] = @image.id if @image
    data.update(opts)
    log "event:#{event} data:#{data.inspect}"
    Pusher[CHANNEL].trigger(event, data)
  end

  def log(msg)
    Rails.logger.info("[ImageProcessor] #{msg}")
  end

  def invalid!(msg)
    raise InvalidError, msg
  end
end
