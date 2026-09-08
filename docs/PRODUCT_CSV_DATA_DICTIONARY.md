# 📋 Cool Technologies — Product Catalog CSV Data Dictionary & Column Guide

This specification maps **every single field** from the Cool Technologies website product management system into standardized CSV / Google Sheet columns.

---

## 📁 File Summary
- **Template File**: [`cool_technologies_product_catalog_template.csv`](./cool_technologies_product_catalog_template.csv)
- **File Format**: Standard CSV (Comma-Separated Values, UTF-8 Encoded)
- **Compatibility**: Google Sheets, Microsoft Excel, Apple Numbers, Database Importers

---

## 📑 Complete Columns Overview

| # | CSV Column Header | Data Type | Required? | Example Value | Description / Instructions |
|---|---|---|---|---|---|
| **1** | `product_title` | Text | **Yes** | `Daikin Fit Slim VRF Outdoor Unit (5-Ton)` | Full commercial model title displayed on product cards, header, and quotation lines. |
| **2** | `equipment_category` | Dropdown | **Yes** | `Air Conditioners` | Must match one of the standard catalog categories *(see Category list below)*. |
| **3** | `manufacturer_brand` | Dropdown | **Yes** | `Daikin` | OEM manufacturer name *(see Brand list below)*. |
| **4** | `unit_price_usd` | Number | **Yes** | `1500` | Base B2B wholesale unit price in USD (Numbers only, no `$` sign). |
| **5** | `hide_price` | Boolean | Optional | `FALSE` | `TRUE` to hide price and display **"Contact for Wholesale Rate (Call for Price)"**; `FALSE` to show numeric price. |
| **6** | `min_order_qty` | Integer | Optional | `1` | Minimum Order Quantity (B2B MOQ) required for purchase or quote. |
| **7** | `star_rating` | Decimal | Optional | `4.9` | Rating between `1.0` and `5.0`. |
| **8** | `image_url` | URL / Path | **Yes** | `https://cdn.cooltechuae.com/products/daikin_vrf_5t.jpg` | Public CDN image URL or Cloudflare R2 path for the main equipment visual. |
| **9** | `product_description` | Long Text | **Yes** | `The Daikin Fit Slim VRF Outdoor Unit...` | Comprehensive product overview, operational parameters, and high-level engineering summary. |
| **10** | `in_stock` | Boolean | Optional | `TRUE` | `TRUE` if currently available in UAE warehouse / supplier stock; `FALSE` if Backorder / Factory Build. |
| **11** | `model_sku` | Text | Optional | `DAI-VRF-5T-2026` | Manufacturer Model Number, Part Number, or Internal CoolTech SKU code. |
| **12** | `series` | Text | Optional | `DAI-AIR-SLIM` | Equipment product line or family series (e.g. `VRV IV`, `Scroll-Pro`, `V6 Modular`). |
| **13** | `sourcing_channel` | Text | Optional | `DIRECT OEM WHOLESALE` | Procurement route (e.g. `DIRECT OEM WHOLESALE`, `AUTHORIZED DISTRIBUTOR`, `CUSTOM FABRICATION`). |
| **14** | `quality_certification` | Text | Optional | `CE / AHRI CERTIFIED` | Industry standards (e.g. `CE / AHRI / EUROVENT / ISO 9001 / UL Listed`). |
| **15** | `primary_region` | Text | Optional | `GCC & UAE MARKET` | Regional climate rating (e.g. `GCC & UAE T3 HIGH AMBIENT`, `GLOBAL 50/60HZ`). |
| **16** | `target_applications` | Comma List | Optional | `Commercial Complexes, Data Centers, Hospitals` | Industry use-cases separated by commas. |
| **17** | `technical_specifications` | Key:Value List | Optional | `Cooling Capacity: 60,000 BTU/h \| Refrigerant: R-410A \| Power: 380V/3Ph/50Hz` | Technical spec sheet table. Separate pairs with a pipe `\|` (e.g. `Param: Value \| Param: Value`). |
| **18** | `bullet_features` | Semicolon List | Optional | `Inverter compressor; Anti-corrosion Blue Fin; 10-Yr warranty` | Highlighted bullet points separated by semicolons (`;`). |
| **19** | `pdf_spec_sheet_url` | URL | Optional | `https://example.com/specs/daikin_vrf_spec.pdf` | Direct link to downloadable PDF technical brochure / cut sheet. |
| **20** | `cad_drawing_url` | URL | Optional | `https://example.com/cad/daikin_vrf_cad.dwg` | Direct link to CAD installation layout / BIM Revit drawing (if available). |
| **21** | `seo_meta_title` | Text (30-65 chars) | Optional | `Daikin Fit Slim VRF Outdoor Unit Sourcing Dubai \| Cool Technologies` | Search engine title tag for Google indexing. |
| **22** | `seo_meta_description` | Text (70-160 chars) | Optional | `Direct B2B OEM wholesale Daikin VRF units in Dubai and UAE. High ambient T3 tropical compressor.` | Search engine snippet description. |
| **23** | `seo_keywords` | Comma List | Optional | `Daikin VRF Dubai, Commercial AC Sourcing UAE, B2B HVAC` | High-value SEO keywords separated by commas. |

---

## 🏷️ Standard Dropdown Options

### Equipment Categories (`equipment_category`):
- `Air Conditioners`
- `HVAC Systems`
- `Compressors`
- `Coils & Heat Exchangers`
- `Controls & Thermostats`
- `Water Coolers & Dispensers`
- `Pumps & Motors`
- `Refrigerants & Fluids`

### Supported Brands (`manufacturer_brand`):
- `Daikin`
- `Midea`
- `Carrier`
- `Mitsubishi Heavy Industries`
- `Panasonic`
- `LG`
- `Samsung`
- `York`
- `Trane`
- `Blue Star`
- `Clivet`
- `Hisense`
- `TCL HVAC`
- `Gree`
- `Super General`
- `Copeland`
- `Danfoss`
- `Honeywell`
- `COOLTECH`
- *(Or any custom OEM brand name)*

---

## 💡 Best Practices for the Client

1. **Importing into Google Sheets**:
   - Go to **Google Drive &rarr; New &rarr; Google Sheets**.
   - Click **File &rarr; Import &rarr; Upload** and upload `cool_technologies_product_catalog_template.csv`.
   - Select **"Replace current sheet"** and Separator type **"Detect automatically"**.
2. **Boolean Fields**:
   - For `hide_price` and `in_stock`, write either `TRUE` or `FALSE` (in uppercase).
3. **Multi-Value Fields**:
   - **Bullet Features**: Separate each bullet with a semicolon (`;`).
   - **Technical Specifications**: Format as `Parameter: Value | Parameter: Value`.
   - **Keywords / Applications**: Separate with a comma (`,`).
4. **Quotation Marks**:
   - If a description or title contains commas, wrap the cell text in double quotation marks (`"..."`). Standard spreadsheet software does this automatically when exporting to CSV.
