const SERVICE_LABELS = {
  'free-checkup': 'Free check-up / consultation',
  'colon-hydrotherapy': 'Colon hydrotherapy',
  'wellness-massage': 'Therapeutic massage & wellness',
  iridology: 'Iridology',
  herbology: 'Herbology',
  'herbal-coffee': 'Herbal coffee',
  supplements: 'Food supplements',
  'general-consultation': 'General wellness consultation',
  'products-inquiry': 'Products inquiry (in-clinic)',
}

function serviceLabel(id) {
  return SERVICE_LABELS[id] ?? id
}

function allowedServiceIds() {
  return Object.keys(SERVICE_LABELS)
}

module.exports = { SERVICE_LABELS, serviceLabel, allowedServiceIds }
