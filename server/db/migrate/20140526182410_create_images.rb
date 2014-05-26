class CreateImages < ActiveRecord::Migration
  def change
    create_table :images, id: false do |t|
      t.primary_key :id, :uuid
      t.integer :state, default: 0, null: false
      t.timestamps
    end
  end
end
