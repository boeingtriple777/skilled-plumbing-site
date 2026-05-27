const fs = require('fs');
const path = require('path');

const HOURLY_RATE = 150;
const csvPath = path.join(__dirname, 'Pricing.csv');
const outputPath = path.join(__dirname, 'src', 'data', 'pricebook.json');

// Ensure directories exist
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'; // Handle escaped quotes
        i++;
      } else {
        inQuotes = !inQuotes; // Toggle quote state
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

try {
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvData.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  const pricebook = [];

  // Loop through lines, skipping header row 0
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 10) continue;

    const service_id = values[0];
    const category = values[1];
    const service_name = values[2];
    
    // Clean string contents from wrapped artifact styling
    const customer_description = values[3].replace(/^"+|"+$/g, '').trim();
    
    const keywords_raw = values[4].replace(/^"+|"+$/g, '').trim();
    const search_keywords = keywords_raw.split(',').map(k => k.trim()).filter(Boolean);
    
    const questions_raw = values[5].replace(/^"+|"+$/g, '').trim();
    const required_questions = questions_raw ? [questions_raw] : [];

    const labour_hours = parseFloat(values[6]) || 0;
    const material_cost = parseFloat(values[8]) || 0;
    const markup_pct = parseFloat(values[9]) || 0;

    // Apply Gross Margin Pricing Rules 
    const labourTotal = labour_hours * HOURLY_RATE;
    const materialTotal = material_cost / (1 - markup_pct);
    const total_estimated_price = parseFloat((labourTotal + materialTotal).toFixed(2));

    pricebook.push({
      service_id,
      category,
      service_name,
      customer_description,
      search_keywords,
      required_questions,
      total_estimated_price
    });
  }

  fs.writeFileSync(outputPath, JSON.stringify(pricebook, null, 2), 'utf-8');
  console.log(`\x1b[32m🚀 Success! Compiled ${pricebook.length} entries into ${outputPath}\x1b[0m`);
} catch (err) {
  console.error("Error compiling pricebook:", err);
}