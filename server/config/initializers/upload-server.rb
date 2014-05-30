secrets = Rails.application.secrets

# Ensure Redis is running
$redis = Redis.new(url: secrets.redis)
$redis.ping

$s3 = Fog::Storage.new \
  provider:              'AWS',
  aws_access_key_id:     secrets.aws_key,
  aws_secret_access_key: secrets.aws_secret

$storage = UploadServer::Storage.new

Pusher.logger = Rails.logger

Pusher.url = begin
  key    = secrets.pusher_key
  secret = secrets.pusher_secret
  app_id = secrets.pusher_app_id

  "http://#{key}:#{secret}@api.pusherapp.com/apps/#{app_id}"
end
