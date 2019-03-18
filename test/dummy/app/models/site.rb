class Site < ApplicationRecord
  belongs_to :customer
  sync :all_attributes_and_associations
end
