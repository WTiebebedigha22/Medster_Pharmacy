import { readFileSync, writeFileSync } from 'fs';

const file = 'src/pages/Home/Home.jsx';
let c = readFileSync(file, 'utf8');

const replacements = [
  ['🎯 All Products', '<FontAwesomeIcon icon={faBullseye} /> All Products'],
  ['{getCategoryIcon(cat)} {cat}', '<FontAwesomeIcon icon={getCategoryIcon(cat)} /> {cat}'],
  ['Book Now →', 'Book Now <FontAwesomeIcon icon={faArrowRight} />'],
  ['Upload →', 'Upload <FontAwesomeIcon icon={faArrowRight} />'],
  ['<h2>🔥 Popular Products</h2>', '<h2><FontAwesomeIcon icon={faFire} /> Popular Products</h2>'],
  ['View Details →', 'View Details <FontAwesomeIcon icon={faArrowRight} />'],
  ['<li>📍 Over 500 locations nationwide</li>', '<li><FontAwesomeIcon icon={faMapMarkerAlt} /> Over 500 locations nationwide</li>'],
  ['<li>🕐 Open 8 AM - 10 PM daily</li>', '<li><FontAwesomeIcon icon={faClock} /> Open 8 AM - 10 PM daily</li>'],
  ['<li>🚗 Drive-thru pharmacy available</li>', '<li><FontAwesomeIcon icon={faCar} /> Drive-thru pharmacy available</li>'],
  ['View Store Locations →', 'View Store Locations <FontAwesomeIcon icon={faArrowRight} />'],
];

for (const [from, to] of replacements) {
  if (c.includes(from)) {
    c = c.split(from).join(to);
    console.log('replaced:', JSON.stringify(from));
  } else {
    console.log('NOT FOUND:', JSON.stringify(from));
  }
}

writeFileSync(file, c);
console.log('done');

