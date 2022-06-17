namespace northwind;

entity Products {
  key ProductID: Integer;
      ProductName: String;
      QuantityPerUnit: String;
      UnitPrice: Decimal;
      Category: Association to Categories;
      Supplier: Association to Suppliers;
      UnitsInStock: Integer;
      UnitsOnOrder: Integer;
      ReorderLevel: Integer;
      Discontinued: Boolean;
}

entity Suppliers {
  key SupplierID: Integer;
      CompanyName: String;
      ContactName: String;
      ContactTitle: String;
      Address: String;
      City: String;
      Region: String;
      PostalCode: String;
      Country: String;
      Phone: String;
      Fax: String;
      HomePage: String;
      Products: Association to many Products on Products.Supplier = $self;
}

entity Categories {
  key CategoryID: Integer;
      CategoryName: String;
      Description: String;
      Products: Association to many Products on Products.Category = $self;
}

entity Summary_of_Sales_by_Years {
  key OrderID: Integer;
      ShippedDate: DateTime;
      Subtotal: Decimal;
}
