module UploadServer
  class ApiConstraint
    def initialize(opts)
      @version = opts[:version]
      @default = opts[:default]
    end

    def matches?(req)
      @default || begin
        accept = req.headers['Accept']
        accept && accept.include?("application/vnd.un-uploader.v#{@version}")
      end
    end
  end
end
