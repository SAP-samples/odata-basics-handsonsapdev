# Sample app demonstrating some OData annotations

This is the complete app that is built over the series of exercises in the (now archived) [repo for the SAP CodeJam on CAP with Node.js](https://github.com/SAP-archive/cloud-cap-nodejs-codejam). It is included in this repo as it is a good illustration of some basic annotations. In particular, have a look at the annotations in the `index.cds` and `service.cds` files in the `srv/` directory.

## Getting things running

Move to this directory and start things up, like this:

```bash
cd workingapp
cds watch
```

## The annotations

Here's a brief overview of the annotations used in the service which is part of this app. Note that the word "annotation" is used in two different contexts here:

- [CAP annotations](https://cap.cloud.sap/docs/cds/annotations) in CDS form are used to describe and augment core data service definitions, and are prefixed with the `@` symbol
- [OData annotations](http://docs.oasis-open.org/odata/odata-vocabularies/v4.0/odata-vocabularies-v4.0.html), organised into [vocabularies](https://github.com/oasis-tcs/odata-vocabularies), that provide extra information on service metadata

When used in an OData context (i.e. when describing an OData service in CDS) the CAP annotations will result in valid OData annotations. These annotations will belong to either standard OData vocabularies, or SAP specific vocabularies.

> Note that "A service MUST NOT require the client to understand custom annotations in order to accurately interpret a response" (see the [Vocabulary Extensibility section of OData Version 4.0. Part 1: Protocol Plus Errata 03](http://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html#_Toc453752215)). In other words, beyond annotations in the "Core" vocabulary, think of further annotations as suggestions.

### In service.cds

`@readonly`

Used at the entity level, this CDS annotation generates specific terms in the [OData "Capabilities" vocabulary](http://docs.oasis-open.org/odata/odata-vocabularies/v4.0/csprd01/odata-vocabularies-v4.0-csprd01.html#_Toc472083030).

Specifically, this line:

`@readonly entity OrderInfo as projection on my.Orders ...`

causes these OData annotation terms to be generated and included in the service metadata document: `DeleteRestrictions`, `InsertRestrictions` and `UpdateRestrictions`.

You can see this for yourself using the `cds` command line tool to generate EDMX for the `Stats` service defined within the `srv/service.cds` file, which looks like this:

```cds
using my.bookshop as my from '../db/schema';

// ...

service Stats {
  @readonly entity OrderInfo as projection on my.Orders excluding {
    createdAt,
    createdBy,
    modifiedAt,
    modifiedBy,
    book,
    country
  }
}
```

This is how you do it:

```bash
cds compile srv --service Stats --to edmx-v4
```

This produces the following output - note the `<Annotations>` element:

```xml
<?xml version="1.0" encoding="utf-8"?>
<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">
  <edmx:Reference Uri="https://oasis-tcs.github.io/odata-vocabularies/vocabularies/Org.OData.Capabilities.V1.xml">
    <edmx:Include Alias="Capabilities" Namespace="Org.OData.Capabilities.V1"/>
  </edmx:Reference>
  <edmx:DataServices>
    <Schema Namespace="Stats" xmlns="http://docs.oasis-open.org/odata/ns/edm">
      <EntityContainer Name="EntityContainer">
        <EntitySet Name="OrderInfo" EntityType="Stats.OrderInfo"/>
      </EntityContainer>
      <EntityType Name="OrderInfo">
        <Key>
          <PropertyRef Name="ID"/>
        </Key>
        <Property Name="ID" Type="Edm.Guid" Nullable="false"/>
        <Property Name="quantity" Type="Edm.Int32"/>
      </EntityType>
      <Annotations Target="Stats.EntityContainer/OrderInfo">
        <Annotation Term="Capabilities.DeleteRestrictions">
          <Record Type="Capabilities.DeleteRestrictionsType">
            <PropertyValue Property="Deletable" Bool="false"/>
          </Record>
        </Annotation>
        <Annotation Term="Capabilities.InsertRestrictions">
          <Record Type="Capabilities.InsertRestrictionsType">
            <PropertyValue Property="Insertable" Bool="false"/>
          </Record>
        </Annotation>
        <Annotation Term="Capabilities.UpdateRestrictions">
          <Record Type="Capabilities.UpdateRestrictionsType">
            <PropertyValue Property="Updatable" Bool="false"/>
          </Record>
        </Annotation>
      </Annotations>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>
```

These annotation terms basically say - to those consuming apps that can interpret them - that delete, insert or update operations may not be performed on the `OrderInfo` entity.

In case you're wondering - these restrictions that are imposed via the `@readonly` decoration in the CDS definition are actually implemented in CAP.

Assuming that the service is running (with `cds run`) you can try this yourself, like this:

```bash
curl --silent \
  --header 'Content-Type: application/json' \
  --include \
  --data '{"quantity": 10}' \
  --url 'http://localhost:4004/stats/OrderInfo'
```

This produces the following:

```
HTTP/1.1 405 Method Not Allowed
X-Powered-By: Express
x-correlation-id: 3a80f986-2acd-4663-8116-d9b39d532f31
OData-Version: 4.0
content-type: application/json;odata.metadata=minimal
Date: Thu, 07 Jul 2022 10:57:04 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Content-Length: 104

{"error":{"code":"405","message":"Entity \"Stats.OrderInfo\" is read-only","@Common.numericSeverity":4}}
```

Nice!
