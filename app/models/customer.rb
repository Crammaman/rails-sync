class Customer < ApplicationRecord
  has_many :sites

  sync :all_attributes
end
