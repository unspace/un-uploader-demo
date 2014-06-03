class UploadSerializer < ApplicationSerializer
  attributes \
    :id,
    :expires_at,
    :url,
    :key,
    :mime
end
