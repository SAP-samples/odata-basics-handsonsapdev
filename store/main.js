const cds = require('@sap/cds')

class NorthwindModel extends cds.ApplicationService { init(){

  console.log('In class NorthwindModel')

  return super.init()
}}

module.exports = { NorthwindModel }
