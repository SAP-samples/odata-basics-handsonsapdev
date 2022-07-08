# Sample app demonstrating some OData annotations

> ⚠ This document is a work-in-progress!

This is the complete app that is built over the series of exercises in the (now archived) [repo for the SAP CodeJam on CAP with Node.js](https://github.com/SAP-archive/cloud-cap-nodejs-codejam). It is included in this repo as it is a good illustration of some basic annotations. In particular, have a look at the annotations in the `index.cds` and `service.cds` files in the `srv/` directory.

## Getting things running

Move to this directory and start things up, like this:

```bash
cd workingapp
cds watch
```

## The annotations

Here's a brief overview of the annotations used in the service which is part of this app. Note that the word "annotation" is used in two different contexts here:

- [Annotations in CAP](https://cap.cloud.sap/docs/cds/annotations) in CDS form are used to describe and augment core data service definitions, and are prefixed with the `@` symbol
- [OData annotations](http://docs.oasis-open.org/odata/odata-vocabularies/v4.0/odata-vocabularies-v4.0.html), organised into [vocabularies](https://github.com/oasis-tcs/odata-vocabularies), that provide extra information on an OData service's metadata and appear in the EDMX definition (in the `$metadata` document)

When used in an OData context (i.e. when describing an OData service in CDS) the CAP annotations will result in valid OData annotations. These annotations will belong to either standard OData vocabularies, or SAP specific vocabularies.

> Note that "A service MUST NOT require the client to understand custom annotations in order to accurately interpret a response" (see the [Vocabulary Extensibility section of OData Version 4.0. Part 1: Protocol Plus Errata 03](http://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part1-protocol/odata-v4.0-errata03-os-part1-protocol-complete.html#_Toc453752215)). In other words, beyond annotations in the "Core" vocabulary, think of further annotations as suggestions.

### In service.cds

CDS annotation: `@readonly`

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
curl
  --silent \
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

### In index.cds

In this file you can see the explicit [annotate](https://cap.cloud.sap/docs/cds/cdl#annotate) directive in action. This is contrast to the previous example, where the `@readonly` annotation was specified directly with the definition of what was being annotated.

```cds
annotate CatalogService.Books with @(
    UI: {
        Identification: [ {Value: title} ],
        SelectionFields: [ title ],
        LineItem: [
            {Value: ID},
            {Value: title},
            {Value: author.name},
            {Value: author_ID},
            {Value: stock}
        ],
        HeaderInfo: {
            TypeName: '{i18n>Book}',
            TypeNamePlural: '{i18n>Books}',
            Title: {Value: title},
            Description: {Value: author.name}
        }
    }
);
```

This example is considerably more involved than the `@readonly` example previously. Let's take it bit by bit. You may also want to refer to the [OData Annotations section of the CAP documentation](https://cap.cloud.sap/docs/advanced/odata#annotations).

#### OData annotation vocabularies

The previous `@readonly` example was a CDS annotation that resulted in the generation of multiple OData annotations.

In this current example, what we're looking at are annotations that are closer to the direct use of the combination of the OData annotation concepts of Vocabulary and Term. To understand this better, let's stare at the OData annotation vocabularies for a bit.

The standards document [OData Vocabularies Version 4.0 Committee Specification / Public Review Draft 01](http://docs.oasis-open.org/odata/odata-vocabularies/v4.0/odata-vocabularies-v4.0.html) outlines six vocabularies as follows (the summary document [OData specs](https://github.com/qmacro/odata-specs/blob/master/overview.md) provides some information on the different document stages such as "Committee Specification" and "Public Review"):

|Vocabulary|Namespace|Description|
|-|-|-|
|Core|[Org.OData.Core.V1](https://github.com/oasis-tcs/odata-vocabularies/blob/main/vocabularies/Org.OData.Core.V1.md)|Terms describing behavioral aspects along with annotation terms that can be used to define other vocabularies (yes, meta all the things!)|
|Capabilities|[Org.OData.Capabilities.V1](https://github.com/oasis-tcs/odata-vocabularies/blob/main/vocabularies/Org.OData.Capabilities.V1.md)|Terms that provide a way for service authors to describe certain capabilities of an OData Service|
|Measures|[Org.OData.Measures.V1](https://github.com/oasis-tcs/odata-vocabularies/blob/main/vocabularies/Org.OData.Measures.V1.md)|Terms describing monetary amounts and measured quantities|
|Validation|[Org.OData.Validation.V1](https://github.com/oasis-tcs/odata-vocabularies/blob/main/vocabularies/Org.OData.Validation.V1.md)|Terms describing validation rules|
|Aggregation|[Org.OData.Aggregation.V1](https://github.com/oasis-tcs/odata-vocabularies/blob/main/vocabularies/Org.OData.Aggregation.V1.md)|Terms describing which data in a given entity model can be aggregated, and how|
|Authorization|[Org.OData.Authorization.V1](https://github.com/oasis-tcs/odata-vocabularies/blob/main/vocabularies/Org.OData.Authorization.V1.md)|Terms describing a web authorization flow|

> If you like rabbit-holes, note that all the vocabularies are described in machine-readable format ... using terms in the Core vocabulary. [Even the Core vocabulary itself](https://github.com/oasis-tcs/odata-vocabularies/blob/main/vocabularies/Org.OData.Core.V1.xml). Don't forget to come back once you've explored!

In the [Introduction](http://docs.oasis-open.org/odata/odata-vocabularies/v4.0/csprd01/odata-vocabularies-v4.0-csprd01.html#_Toc472083025) section of the standards document, it says that:

> Other OData vocabularies may be created, shared, and maintained outside of this work product.

And so there are other OData annotation vocabularies, for different purposes. SAP has created some, and they are documented publicly in the [SAP/odata-vocabularies](https://github.com/SAP/odata-vocabularies) repository on GitHub. There are vocabularies called Analytics, Communication, DataIntegration and also one called [Common](https://github.com/SAP/odata-vocabularies/blob/main/vocabularies/Common.md) which contains terms common for all SAP vocabularies.

#### The UI annotation vocabulary

Another vocabulary in that list from SAP is the [UI](https://github.com/SAP/odata-vocabularies/blob/main/vocabularies/UI.md) vocabulary, containing terms relating to presenting data in user interfaces.

Staring at [the table of Terms](https://github.com/SAP/odata-vocabularies/blob/main/vocabularies/UI.md#terms) in this vocabulary (or any for that matter) will help us interpret the CDS in `index.cds` we saw earlier, in other words, this:

```cds
annotate CatalogService.Books with @( ... );
```

And specifically it will help us to interpret everything inside the `@( ... )`.
