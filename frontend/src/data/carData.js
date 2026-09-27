// Edit this object to add or remove brands and models.
// Each key is a brand name; its value is the list of valid models for that brand.
export const BRAND_MODELS = {
  Honda: ['Accord', 'Civic', 'City', 'CR-V', 'HR-V'],
  Toyota: [
    'Corolla',
    'Camry',
    'Prius',
    'RAV4',
    'Fortuner',
    'Land Cruiser',
    'Hilux',
    'Yaris',
  ],
  BMW: ['1 Series', '3 Series', '5 Series', '7 Series', 'X3', 'X5'],
  Nissan: ['Leaf', 'X-Trail', 'Sunny', 'Note', 'Navara'],
  Suzuki: ['Alto', 'Wagon R', 'Swift', 'Baleno', 'Vitara'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE'],
}

export const BRANDS = Object.keys(BRAND_MODELS)

export const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric']

export const TRANSMISSIONS = ['Automatic', 'Manual']

export const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor']

export const SERVICE_HISTORY = ['Yes', 'No']

export const ACCIDENT_HISTORY = ['Yes', 'No']

export const CITIES = [
  'Colombo',
  'Kandy',
  'Galle',
  'Jaffna',
  'Negombo',
  'Kurunegala',
  'Anuradhapura',
  'Ratnapura',
]

const CURRENT_YEAR = new Date().getFullYear()
export const YEARS = Array.from(
  { length: CURRENT_YEAR - 1990 + 1 },
  (_, i) => CURRENT_YEAR - i,
)
