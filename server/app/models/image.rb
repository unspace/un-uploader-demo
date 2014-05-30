class Image < ActiveRecord::Base
  enum state: [:unprocessed, :processing, :processed]

  validates :upload_key,
    presence: true,
    format: { with: /[0-9a-f\-]{36}\.[a-z0-9]{3,4}/ }

  before_create :set_id_from_upload_key

  scope :newest, -> { order(created_at: :desc) }

  def upload_ext
    return unless upload_key
    File.extname(upload_key).sub('.', '')
  end

  private

  def set_id_from_upload_key
    return false unless upload_key
    write_attribute :id, upload_key.sub(/\..+\Z/, '')
    true
  end
end
