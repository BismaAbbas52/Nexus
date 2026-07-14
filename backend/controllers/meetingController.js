const Meeting = require('../models/Meeting');

// CREATE / REQUEST a meeting
const createMeeting = async (req, res) => {
  try {
    const { title, requestedTo, date, startTime, endTime, notes } = req.body;
    const requestedBy = req.user.id; // comes from auth middleware (logged-in user)

    // Conflict detection: check if requestedTo already has a meeting at that time
    const conflict = await Meeting.findOne({
      requestedTo,
      date,
      status: { $in: ['pending', 'accepted'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    if (conflict) {
      return res.status(400).json({ message: 'This time slot conflicts with an existing meeting' });
    }

    const meeting = await Meeting.create({
      title,
      requestedBy,
      requestedTo,
      date,
      startTime,
      endTime,
      notes,
    });

    res.status(201).json({ message: 'Meeting requested successfully', meeting });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET all meetings for the logged-in user (either side)
const getMyMeetings = async (req, res) => {
  try {
    const userId = req.user.id;

    const meetings = await Meeting.find({
      $or: [{ requestedBy: userId }, { requestedTo: userId }],
    })
      .populate('requestedBy', 'name email role')
      .populate('requestedTo', 'name email role')
      .sort({ date: 1 });

    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ACCEPT a meeting
const acceptMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    if (meeting.requestedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to accept this meeting' });
    }

    meeting.status = 'accepted';
    await meeting.save();

    res.status(200).json({ message: 'Meeting accepted', meeting });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// REJECT a meeting
const rejectMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    if (meeting.requestedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reject this meeting' });
    }

    meeting.status = 'rejected';
    await meeting.save();

    res.status(200).json({ message: 'Meeting rejected', meeting });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createMeeting, getMyMeetings, acceptMeeting, rejectMeeting };