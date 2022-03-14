const cors = require("cors");
const express = require("express");
const app = express();
app.use(cors());
fetch = require("node-fetch");
const { MongoClient, ObjectId } = require("mongodb");
let base64 = require("base-64");
const client = new MongoClient(
  "mongodb+srv://Shopogate:74sp1gX0DczV6Bnm@cluster0.j2lya.mongodb.net/Taxonomy?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const baseurl = "https://api.impact.com";

app.get("/walmartsports", async (req, res) => {
  await client.connect();
  const Maindb = client.db("MainDatabase");
  const db = client.db("Taxonomy");
  var run = 0;
  var next_url =
    baseurl +
    "/Mediapartners/IRqNxUD5KguY3257508WYgzweAZuY8UPj1/Catalogs/4308/Items?PageSize=400";
  while (run < 7225) {
    console.log(next_url);
    await fetch(next_url, {
      method: "GET",
      headers: {
        Authorization:
          "Basic " +
          base64.encode(
            "IRqNxUD5KguY3257508WYgzweAZuY8UPj1" +
              ":" +
              "tb-Byb6gtJv~rCAPCyjNrhdeLPKHVFY8"
          ),
        Accept: "application/json",
      },
    }).then(async (response) => {
      await response.json().then(async (data) => {
        let items = data.Items;
        var i = 0;
        console.log("after");
        console.log(data["@nextpageuri"]);
        next_url = await (baseurl + data["@nextpageuri"]);
        for (i == 0; i < items.length; i++) {
          console.log("Catalog Started:" + items[i].CatalogItemId);
          var category = items[i].Category;
          var subcat = items[i].SubCategory.split(".");
          var k = 0;
          var searchcategory = category + " ";
          for (k == 0; k < subcat.length; k++) {
            if (
              subcat[k].toLowerCase().trim() != "home page" &&
              !subcat[k].toLowerCase().includes("mens") &&
              !subcat[k].toLowerCase().includes("womens") &&
              !searchcategory.toLowerCase().includes(subcat[k].toLowerCase())
            ) {
              searchcategory += " " + subcat[k];
            } else if (subcat[k].toLowerCase().includes("-")) {
              searchcategory += " " + subcat[k].replace("-", "");
            }
          }

          var tax_item = await db
            .collection("taxonomy")
            .aggregate([
              {
                $search: {
                  index: "default",
                  text: {
                    query: searchcategory,
                    path: {
                      wildcard: "*",
                    },
                  },
                },
              },
              { $limit: 1 },
            ])
            .toArray();
          var categoryid =
            tax_item.length > 0 && typeof tax_item[0].taxid != "undefined"
              ? tax_item[0].taxid
              : "";
          let sendingdata = {
            CatalogId: items[i].CatalogId,
            CampaignId: items[i].CampaignId,
            CampaignName: items[i].CampaignName,
            ShopName: "Walmart",
            CatalogItemId: items[i].CatalogItemId,
            Name: items[i].Name,
            Description: items[i].Description,
            Manufacturer: items[i].Manufacturer,
            Url: items[i].Url,
            MobileUrl: items[i].MobileUrl,
            ImageUrl: items[i].ImageUrl,
            AdditionalImageUrls: items[i].AdditionalImageUrls,
            CurrentPrice: items[i].CurrentPrice,
            OriginalPrice: items[i].OriginalPrice,
            DiscountPercentage: items[i].DiscountPercentage,
            Currency: items[i].Currency,
            StockAvailability: items[i].StockAvailability,
            ExpirationDate: items[i].ExpirationDate,
            Gtin: items[i].Gtin,
            GtinType: items[i].GtinType,
            Asin: items[i].Asin,
            Mpn: items[i].Mpn,
            Category: categoryid,
            Colors: items[i].Colors,
            Material: items[i].Material,
            Size: items[i].Size,
            SizeUnit: items[i].SizeUnit,
            Condition: items[i].Condition,
            AgeGroup: items[i].AgeGroup,
            Gender: items[i].Gender,
            Adult: items[i].Adult,
            Uri: items[i].Uri,
            Tag: [],
          };
          const prod = Maindb.collection("Products");
          const inserted = await prod.insertOne(sendingdata);
          console.log("Catalog Finished:" + items[i].CatalogItemId);
        }
      });
    });
    run++;
  }
});
module.exports = app;
