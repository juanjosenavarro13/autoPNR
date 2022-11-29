const { formatDate } = require('./utils');
const flightOptios = {
  url: 'https://pree.iberia.es/es/?language=es',
  onlyWay: true,
  date: { way: formatDate(new Date(), 'way'), return: formatDate(new Date(), 'return') },
  flight: {
      origin: 'Madrid',
      destiny: 'Bilbao'
  },
  passengers: {
      name: 'test',
      surname: 'test',
      email: 'test@test.es',
      phone: '623456789'
  },
  payment: {
      number: '4012999999999999',
      name: 'test',
      surname: 'test',
      expiration: {
          day: 1,
          month: 1,
          year: 2025
      },
      ccv: '123'
  }
};

module.exports = {
  flightOptios
};