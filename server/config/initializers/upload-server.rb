secrets = Rails.application.secrets

# Ensure Redis is running
$redis = Redis.new(url: secrets.redis)
$redis.ping


Pusher.logger = Rails.logger

Pusher.url = begin
  key    = secrets.pusher_key
  secret = secrets.pusher_secret
  app_id = secrets.pusher_app_id

  "http://#{key}:#{secret}@api.pusherapp.com/apps/#{app_id}"
end
