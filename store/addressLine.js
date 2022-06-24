  // Bound function
  this.on ('addressLine', 'Suppliers', async ({params:[{SupplierID}]}) => {
    const supplier = await SELECT .from (Suppliers, SupplierID)
    return [supplier.Address, supplier.City, supplier.PostalCode, supplier.Country].join(', ')
  })
