require 'securerandom'

module UploadServer
  class Upload
    include ActiveModel::Model
    include ActiveModel::Serialization

    UPLOAD_TTL = 30.minutes
    FILE_TYPES = {
      png:  { mime: 'image/png',  ext: 'png' },
      jpg:  { mime: 'image/jpeg', ext: 'jpg' },
      jpeg: { mime: 'image/jpeg', ext: 'jpg' },
      gif:  { mime: 'image/gif',  ext: 'gif' }
    }

    attr_accessor :file_name

    validates :file_name, presence: true
    validate :validate_file_type

    def self.storage
      @storage ||= Fog::Storage.new \
        provider:              'AWS',
        aws_access_key_id:     Rails.application.secrets.aws_key,
        aws_secret_access_key: Rails.application.secrets.aws_secret
    end

    def id
      @id ||= SecureRandom.uuid
    end

    def as_json(*args, &blk)
      { id:         id,
        expires_at: expires_at,
        signed_url: signed_url }
    end

    def signed_url
      @signed_url ||= begin
        get_put_object_url "uploads/#{id}.#{file_ext}",
          'Content-Type' => mime_type,
          'x-amz-acl'    => 'private'
      end
    end

    def expires_at
      Time.now.utc + UPLOAD_TTL
    end

    def mime_type
      file_type && file_type[:mime]
    end

    def file_ext
      file_type && file_type[:ext]
    end

    def persisted?
      false
    end

    protected

    def storage
      self.class.storage
    end

    def validate_file_type
      unless file_type
        errors.add :base, 'File type is not supported. Try PNG, JPEG, or GIF.'
      end
    end

    def file_type
      return unless file_name
      FILE_TYPES[File.extname(file_name).sub('.','').downcase.to_sym]
    end

    def get_put_object_url(key, headers = {})
      bucket  = Rails.application.secrets.s3_bucket
      opts    = { path_style: true }

      if (content_type = headers['Content-Type'])
        opts[:query] = { 'Content-Type' => content_type }
      end

      storage.put_object_url(bucket, key, expires_at, headers, opts)
    end
  end
end
