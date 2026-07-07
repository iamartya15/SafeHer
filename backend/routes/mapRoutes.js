const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

// Map intelligence routes
router.get('/gdacs', mapController.getGdacsData);
router.get('/usgs', mapController.getUsgsData);
router.get('/safe-places', mapController.getSafePlaces);
router.get('/firms', mapController.getFirmsData);
router.get('/weather', mapController.getWeatherData);

module.exports = router;
