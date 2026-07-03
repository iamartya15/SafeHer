const express = require('express');
const router = express.Router();
const {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident
} = require('../controllers/incidentController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { createIncidentValidator } = require('../validators/incidentValidator');

// Public route to view map incidents (or authenticated depending on preference)
// For usability, we'll require authentication to get or report incidents
router.use(protect);

router.post('/', upload.single('image'), createIncidentValidator, createIncident);
router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.put('/:id', upload.single('image'), updateIncident);
router.delete('/:id', deleteIncident);

module.exports = router;
