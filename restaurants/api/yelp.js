import axios from 'axios';

export default axios.create({
  baseURL: 'https://api.yelp.com/v3/businesses',
  headers: {
    Authorization:
      'Bearer VLP8Z6NylwiDWy6vA_gOmJ96PLgXqkpIDkrrt6oiNkaxOpHbR2vSR7DTqJ5GA7pIsBU0tSeRcIE4V_D3Dh_1mPF8DtCpnqIvaPu8-_jCYj_UuIiSo0eUvLJdTPUSZnYx',
  },
});
