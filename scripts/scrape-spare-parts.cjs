const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://admin.theaccompany.ae/wp-json/wc/store/v1/products';
const CATEGORY_ID = 17; // AC Spare Parts
const PER_PAGE = 100;
const CONCURRENCY = 4;
const MAX_RETRIES = 3;

// Known brand dictionary for accurate brand detection
const KNOWN_BRANDS = [
  'Danfoss', 'Copeland', 'Carrier', 'Honeywell', 'Daikin', 'Samsung', 'LG',
  'O General', 'General', 'Mitsubishi Electric', 'Mitsubishi', 'Gree', 'York',
  'Trane', 'Refron', 'Totaline', 'Bitzer', 'Embraco', 'Tecumseh', 'Secop',
  'Bristol', 'Sanyo', 'Panasonic', 'Hitachi', 'Alco', 'Castel', 'Sporlan',
  'Eliwell', 'Dixell', 'Carel', 'DunAn', 'Sanhua', 'Appion', 'Yellow Jacket',
  'Robinair', 'Value', 'Mastercool', 'CPS', 'Rothenberger', 'Harris', 'Mueller',
  'Super General', 'Supco', 'Inficon', 'Testo', 'Fieldpiece', 'Bison', 'Bock',
  'MHI', 'Toshiba', 'Chigo', 'Midea', 'Voltas', 'Blue Star', 'Zamil'
];

// Target category mapping
const SOURCING_CATEGORY_MAP = [
  { match: /compressor/i, name: 'AC Compressors' },
  { match: /capacitor/i, name: 'AC Capacitors' },
  { match: /fan motor|motor|fan blade|blower/i, name: 'AC Fan Motors' },
  { match: /grill|diffuser|louver/i, name: 'AC Grills & Blowers' },
  { match: /sensor|thermostat|controller|switch|thermo/i, name: 'Controls, Sensors & Thermostats' },
  { match: /copper|brass|fitting|piping|tube|valve/i, name: 'Copper, Brass & Piping' },
  { match: /duct|insulation|canvas|flexible duct/i, name: 'Ducting' },
  { match: /expansion valve|drier|filter drier|orifice|txv/i, name: 'Expansion Valves & Driers' },
  { match: /tool|gauge|manifold|vacuum pump|cutter|flaring/i, name: 'HVAC Tools' },
  { match: /pcb|board|circuit board|motherboard/i, name: 'PCBs & Control Boards' },
  { match: /gas|refrigerant|oil|chemical|r22|r410a|r134a|r404a|r32/i, name: 'Refrigerants, Oils & Chemicals' },
  { match: /v belt|belt|pulley/i, name: 'V Belts' },
  { match: /circuit|solenoid|sight glass|accumulator/i, name: 'Refrigeration Circuit Components' }
];

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .trim();
}

function detectBrand(product) {
  const searchable = [
    product.name || '',
    ...(product.categories || []).map(c => c.name),
    ...(product.tags || []).map(t => t.name),
    ...(product.brands || []).map(b => b.name)
  ].join(' ');

  for (const b of KNOWN_BRANDS) {
    const regex = new RegExp(`\\b${b}\\b`, 'i');
    if (regex.test(searchable)) {
      return b;
    }
  }

  // Check categories for a brand name
  if (product.categories && product.categories.length > 0) {
    for (const c of product.categories) {
      const decoded = decodeHtml(c.name);
      if (decoded !== 'AC Spare Parts' && !decoded.toLowerCase().includes('spare')) {
        return decoded;
      }
    }
  }

  return 'Universal OEM';
}

function detectCategory(product) {
  const catNames = (product.categories || []).map(c => decodeHtml(c.name)).join(' ');
  const title = decodeHtml(product.name || '');
  const combined = `${catNames} ${title}`;

  for (const map of SOURCING_CATEGORY_MAP) {
    if (map.match.test(combined)) {
      return map.name;
    }
  }

  return 'Refrigeration Circuit Components';
}

function transformProduct(p, index) {
  const cleanTitle = decodeHtml(p.name);
  const brand = detectBrand(p);
  const category = detectCategory(p);
  
  // Find subCategory from categories
  const subCats = (p.categories || [])
    .map(c => decodeHtml(c.name))
    .filter(c => c !== 'AC Spare Parts' && c !== category && c !== brand);
  const subCategory = subCats.length > 0 ? subCats[0] : undefined;

  // Clean description
  let description = decodeHtml(p.short_description || p.description);
  if (!description || description.length < 15) {
    description = `Genuine OEM replacement ${cleanTitle}. Suitable for residential and commercial HVAC maintenance, service and repair.`;
  }

  const primaryImage = (p.images && p.images.length > 0 && p.images[0].src)
    ? p.images[0].src
    : '/images/spare-parts/akv-10p0-valve.jpg';

  const allImages = (p.images && p.images.length > 0)
    ? p.images.map(img => img.src)
    : [primaryImage];

  // Price parsing
  let price = 0;
  if (p.prices && p.prices.price) {
    price = parseFloat(p.prices.price) / 100; // WC Store API uses minor units (cents)
    if (isNaN(price) || price <= 0) {
      // Check regular price
      if (p.prices.regular_price) {
        price = parseFloat(p.prices.regular_price) / 100;
      }
    }
  }
  if (isNaN(price)) price = 0;

  return {
    id: `theaccompany-${p.id}`,
    partNumber: p.sku || `TAC-${p.id}`,
    title: cleanTitle,
    brand,
    category,
    subCategory,
    description,
    compatibility: `Compatible with ${brand} & standard GCC HVAC systems`,
    specs: {
      sku: p.sku || `TAC-${p.id}`,
      availability: p.is_in_stock ? 'In Stock (UAE Warehouse)' : 'On Order (24-48h)',
      origin: 'Genuine OEM Standard',
      weight: p.formatted_weight ? decodeHtml(p.formatted_weight) : undefined,
      dimensions: p.formatted_dimensions ? decodeHtml(p.formatted_dimensions) : undefined
    },
    image: primaryImage,
    images: allImages,
    inStock: p.is_in_stock !== false,
    price: price > 0 ? price : 0,
    badge: p.is_in_stock ? 'In Stock' : 'On Order',
    order: index + 1
  };
}

async function fetchPage(page, retry = 0) {
  const url = `${BASE_URL}?category=${CATEGORY_ID}&page=${page}&per_page=${PER_PAGE}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    if (retry < MAX_RETRIES) {
      const waitTime = (retry + 1) * 1500;
      console.warn(`[Page ${page}] Fetch failed (${err.message}). Retrying in ${waitTime}ms...`);
      await new Promise(r => setTimeout(r, waitTime));
      return fetchPage(page, retry + 1);
    }
    console.error(`[Page ${page}] FAILED after ${MAX_RETRIES} retries:`, err.message);
    return [];
  }
}

async function run() {
  console.log('🚀 Starting scrape of 10,046 spare parts from theaccompany.ae...');
  const startTime = Date.now();

  // 1. Get total pages
  const initialRes = await fetch(`${BASE_URL}?category=${CATEGORY_ID}&page=1&per_page=${PER_PAGE}`);
  const totalItemsHeader = initialRes.headers.get('x-wp-total');
  const totalPagesHeader = initialRes.headers.get('x-wp-totalpages');
  
  const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 101;
  const expectedTotal = totalItemsHeader ? parseInt(totalItemsHeader, 10) : 10046;
  console.log(`📊 Total Items: ${expectedTotal} across ${totalPages} pages (${PER_PAGE} items/page)`);

  const initialData = await initialRes.json();
  const allRawProducts = [...initialData];
  console.log(`✅ Page 1/${totalPages} fetched (${initialData.length} items)`);

  // 2. Fetch remaining pages with concurrency control
  const remainingPages = [];
  for (let p = 2; p <= totalPages; p++) {
    remainingPages.push(p);
  }

  let completedPages = 1;

  // Process in worker pool
  async function worker(pageQueue) {
    while (pageQueue.length > 0) {
      const page = pageQueue.shift();
      const pageData = await fetchPage(page);
      if (Array.isArray(pageData)) {
        allRawProducts.push(...pageData);
      }
      completedPages++;
      const percent = ((completedPages / totalPages) * 100).toFixed(1);
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(`\r⏳ Progress: Page ${completedPages}/${totalPages} (${allRawProducts.length} items, ${percent}%) [${elapsedSec}s elapsed]`);
    }
  }

  const pool = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    pool.push(worker(remainingPages));
  }
  await Promise.all(pool);
  console.log('\n\n🎉 Finished fetching all pages!');
  console.log(`📦 Total Raw Products Fetched: ${allRawProducts.length}`);

  // 3. Transform & Clean Products
  console.log('🧹 Transforming and indexing products...');
  const transformedProducts = allRawProducts.map((p, idx) => transformProduct(p, idx));

  // 4. Calculate accurate Category & Brand counts
  const categoryCounts = {};
  const brandCounts = {};
  transformedProducts.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  });

  console.log('\n📊 Category Distribution:');
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`   - ${cat}: ${count}`));

  console.log('\n🏷️ Top Brands:');
  Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([brand, count]) => console.log(`   - ${brand}: ${count}`));

  // 5. Save Output Files
  const publicDataDir = path.resolve(__dirname, '../frontend/public/data');
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }

  const databaseDir = path.resolve(__dirname, '../database');
  if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, { recursive: true });
  }

  const catalogFilePath = path.join(publicDataDir, 'spare-parts.json');
  const metadataFilePath = path.join(publicDataDir, 'spare-parts-meta.json');
  const databaseBackupPath = path.join(databaseDir, 'spare-parts-scraped.json');

  const metaData = {
    totalItems: transformedProducts.length,
    scrapedAt: new Date().toISOString(),
    sourceUrl: 'https://theaccompany.ae/ac-parts-accessories',
    categoryCounts,
    topBrands: Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  };

  fs.writeFileSync(catalogFilePath, JSON.stringify(transformedProducts));
  fs.writeFileSync(metadataFilePath, JSON.stringify(metaData, null, 2));
  fs.writeFileSync(databaseBackupPath, JSON.stringify(transformedProducts));

  const stats = fs.statSync(catalogFilePath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n💾 Saved ${transformedProducts.length} spare parts to:`);
  console.log(`   - ${catalogFilePath} (${sizeMB} MB)`);
  console.log(`   - ${metadataFilePath}`);
  console.log(`   - ${databaseBackupPath}`);
  console.log(`⚡ Entire scrape and indexing completed in ${durationSec}s!`);
}

run().catch(console.error);
