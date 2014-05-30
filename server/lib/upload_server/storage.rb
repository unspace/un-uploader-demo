module UploadServer
  class Storage
    attr_reader :bucket

    def initialize
      @bucket = Rails.application.secrets.s3_bucket
      @fog = Fog::Storage.new \
        provider:              'AWS',
        aws_access_key_id:     Rails.application.secrets.aws_key,
        aws_secret_access_key: Rails.application.secrets.aws_secret
    end

    def upload(file, key, opts = {}, &block)
      data = file.is_a?(String) ? File.open(file) : file

      if (acl = opts.delete(:acl))
        opts['x-amz-acl'] = acl
      end

      request :put_object, key, data, opts, &block
    end

    def get(key, opts = {}, &block)
      request :get_object, key, opts, &block
    end

    def info(key, opts = {})
      request :head_object, key, opts
    end

    def delete(key, opts = {})
      request :delete_object, key, opts
    end

    def signed_put_url(key, expires, headers = {})
      opts = { path_style: true }

      if (content_type = headers['Content-Type'])
        opts[:query] = { 'Content-Type' => content_type }
      end

      request :put_object_url, key, expires, headers, opts
    end

    protected

    def request(meth, key, *args, &block)
      @fog.__send__(meth, bucket, key, *args, &block)
    end
  end
end
