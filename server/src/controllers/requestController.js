import Request from '../models/Request.js';

export const getRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedRequest) return res.status(404).json({ message: 'Request not found' });
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: 'Error updating request', error: error.message });
  }
};
