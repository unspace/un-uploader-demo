require 'ostruct'

module UploadServer
  class Pusher
    def initialize
      @memo = []
    end

    def test!
      @test = true
    end

    def clear!
      @memo = []
    end

    def trigger(channel, event, data = {})
      if @test
        @memo << OpenStruct.new(channel: channel, event: event, data: data)
      else
        ::Pusher[channel].trigger(event, data)
      end
    end
  end
end
