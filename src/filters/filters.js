import Vue from "vue";

Vue.filter("format_price", function(value) {
  if (isNaN(value)) {
    return value;
  }
  let val = (value / 1).toFixed(2);
  val = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$ ${val}`;
});
