/* eslint-disable no-param-reassign */

import WeatherService from '../WeatherService';
import Autocomplete from '../Autocomplete';

// TODO: Make class for API requests

export default class Interface {
  static activate(searchBar) {
    const weather = new WeatherService();

    const getPredictions = async inputData => {
      const encodedInputData = encodeURIComponent(inputData);
      const apiRes = await fetch(`/api/autocomplete/${encodedInputData}`);
      return apiRes.json();
    };

    const buildApiRequestUrl = (inputData, predictedPlace) => {
      let apiType = 'findplacefromtext';
      let apiRequestData = inputData;
      if (predictedPlace) {
        apiType = 'detailsbyplaceid';
        // TODO: Send name from autocomplete
        apiRequestData = predictedPlace.place_id;
      }
      const encodedApiRequestData = encodeURIComponent(apiRequestData);
      return `/api/${apiType}/${encodedApiRequestData}`;
    };

    const getWeatherData = async (inputData, mainPrediction) => {
      const apiUrl = buildApiRequestUrl(inputData, mainPrediction);
      const apiRes = await fetch(apiUrl);

      if (apiRes.status === 404) {
        return { weatherData: undefined, placeName: 'Not Found!' };
      }
      // TODO: Handle other errors

      return apiRes.json();
    };

    const processSubmit = async (inputData, mainPrediction) => {
      searchBar.blur();

      const { weatherData, placeName } = await getWeatherData(inputData, mainPrediction);

      searchBar.value = placeName;

      if (weatherData) {
        weather.renderWeather(weatherData);
      }
    };

    /* ___ Main script ___ */
    (() => {
      let mainPrediction;

      searchBar.addEventListener('keyup', async e => {
        const inputData = searchBar.value;
        if (e.key === 'Enter') {
          await processSubmit(inputData, mainPrediction);
        } else if (inputData.length > 3) {
          const predictions = await getPredictions(inputData);
          [mainPrediction] = predictions;
          const predictionDescriptions = predictions.map(prediction => prediction.description);
          Autocomplete.renderPredictions(predictionDescriptions);
          console.log(predictionDescriptions);
        } else {
          mainPrediction = undefined;
          // TODO: Hide autocomplete
        }
      });
    })();

    searchBar.addEventListener('focus', () => {
      if (weather.state === 'active') {
        searchBar.value = '';
        weather.disable();
      }
    });
  }
}
