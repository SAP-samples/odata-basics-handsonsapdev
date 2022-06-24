using northwind from '../db/schema';

service NorthwindModel {
  entity Products as projection on northwind.Products actions {
    action discontinue() returns Products;
  }

  entity Suppliers as projection on northwind.Suppliers actions {
    function addressLine() returns String;
  }

  entity Categories as projection on northwind.Categories;
  entity Summary_of_Sales_by_Years as projection on northwind.Summary_of_Sales_by_Years;

  action submitOrder(
    product: Products:ProductID,
    quantity: Products:UnitsInStock
  ) returns Products:UnitsInStock;

  function randomProduct() returns Products;
}
