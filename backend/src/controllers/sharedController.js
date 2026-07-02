const prisma = require('../lib/prisma');
const locationData = require('../data/indiaLocations.json');

// ─── GET dropdown options by fieldType ───────────────────────────────────────
exports.getDropdownOptions = async (req, res) => {
  try {
    const { fieldType } = req.params;
    const valid = ['COUNT', 'TYPE', 'CATEGORY'];
    if (!valid.includes(fieldType.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid fieldType. Use COUNT, TYPE, or CATEGORY' });
    }
    const options = await prisma.dropdownOption.findMany({
      where: { fieldType: fieldType.toUpperCase() },
      orderBy: { value: 'asc' },
      select: { id: true, value: true, fieldType: true }
    });
    res.json(options.map(o => o.value));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch options' });
  }
};

// ─── POST add custom dropdown value (supplier only) ────────────────────────────
exports.addDropdownOption = async (req, res) => {
  try {
    const { fieldType, value } = req.body;
    const valid = ['COUNT', 'TYPE', 'CATEGORY'];
    if (!valid.includes(fieldType?.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid fieldType' });
    }
    if (!value || value.trim().length === 0) {
      return res.status(400).json({ error: 'Value required' });
    }
    const option = await prisma.dropdownOption.upsert({
      where: { fieldType_value: { fieldType: fieldType.toUpperCase(), value: value.trim() } },
      update: {},
      create: { fieldType: fieldType.toUpperCase(), value: value.trim(), addedBy: req.user?.id || null }
    });
    res.status(201).json(option);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add option' });
  }
};

// ─── Location: GET all states ─────────────────────────────────────────────────
exports.getStates = (req, res) => {
  const states = Object.keys(locationData).sort();
  res.json(states);
};

// ─── Location: GET districts by state ────────────────────────────────────────
exports.getDistricts = (req, res) => {
  const { state } = req.params;
  const stateData = locationData[state];
  if (!stateData) return res.status(404).json({ error: 'State not found' });
  const districts = Object.keys(stateData).sort();
  res.json(districts);
};

// ─── Location: GET cities by district ────────────────────────────────────────
exports.getCities = (req, res) => {
  const { state, district } = req.params;
  const stateData = locationData[state];
  if (!stateData) return res.status(404).json({ error: 'State not found' });
  const cities = stateData[district];
  if (!cities) return res.status(404).json({ error: 'District not found' });
  res.json(cities.sort());
};
