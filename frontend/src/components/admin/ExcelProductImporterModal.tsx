import React, { useState } from "react";
import {
  X, FileSpreadsheet, Upload, Check, AlertCircle, Sparkles,
  Download, HelpCircle, ChevronDown, ChevronUp, CheckCircle2, Edit3
} from "lucide-react";
import { Product } from "../../types";
import DirhamSymbol from "../common/DirhamSymbol";

interface ExcelProductImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProducts: (products: Product[]) => void;
}

// Robust CSV parser supporting tab-separated and comma-separated with quoted fields
function parseCsvRow(rowText: string): string[] {
  if (rowText.includes("\t")) {
    return rowText.split("\t").map((p) => p.trim().replace(/^["']|["']$/g, ""));
  }

  const cells: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < rowText.length; i++) {
    const char = rowText[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      cells.push(current.trim().replace(/^["']|["']$/g, ""));
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim().replace(/^["']|["']$/g, ""));
  return cells;
}

export default function ExcelProductImporterModal({
  isOpen,
  onClose,
  onImportProducts
}: ExcelProductImporterModalProps) {
  const [pasteText, setPasteText] = useState("");
  const [parsedPreview, setParsedPreview] = useState<Product[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [showFormatGuide, setShowFormatGuide] = useState(false);

  if (!isOpen) return null;

  // Standard column synonyms mapping (clean normalized string to standard field)
  const normalizeKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, "");

  const isNameField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("productname") || n.includes("producttitle") || n.includes("itemname") || n === "name" || n === "title" || n === "equipment";
  };

  const isSkuField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("modelsku") || n.includes("partnumber") || n.includes("partno") || n.includes("modelid") || n === "sku" || n === "model" || n.includes("itemcode");
  };

  const isBrandField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("brand") || n.includes("manufacturer") || n.includes("oembrand") || n === "make";
  };

  const isCategoryField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("category") || n.includes("producttype") || n.includes("equipmentcategory") || n === "type";
  };

  const isBadgeField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("promotionbadge") || n.includes("promotiontag") || n.includes("productbadge") || n === "badge" || n === "promotion" || n === "tag";
  };

  const isPriceField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("unitpriceaed") || n.includes("priceaed") || n.includes("unitprice") || n === "price" || n === "cost" || n === "rate" || n === "aed";
  };

  const isHidePriceField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("hideprice");
  };

  const isStockStatusField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("stockstatus") || n.includes("stockavailability") || n === "status" || n === "stock" || n.includes("availability");
  };

  const isMinOrderField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("minbulkorder") || n.includes("minorderqty") || n.includes("minorder") || n === "moq" || n.includes("minimumorder");
  };

  const isShowMoqField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("showmoq") || n.includes("displaymoq");
  };

  const isApplicationsField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("targetapplication") || n.includes("applications") || n === "application";
  };

  const isDescriptionField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("description") || n.includes("overview") || n.includes("productdescription") || n === "details" || n === "summary";
  };

  const isImageField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("coverphoto") || n.includes("imageurl") || n === "image" || n === "photo" || n === "picture" || n.includes("coverimage");
  };

  const isAdditionalImagesField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("additionalphoto") || n.includes("additionalimage") || n.includes("galleryimage") || n.includes("extraimage");
  };

  const isFeaturesField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("keyfeatures") || n.includes("highlights") || n === "features" || n.includes("bulletfeature");
  };

  const isDocTitleField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("doctitle") || n.includes("pdftitle") || n.includes("documenttitle") || n.includes("pdfname");
  };

  const isDocUrlField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("docurl") || n.includes("pdfurl") || n.includes("documenturl") || n.includes("pdflink");
  };

  const isStickerImageField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("stickerurl") || n.includes("emblemurl") || n.includes("emblemimage") || n.includes("stickerimage") || n.includes("starratingimage");
  };

  const isStickerTextField = (k: string) => {
    const n = normalizeKey(k);
    return n.includes("stickerlabel") || n.includes("emblemtext") || n.includes("tooltiptext") || n.includes("stickertext");
  };

  // Main Parser: Header-based auto detection + strict zero dummy data
  const parseSpreadsheetData = (text: string) => {
    try {
      const rawLines = text.trim().split("\n").map((l) => l.trim()).filter(Boolean);
      if (rawLines.length === 0) {
        setParsedPreview([]);
        setErrorMsg("");
        return;
      }

      // First line check
      const firstRowCells = parseCsvRow(rawLines[0]);
      const hasHeaderRow = firstRowCells.some((c) => {
        const n = normalizeKey(c);
        return n.includes("name") || n.includes("product") || n.includes("sku") || n.includes("brand") || n.includes("price") || n.includes("category");
      });

      let headers: string[] = [];
      let dataRows: string[] = [];

      if (hasHeaderRow) {
        headers = firstRowCells;
        dataRows = rawLines.slice(1);
      } else {
        // Fallback positional headers if user pasted data rows directly without a header line
        headers = ["Product Name", "Model SKU", "Brand", "Category", "Unit Price (AED)", "Stock Status"];
        dataRows = rawLines;
      }

      const importedProducts: Product[] = [];

      dataRows.forEach((row, rowIdx) => {
        const cells = parseCsvRow(row);
        if (cells.length === 0 || cells.every((c) => !c)) return;

        let name = "";
        let modelId = "";
        let brand = "";
        let category = "Air Conditioners";
        let badge: string | undefined = undefined;
        let price = 0;
        let hasPrice = false;
        let hidePriceExplicit: boolean | null = null;
        let stockStatus = "In Stock & Ready to Ship";
        let minOrderQty = 1;
        let showMinOrderQty = false;
        let applications: string[] = [];
        let description = "";
        let image = "";
        let additionalImages: string[] = [];
        let features: string[] = [];
        let docTitle = "";
        let docUrl = "";
        let emblemImage = "";
        let emblemText = "";
        const customSpecs: Record<string, string> = {};

        cells.forEach((val, colIdx) => {
          const rawVal = val.trim();
          if (!rawVal) return; // Leave missing fields blank!

          const headerName = headers[colIdx] || `Column_${colIdx + 1}`;

          if (isNameField(headerName)) {
            name = rawVal;
          } else if (isSkuField(headerName)) {
            modelId = rawVal;
          } else if (isBrandField(headerName)) {
            brand = rawVal;
          } else if (isCategoryField(headerName)) {
            category = rawVal;
          } else if (isBadgeField(headerName)) {
            badge = rawVal;
          } else if (isPriceField(headerName)) {
            const parsedPrice = parseFloat(rawVal.replace(/[^0-9.]/g, ""));
            if (!isNaN(parsedPrice) && parsedPrice > 0) {
              price = parsedPrice;
              hasPrice = true;
            }
          } else if (isHidePriceField(headerName)) {
            const lower = rawVal.toLowerCase();
            hidePriceExplicit = lower === "yes" || lower === "true" || lower === "1";
          } else if (isStockStatusField(headerName)) {
            stockStatus = rawVal;
          } else if (isMinOrderField(headerName)) {
            const parsedQty = parseInt(rawVal.replace(/[^0-9]/g, ""), 10);
            if (!isNaN(parsedQty) && parsedQty > 0) {
              minOrderQty = parsedQty;
            }
          } else if (isShowMoqField(headerName)) {
            const lower = rawVal.toLowerCase();
            showMinOrderQty = lower === "yes" || lower === "true" || lower === "1";
          } else if (isApplicationsField(headerName)) {
            applications = rawVal.split(",").map((a) => a.trim()).filter(Boolean);
          } else if (isDescriptionField(headerName)) {
            description = rawVal;
          } else if (isImageField(headerName)) {
            image = rawVal;
          } else if (isAdditionalImagesField(headerName)) {
            additionalImages = rawVal.split(/[|,]/).map((img) => img.trim()).filter(Boolean);
          } else if (isFeaturesField(headerName)) {
            features = rawVal.split(/[|\n]/).map((f) => f.trim()).filter(Boolean);
          } else if (isDocTitleField(headerName)) {
            docTitle = rawVal;
          } else if (isDocUrlField(headerName)) {
            docUrl = rawVal;
          } else if (isStickerImageField(headerName)) {
            emblemImage = rawVal;
          } else if (isStickerTextField(headerName)) {
            emblemText = rawVal;
          } else {
            // Any other column header becomes a real technical specification
            customSpecs[headerName.trim()] = rawVal;
          }
        });

        // Product Name is the only strictly required field
        if (!name) {
          name = cells[1] || cells[0] || "";
        }

        if (name) {
          if (modelId) {
            customSpecs["Part Number / SKU"] = modelId;
          }

          const documents = (docUrl || docTitle) ? [{ name: docTitle || "Technical Specifications PDF", url: docUrl || "" }] : [];

          importedProducts.push({
            id: `prod-import-${Date.now()}-${rowIdx}-${Math.floor(Math.random() * 1000)}`,
            name: name.trim(),
            category: category.trim() || "Air Conditioners",
            brand: brand.trim() || undefined,
            modelId: modelId.trim() || undefined,
            badge: badge && badge.toLowerCase() !== "none" ? badge.trim() : undefined,
            price: hasPrice ? price : 0,
            hidePrice: hidePriceExplicit !== null ? hidePriceExplicit : !hasPrice,
            stockStatus: stockStatus || "In Stock & Ready to Ship",
            inStock: !stockStatus.toLowerCase().includes("out"),
            minOrderQty: minOrderQty > 0 ? minOrderQty : 1,
            showMinOrderQty: showMinOrderQty,
            applications: applications.length > 0 ? applications : undefined,
            description: description.trim() || undefined,
            image: image.trim() || undefined,
            images: additionalImages.length > 0 ? additionalImages : undefined,
            emblemImage: emblemImage.trim() || undefined,
            emblemText: emblemText.trim() || undefined,
            emblemSize: "large",
            specifications: Object.keys(customSpecs).length > 0 ? customSpecs : {},
            features: features.length > 0 ? features : [],
            documents: documents.length > 0 ? documents : undefined
          });
        }
      });

      setParsedPreview(importedProducts);
      setErrorMsg(importedProducts.length === 0 ? "No valid products with a name could be found in the data." : "");
    } catch (err: any) {
      setErrorMsg("Failed to parse spreadsheet data. Please check your Excel columns or commas.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPasteText(content);
      parseSpreadsheetData(content);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPasteText(text);
    parseSpreadsheetData(text);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) {
      alert("No valid product rows parsed yet. Please paste or upload your spreadsheet file.");
      return;
    }
    onImportProducts(parsedPreview);
    onClose();
  };

  // Download Sample Template (.csv)
  const handleDownloadTemplate = () => {
    const csvContent =
      "Product Title,Product Description,Model ID / SKU,Manufacturer Brand,Equipment Category,Promotion Badge,Unit Price (AED),Hide Price,Min Bulk Order,Show MOQ Badge,Stock Availability Status,Target Applications,Cover Photo URL,Additional Photo URLs,Nominal Cooling Capacity,Type of Compressor,Refrigerant,Maximum Ambient,Voltage / Power Supply,Annual Energy Consumption (kWh / Year),T3 - Cooling Capacity (BTU/h),T3 - Cooling Capacity (kW),T3 - Rated Power Input (Watts),T3 - Rated Current (A),T3 - EER (BTU/h / W),T3 - Coefficient of Performance (COP),Country of Origin,Key Features & Highlights,Technical PDF Doc Title,Technical PDF Doc URL\n" +
      'Daikin Fit Slim VRF Outdoor Unit (5-Ton),"High-efficiency slim VRF commercial outdoor unit engineered for extreme Middle East ambient temperatures up to 52°C with variable refrigerant technology.",RXYQ5AY1,Daikin,VRF Systems,Best Seller,4850,No,1,Yes,In Stock & Ready to Ship,"Commercial Buildings, Luxury Villas, Retail Showrooms, Offices",https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80,,60000 BTU/h / 5.0 Ton,Inverter Scroll,R-410a,52°C,380-415V / 3Ph / 50Hz,4850 kWh/yr,52000 BTU/h,15.24 kW,4600 W,7.8 A,11.3,3.31,Japan,Anti-corrosion Blue Fin heat exchanger | Variable refrigerant temperature control | Compact slim footprint design,Daikin VRF Slim Technical Data Book PDF,https://cooltechnologies.ae/docs/daikin-vrf-specs.pdf\n' +
      'Blue Star 1.5 TR Rotary Window AC,"Reliable and energy-efficient 1.5 TR window air conditioner with hydrophilic blue fins and high-torque rotary compressor for commercial and residential cooling.",WM18CLYFC3-01,Blue Star,Window A/C,Featured,1350,No,2,Yes,In Stock & Ready to Ship,"Bedrooms, Offices, Apartments, Retail Spaces",https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1200&q=80,,1.5 TR / 18000 BTU/h,High-Efficiency Rotary,R-410a,55°C,220-240V / 1Ph / 50Hz,1450 kWh/yr,15800 BTU/h,4.63 kW,1420 W,6.5 A,11.12,3.26,India,Hydrophilic Blue Fins | 100% Copper condenser tubes | Eco-friendly refrigerant | High ambient cooling up to 55°C,Blue Star Window AC Technical Brochure,https://cooltechnologies.ae/docs/bluestar-window-specs.pdf\n' +
      'Krome Commercial Split Air Conditioner 2.5 Ton,"Heavy-duty 2.5 Ton split air conditioning unit tailored for GCC tropical weather with fast pull-down cooling and quiet air circulation.",KRM-SPL-30C,Krome,Split A/C,New,,Yes,5,No,In Stock & Ready to Ship,"Offices, Restaurants, Classrooms",,,,30000 BTU/h / 2.5 Ton,Tropical Rotary,R-410a,54°C,220-240V / 1Ph / 50Hz,,26500 BTU/h,7.76 kW,2450 W,11.2 A,10.8,3.17,UAE,Tropicalized compressor for GCC climates | Anti-dust filtration system | Low noise indoor blower,,';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "cooltech_products_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#031b4e] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-white flex items-center gap-2">
                <span>Import Products from Excel / CSV</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Zero Dummy Data
                </span>
              </h2>
              <p className="text-[11px] text-blue-200">
                Upload `.csv`/`.tsv` or copy-paste rows from Excel. Missing fields stay blank for easy manual editing later.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Download clean CSV template with standard column headers"
            >
              <Download size={13} />
              <span>Download Excel Template (.csv)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Format Guide Info Banner */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle size={15} className="text-blue-700 shrink-0" />
                <span className="text-xs font-black text-blue-950">
                  How Bulk Uploading Works (Partial &amp; Full Data Supported)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFormatGuide(!showFormatGuide)}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>{showFormatGuide ? "Hide Column Format" : "View Supported Columns"}</span>
                {showFormatGuide ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            <p className="text-[11px] text-blue-900 leading-relaxed">
              • <strong>Only Product Name is required.</strong> Any other column you leave blank will stay completely empty.<br />
              • <strong>No Dummy Data:</strong> The system will never inject fake photos, fake descriptions, or dummy warranties.<br />
              • <strong>Horizontal Technical Specs:</strong> Any column header not in the standard list is automatically imported horizontally as a Technical Specification parameter (e.g. Nominal Cooling Capacity, Refrigerant, Compressor, Voltage).<br />
              • <strong>Edit Later:</strong> You can click <em>"Edit"</em> on any imported product in the admin portal to modify specs, photos, or stickers.
            </p>

            {/* Collapsible Format Table */}
            {showFormatGuide && (
              <div className="mt-3 pt-3 border-t border-blue-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-blue-950 uppercase text-[10px] tracking-wider">Standard Modal Columns:</h4>
                  <ul className="list-disc list-inside text-blue-900 space-y-0.5">
                    <li><strong className="text-slate-900">Product Title</strong> (Required)</li>
                    <li><strong className="text-slate-900">Product Description</strong> (Overview summary)</li>
                    <li><strong className="text-slate-900">Model ID / SKU</strong> (e.g. RXYQ5AY1)</li>
                    <li><strong className="text-slate-900">Manufacturer Brand</strong> (e.g. Daikin, Blue Star)</li>
                    <li><strong className="text-slate-900">Equipment Category</strong> (e.g. Window A/C, VRF)</li>
                    <li><strong className="text-slate-900">Promotion Badge</strong> (Best Seller, Featured, New, Popular, None)</li>
                    <li><strong className="text-slate-900">Unit Price (AED) &amp; Hide Price</strong> (Yes/No)</li>
                    <li><strong className="text-slate-900">Min Bulk Order &amp; Show MOQ Badge</strong> (Yes/No)</li>
                    <li><strong className="text-slate-900">Stock Availability Status</strong> (In Stock &amp; Ready to Ship)</li>
                    <li><strong className="text-slate-900">Target Applications</strong> (Comma-separated in cell)</li>
                    <li><strong className="text-slate-900">Cover Photo URL &amp; Additional Photo URLs</strong></li>
                    <li><strong className="text-slate-900">Key Features &amp; Highlights</strong> (Separated by |)</li>
                    <li><strong className="text-slate-900">Technical PDF Doc Title &amp; URL</strong></li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-blue-950 uppercase text-[10px] tracking-wider">Horizontal Technical Specifications:</h4>
                  <p className="text-blue-900 leading-normal">
                    Add <strong>any technical parameter as its own column</strong> horizontally! They will automatically become product specifications:
                  </p>
                  <ul className="list-disc list-inside text-blue-900 space-y-0.5 font-mono text-[10px]">
                    <li>Nominal Cooling Capacity</li>
                    <li>Type of Compressor</li>
                    <li>Refrigerant</li>
                    <li>Maximum Ambient</li>
                    <li>Voltage / Power Supply</li>
                    <li>Annual Energy Consumption (kWh / Year)</li>
                    <li>T3 - Cooling Capacity (BTU/h / kW)</li>
                    <li>T3 - Rated Power Input / Current</li>
                    <li>T3 - EER / COP</li>
                    <li>Country of Origin</li>
                    <li><em>+ Any new parameter you add in the future!</em></li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-blue-50/40 hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-file-input"
            />
            <label htmlFor="excel-file-input" className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
              <Upload size={22} className="text-[#2596be]" />
              <span className="text-xs font-extrabold text-slate-800">Click to Select CSV / Excel File</span>
              <span className="text-[10px] text-slate-400 font-semibold">Supports .csv, .tsv, and copied Excel tables</span>
            </label>
          </div>

          {/* Direct Paste Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                OR Paste Spreadsheet Table Rows Directly from Excel:
              </label>
              {pasteText && (
                <button
                  type="button"
                  onClick={() => {
                    setPasteText("");
                    setParsedPreview([]);
                    setErrorMsg("");
                  }}
                  className="text-[10px] font-bold text-slate-400 hover:text-red-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              rows={5}
              placeholder={"Paste your Excel rows here with or without headers:\nProduct Title\tModel ID / SKU\tManufacturer Brand\tEquipment Category\tUnit Price (AED)\tNominal Cooling Capacity\tRefrigerant\tTarget Applications\nDaikin Fit Slim VRF Outdoor Unit (5-Ton)\tRXYQ5AY1\tDaikin\tVRF Systems\t4850\t60,000 BTU/h\tR-410a\tCommercial Buildings, Villas, Offices"}
              value={pasteText}
              onChange={handleTextChange}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono bg-slate-50 focus:outline-none focus:border-blue-600 leading-relaxed"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Preview Counter */}
          {parsedPreview.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span className="text-xs font-extrabold text-emerald-900">
                  Successfully Parsed {parsedPreview.length} Product Records!
                </span>
                <span className="text-[10px] text-emerald-700 font-bold hidden sm:inline">
                  (Zero dummy placeholders added)
                </span>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white font-mono font-bold px-2.5 py-0.5 rounded shadow-2xs">
                Ready to Import
              </span>
            </div>
          )}

          {/* Preview Table */}
          {parsedPreview.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto shadow-2xs">
              <table className="w-full text-left text-[11px] text-slate-700">
                <thead className="bg-slate-100 font-black uppercase text-[10px] text-slate-500 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Product Name</th>
                    <th className="p-2.5">Model SKU</th>
                    <th className="p-2.5">Brand</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Price</th>
                    <th className="p-2.5">Specs Included</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {parsedPreview.slice(0, 15).map((item, i) => {
                    const specsCount = Object.keys(item.specifications || {}).length;
                    return (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="p-2.5 text-slate-400">{i + 1}</td>
                        <td className="p-2.5 font-extrabold text-slate-900 max-w-[220px] truncate" title={item.name}>
                          {item.name}
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">
                          {item.modelId || <span className="text-slate-300 italic">None</span>}
                        </td>
                        <td className="p-2.5">
                          {item.brand || <span className="text-slate-300 italic">None</span>}
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {item.category}
                        </td>
                        <td className="p-2.5 font-bold">
                          {!item.hidePrice && item.price && item.price > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[#031b4e]">
                              <DirhamSymbol className="h-2.5 w-auto" />
                              <span>AED {item.price.toLocaleString()}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                              Call for Price
                            </span>
                          )}
                        </td>
                        <td className="p-2.5">
                          {specsCount > 0 ? (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              {specsCount} specs
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">0 specs (edit later)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {parsedPreview.length > 15 && (
                <div className="p-2 bg-slate-50 text-center text-[10px] font-bold text-slate-500 border-t border-slate-200">
                  + {parsedPreview.length - 15} more products ready for import...
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={parsedPreview.length === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md flex items-center gap-1.5 transition-all ${
              parsedPreview.length > 0
                ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-emerald-900/20 active:scale-95"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            <Sparkles size={15} />
            <span>Import {parsedPreview.length} Products into Catalog</span>
          </button>
        </div>

      </div>
    </div>
  );
}
