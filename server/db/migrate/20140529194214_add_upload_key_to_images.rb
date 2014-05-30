class AddUploadKeyToImages < ActiveRecord::Migration
  def change
    add_column :images, :upload_key, :string, null: false, limit: 42
  end
end
