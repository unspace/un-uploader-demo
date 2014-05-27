class Image < ActiveRecord::Base
  enum state: [:uploading, :processing, :ready]

  scope :newest,  -> { order(created_at: :desc) }
  scope :visible, -> { where(state: Image.states[:ready]) }
end
