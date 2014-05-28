class UploadSerializer < ApplicationSerializer
  attributes \
    :id,
    :expires_at,
    :signed_url
end
