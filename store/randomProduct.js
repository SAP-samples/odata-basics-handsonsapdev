  // Unbound function
  this.on('randomProduct', async req => {
    const result = await SELECT .one.from (Products, ['max(ProductID) as max'])
    const randomID = Math.floor(Math.random() * result.max) + 1
    const product = await SELECT .from (Products, randomID)
    return product
  })
