  // Unbound action
  this.on ('submitOrder', async req => {
    const { product, quantity } = req.data
    const stockInfo = await SELECT `UnitsInStock` .from (Products, product)
    const newStock = stockInfo.UnitsInStock - quantity
    await UPDATE (Products, product) .with ({ UnitsInStock: newStock })
    return newStock
  })
