const cds = require('@sap/cds')

class NorthwindModel extends cds.ApplicationService { init(){

  const { Products, Suppliers } = this.entities ('northwind')

  // Unbound action
  this.on ('submitOrder', async req => {

    const { product, quantity } = req.data
    const stockInfo = await SELECT `UnitsInStock` .from (Products, product)
    const newStock = stockInfo.UnitsInStock - quantity
    await UPDATE (Products, product) .with ({ UnitsInStock: newStock })
    return newStock
  })

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

  // Unbound function
  this.on('randomProduct', async req => {
    const result = await SELECT .one.from (Products, ['max(ProductID) as max'])
    const randomID = Math.floor(Math.random() * result.max) + 1
    const product = await SELECT .from (Products, randomID)
    return product
  })

  // Bound function
  this.on ('addressLine', 'Suppliers', async ({params:[{SupplierID}]}) => {
    const supplier = await SELECT .from (Suppliers, SupplierID)
    return [supplier.Address, supplier.City, supplier.PostalCode, supplier.Country].join(', ')
  })

  return super.init()
}}

module.exports = { NorthwindModel }
