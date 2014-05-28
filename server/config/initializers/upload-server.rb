# Ensure Redis is running
$redis = Redis.new(url: Rails.application.secrets.redis)
$redis.ping

