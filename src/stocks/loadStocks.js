import { data } from "./data";

function parse_stock(stock) {
  //state.createBgBox(0, -4, 350, 500, getBoxBgStyle(srcMap1Wash));
  let ave = 0;
  let cnt = 0;
  let minn = 1000000;
  let maxx = 0;
  let months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let accum = [0];
  for (let x of months) {
    accum.push(x + accum[accum.length - 1]);
  }
  for (let key in stock) {
    ave += stock[key];
    cnt++;
    if (stock[key] < minn) minn = stock[key];
    if (stock[key] > maxx) maxx = stock[key];
  }
  ave = ave / cnt;
  let cur_month = 0;
  let res = {};
  for (let i = 0; i < 365; i++) {
    let date = "" + (cur_month + 1) + "/" + (i - accum[cur_month] + 1) + "/22";
    if (i + 1 >= accum[cur_month + 1]) cur_month++;
    if (stock[date]) {
      res[i] = 0.15 + ((stock[date] - minn) / (maxx - minn)) * 0.65;
    } else {
      //console.log(date, i, "iss missing");
    }
  }
  return res;
}

function LoadStocks() {
  let stocks = {};
  for (let key in data) {
    stocks[key] = parse_stock(data[key]);
  }
  return stocks;
}

export { LoadStocks };
