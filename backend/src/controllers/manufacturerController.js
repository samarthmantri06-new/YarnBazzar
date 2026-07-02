const prisma = require('../lib/prisma');
const { z } = require('zod');

// Schema for upgrading to Manufacturer
const upgradeManufacturerSchema = z.object({
  gstNumber: z.string().min(1, 'GST Number is required'),
  officeAddress: z.string().min(5, 'Office Address is required'),
  factoryAddress: z.string().min(5, 'Factory Address is required'),
  email: z.string().email('Valid email is required')
});

exports.upgradeToManufacturer = async (req, res) => {
  try {
    const data = upgradeManufacturerSchema.parse(req.body);
    
    // Authorization: User ID comes from JWT via auth middleware
    const buyerId = req.user.id;

    // Check if GST is already used
    const existingGst = await prisma.buyer.findFirst({
      where: { gstNumber: data.gstNumber, id: { not: buyerId } }
    });
    if (existingGst) return res.status(409).json({ error: 'GST Number is already registered.' });

    const buyer = await prisma.buyer.update({
      where: { id: buyerId },
      data: {
        isManufacturer: true,
        gstNumber: data.gstNumber,
        officeAddress: data.officeAddress,
        factoryAddress: data.factoryAddress,
        email: data.email
      }
    });

    res.json({ message: 'Successfully upgraded to Manufacturer profile.', buyer });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors[0].message });
    console.error('Upgrade to Manufacturer error:', err);
    res.status(500).json({ error: 'Failed to upgrade profile.' });
  }
};

exports.deleteManufacturerProfile = async (req, res) => {
  try {
    const buyerId = req.user.id;
    
    // We do not delete the account, only remove the manufacturer flag.
    const buyer = await prisma.buyer.update({
      where: { id: buyerId },
      data: {
        isManufacturer: false
      }
    });
    
    res.json({ message: 'Manufacturer profile deleted.', buyer });
  } catch (err) {
    console.error('Delete Manufacturer error:', err);
    res.status(500).json({ error: 'Failed to delete Manufacturer profile.' });
  }
};

// Schema for Linked Agent
const linkedAgentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid WhatsApp/Phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal(''))
});

exports.addLinkedAgent = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const data = linkedAgentSchema.parse(req.body);

    const agent = await prisma.linkedAgent.create({
      data: {
        buyerId,
        name: data.name,
        phoneNumber: data.phoneNumber,
        email: (data.email && data.email.trim() !== '') ? data.email : null
      }
    });

    res.status(201).json({ message: 'Agent added successfully.', agent });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors[0].message });
    console.error('Add Linked Agent error:', err);
    res.status(500).json({ error: 'Failed to add agent.' });
  }
};

exports.getLinkedAgents = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const agents = await prisma.linkedAgent.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(agents);
  } catch (err) {
    console.error('Get Linked Agents error:', err);
    res.status(500).json({ error: 'Failed to fetch agents.' });
  }
};

exports.removeLinkedAgent = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const agentId = req.params.agentId;

    // Security check: ensure the agent belongs to the logged-in buyer
    const agent = await prisma.linkedAgent.findUnique({ where: { id: agentId } });
    if (!agent) return res.status(404).json({ error: 'Agent not found.' });
    if (agent.buyerId !== buyerId) return res.status(403).json({ error: 'Unauthorized.' });

    await prisma.linkedAgent.delete({ where: { id: agentId } });
    res.json({ message: 'Agent removed successfully.' });
  } catch (err) {
    console.error('Remove Linked Agent error:', err);
    res.status(500).json({ error: 'Failed to remove agent.' });
  }
};
