const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, 'FoursquareCategories.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV and create the constant
const categories = csvContent
  .split('\n')
  .slice(1) // Skip header row
  .filter(line => line.trim()) // Remove empty lines
  .map(line => {
    const [category_id, category_label] = line.split(',').map(s => s.trim());
    return `  { category_id: "${category_id}", category_label: "${category_label}" }`;
  })
  .join(',\n');

// Generate the TypeScript file content
const tsContent = `// Auto-generated from FoursquareCategories.csv
export const FOURSQUARE_CATEGORIES = [
${categories}
];

export interface FoursquareCategory {
  category_id: string;
  category_label: string;
}
`;

// Write to a new TypeScript file
const outputPath = path.join(__dirname, 'foursquareCategories.ts');
fs.writeFileSync(outputPath, tsContent);

console.log('Categories file generated successfully!');