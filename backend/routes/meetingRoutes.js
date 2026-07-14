const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createMeeting,
  getMyMeetings,
  acceptMeeting,
  rejectMeeting,
} = require('../controllers/meetingController');

router.post('/', protect, createMeeting);
router.get('/', protect, getMyMeetings);
router.put('/:id/accept', protect, acceptMeeting);
router.put('/:id/reject', protect, rejectMeeting);

module.exports = router;