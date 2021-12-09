import Vue from 'vue'

Vue.filter('format_price', function (value) {
  let val = (value / 1).toFixed(2)
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
})
