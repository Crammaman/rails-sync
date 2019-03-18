class Customer < ApplicationRecord
  has_many :sites
  sync :all_attributes_and_associations
end
