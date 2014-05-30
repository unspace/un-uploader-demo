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

    def id
      @id ||= SecureRandom.uuid
    end

    def as_json(*args, &blk)
      { id:         id,
        key:        "#{id}.#{file_ext}",
        expires_at: expires_at,
        signed_url: signed_url }
    end

    def signed_url
      @signed_url ||= $storage.signed_put_url("uploads/#{id}.#{file_ext}", expires_at,
        'Content-Type' => mime_type,
        'x-amz-acl'    => 'private'
      )
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

    def validate_file_type
      unless file_type
        errors.add :base, 'File type is not supported. Try PNG, JPEG, or GIF.'
      end
    end

    def file_type
      return unless file_name
      FILE_TYPES[File.extname(file_name).sub('.','').downcase.to_sym]
    end
  end
end
