# All things $filter

<!-- Auto build the HTML from this by running bin/autorebuildfilter -->

## Notes

These examples use various OData services:

* [Northwind V4](https://services.odata.org/v4/northwind/northwind.svc/)
* [TripPin](https://www.odata.org/blog/trippin-new-odata-v4-sample-service/)
* [The CAP based V4 OData service in this repository](http://localhost:4004/northwind-model/)

To run the CAP based V4 OData service in this repository, use `cds run`. The default port 4004 is used.

## Basic usage

### Logical operators

**Products that are discontinued**
<br>[Products?\$filter=Discontinued eq true](http://localhost:4004/northwind-model/Products?$filter=Discontinued%20eq%20true)
<br>Basic, single filter on collection with logical operator `eq`

**Products that are discontinued but there is still stock**
<br>[Products?$filter=Discontinued eq true and UnitsInStock gt 0](http://localhost:4004/northwind-model/Products?$filter=Discontinued%20eq%20true%20and%20UnitsInStock%20gt%200)
<br>Combination of filters with logical operators `eq`, `gt` and `and`

**Products in Category 2 that are expensive (25.00 or more)**
<br>[Categories/2/Products?$filter=UnitPrice ge 25.00](http://localhost:4004/northwind-model/Categories/2/Products?$filter=UnitPrice%20ge%2025.00)
<br>Filter on collection via navigation with logical operator `ge`

**All people with female gender**
<br>[People/$filter=Gender has Microsoft.OData.SampleService.Models.TripPin.PersonGender'Female'](https://services.odata.org/V4/TripPinService/People?$filter=Gender%20has%20Microsoft.OData.SampleService.Models.TripPin.PersonGender%27Female%27)
<br>Referencing an enumeration value, using logical operator `has`

**Categories with fewer than 10 products**
<br>[Categories?\$filter=Products/\$count lt 10](http://localhost:4004/northwind-model/Categories?$filter=Products/$count%20lt%2010)
<br>Using the raw value of the number of items in a collection (via navigation)

### Arithmetic operators

**Products with high availability (more than 100 units of stock and backorders combined)**
<br>[Products?\$filter=UnitsInStock add UnitsOnOrder gt 100](https://services.odata.org/v4/northwind/northwind.svc/Products?$filter=UnitsInStock%20add%20UnitsOnOrder%20gt%20100)
<br>Combining two numeric properties with `add`

**Products with a high stock value (over 3,500.00)**
<br>[Products?\$filter=UnitsInStock mul UnitPrice gt 3500.00](https://services.odata.org/v4/northwind/northwind.svc/Products?$filter=UnitsInStock%20mul%20UnitPrice%20gt%203500.00)
<br>Combining two numeric properties with `mul`

### String functions

**Suppliers with a '555' phone code, and a homepage**
<br>[Suppliers?\$filter=contains(Phone,'555') and HomePage ne 'NULL'](http://localhost:4004/northwind-model/Suppliers?$filter=contains(Phone,%27555%27)%20and%20HomePage%20ne%20%27NULL%27)
<br>Using the `contains` function (note arg order and no spaces)

**Products with short names**
<br>[Products?\$filter=length(ProductName) lt 5](http://localhost:4004/northwind-model/Products?$filter=length(ProductName)%20lt%205)
<br>Combining the canonical function `length`'s output with the logical operator `lt`

**Airports where the IATA and ICAO codes diverge**
<br>[Airports?\$select=Name,IcaoCode,IataCode&\$filter=not contains(IcaoCode,IataCode)](https://services.odata.org/V4/TripPinService/Airports?$select=Name,IcaoCode,IataCode&$filter=not%20contains(IcaoCode,IataCode))
<br>Using the `contains` function with the logical operator `not`, with both parameters passed to `contains` being properties (see also [IATA vs ICAO](https://en.wikipedia.org/wiki/ICAO_airport_code#ICAO_codes_versus_IATA_codes))

### Date & time functions

**Orders shipped on the first of the month**
<br>[Summary_of_Sales_by_Years?\$count=true&\$filter=day(ShippedDate) eq 1](https://services.odata.org/v4/northwind/northwind.svc/Summary_of_Sales_by_Years?$count=true&$filter=day(ShippedDate)%20eq%201)
<br>Using `day`, one of many date and time functions, plus `$count` as a system query option, to show the number of orders

**Total order value for 1996**
<br>[Summary_of_Sales_by_Years?\$apply=filter(year(ShippedDate) eq 1996)/aggregate(Subtotal with sum as Total)](http://localhost:4004/northwind-model/Summary_of_Sales_by_Years?$apply=filter(year(ShippedDate)%20eq%201996)/aggregate(Subtotal%20with%20sum%20as%20Total))
<br>Using `year` with a bonus digression on aggregation via `$apply`

### Arithmetic functions

**Products with pennies in the unit price**
<br>[Products?\$filter=round(UnitPrice) ne UnitPrice](http://localhost:4004/northwind-model/Products?$filter=round(UnitPrice)%20ne%20UnitPrice)
<br>Rounding the `UnitPrice` value with `round` and comparing it to what it was with the logical operator `ne`

## More advanced usage

**Just for info - discontinued products and their categories, by category**
<br>[Products?\$filter=Discontinued eq true&\$select=ProductName\&\$expand=Category($select=CategoryName,CategoryID)&\$orderby=Category/CategoryID](http://localhost:4004/northwind-model/Products?$filter=Discontinued%20eq%20true&$select=ProductName&$expand=Category($select=CategoryName,CategoryID)&$orderby=Category/CategoryID)

### Using a lambda operator

**Categories that have high stock products**
<br>[Categories?\$expand=Products&\$filter=Products/any(x:x/UnitsInStock gt 100)](http://localhost:4004/northwind-model/Categories?$expand=Products&$filter=Products/any(x:x/UnitsInStock%20gt%20100))
<br>You can filter on the expanded collection (but this example is probably not what you want)

**Categories with no discontinued products**
<br>[Categories?\$expand=Products&\$filter=Products/all(x:x/Discontinued eq false)](http://localhost:4004/northwind-model/Categories?$expand=Products&$filter=Products/all(x:x/Discontinued%20eq%20false))
<br>Using the `all` lambda operator (as opposed to `any`)

**Categories with at least some stock for every product**
<br>[Categories?\$expand=Products($select=ProductName)&\$filter=Products/all(x:x/UnitsInStock gt 0)](http://localhost:4004/northwind-model/Categories?$expand=Products($select=ProductName)&$filter=Products/all(x:x/UnitsInStock%20gt%200))
<br>Another example using `all`, and restricting the expanded collection data to just the product name

### Applying filter to an expanded navigation property

**Categories and their discontinued products**
<br>[Categories?\$expand=Products($filter=Discontinued eq true)](http://localhost:4004/northwind-model/Categories?$expand=Products($filter=Discontinued%20eq%20true))
<br>A `$filter` query option can be applied to the expanded navigation property

**Categories and the names of their discontinued products**
<br>[Categories?\$expand=Products(\$filter=Discontinued eq true;\$select=ProductName)](http://localhost:4004/northwind-model/Categories?$expand=Products($filter=Discontinued%20eq%20true;$select=ProductName))
<br>Multiple system query options can be applied, separated by semicolons

**A better list of categories and their discontinued products**
<br>[Categories?\$expand=Products(\$filter=Discontinued eq true)&\$filter=Products/any(x:x/Discontinued eq true)](http://localhost:4004/northwind-model/Categories?$expand=Products($filter=Discontinued%20eq%20true)&$filter=Products/any(x:x/Discontinued%20eq%20true))
<br>Combining a `$filter` on the expanded navigation property with a `$filter` using the `any` lambda operator

### Miscellaneous

**Email addresses in the 'example' domain for a person**
<br>[TripPinServiceRW/People('russellwhyte')/Emails?\$filter=contains($it,'example')](https://services.odata.org/V4/(S(lx1imovv1xsufthdbddd4sps))/TripPinServiceRW/People('russellwhyte')/Emails?$filter=contains($it,%27example%27))
<br>Using the `$it` literal to refer back to the collection in the resource path (here `Emails` is just an array of string values)
