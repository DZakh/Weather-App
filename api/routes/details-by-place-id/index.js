const express = require('express');
const createError = require('http-errors');
const { GoogleApi } = require('../../utilities');

const router = express.Router();

router.get('/:place_id', async (req, res, next) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      req.params.place_id
    )}&fields=geometry,name`;

    const weather = await GoogleApi.getProcessedWeather(url);
    const { status } = weather;
    console.log(weather);
    if (status && status !== 'OK' && status >= 400) {
      return next(createError(weather));
    }

    return res.status(status || 200).json(weather);
  } catch (err) {
    console.log(err);
    return next(createError(err));
  }
});

module.exports = router;
