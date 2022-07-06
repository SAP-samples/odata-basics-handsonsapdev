module.exports = srv => {

  console.log('Service name:', srv.name)

    if (srv.name === 'CatalogService') {

    srv.after ('READ', 'Books', xs => {

      xs.map(x => x.stock > 500 && (x.title = `(5% off!) ${x.title}`))

    })

  }

}
