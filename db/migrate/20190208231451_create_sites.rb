class CreateSites < ActiveRecord::Migration[5.2]
  def change
    create_table :sites do |t|
      t.string :name
      t.text :address
      t.references :customer, foreign_key: true

      t.timestamps
    end
  end
end
