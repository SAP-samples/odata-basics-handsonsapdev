  // Bound action
  this.on ('discontinue', 'Products', async ({params:[{ProductID}]}) => {
    await UPDATE (Products, ProductID) .with ({
      UnitsInStock: 0,
      UnitsOnOrder: 0,
      Discontinued: true
    })
    const product = await SELECT .from (Products, ProductID)
    return product
  })
