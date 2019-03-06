customers = Customer.create([
  { name: 'Bobs mowers' },
  { name: 'Moana pools' },
  { name: 'Make shift marbles'}
])

customers.each do |customer|
  Site.create([
    { name: customer.name + ' - Site 1', customer: customer },
    { name: customer.name + ' - Site 2', customer: customer },
    { name: customer.name + ' - Site 3', customer: customer },
  ])
end
