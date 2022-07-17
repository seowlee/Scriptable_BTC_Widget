// line binanceBTCchart 
let smoothPath = 0

class LineChart {
  /* LineChart
   Reference (+ add modifications)
   https://gist.github.com/kevinkub/b74f9c16f050576ae760a7730c19b8e2
   https://github.com/Chrischi-/tradegate-stock-widget-for-scriptable/blob/main/tradegate-stock-widget.js
  */
  constructor(width, height, values) {
    this.ctx = new DrawContext()
    this.ctx.size = new Size(width, height)
    this.values = values;
  }
  
  _calculatePath() {
    let maxValue = Math.max(...this.values)+0.3;
    let minValue = Math.min(...this.values)-0.2;
    let difference = maxValue - minValue;
    let count = this.values.length;
    // let step = this.ctx.size.width / (count - 1);
    let step = this.ctx.size.width / 48;
    let points = this.values.map((current, index, all) => {
        let x = step*index
        let y = this.ctx.size.height - (current - minValue) / difference * this.ctx.size.height;
        return new Point(x, y)
    });
    if (smoothPath == 1) 
	return [this._getBaseLine(points), this._getSmoothPath(points)];
    else
    return [this._getBaseLine(points), this._getPath(points)];
  }
      
  _getBaseLine(points) {
	let path = new Path()
	for (var i = 0; i < 400; i += 40) {
		path.move(new Point(i, points[0].y));
		path.addLine(new Point(i + 20 , points[0].y));	
	}
	return path
  }
  _getSmoothPath(points) {
    let path = new Path()
    path.move(points[0]);
    path.addLine(points[0]);
    
    for(var i = 0; i < points.length-1; i ++) {
      let xAvg = (points[i].x + points[i+1].x) / 2;
      let yAvg = (points[i].y + points[i+1].y) / 2;
      let avg = new Point(xAvg, yAvg);
      let cp1 = new Point((xAvg + points[i].x) / 2, points[i].y);
      let next = new Point(points[i+1].x, points[i+1].y);
      let cp2 = new Point((xAvg + points[i+1].x) / 2, points[i+1].y);   
      path.addQuadCurve(avg, cp1);             
      path.addQuadCurve(next, cp2);
    }
    return path;
  }
    
   _getPath(points) {
    let path = new Path()
    path.move(points[0]);
    path.addLine(points[0]);  
    for(var i = 0; i < points.length-1; i ++) {
      path.addLine(points[i]);
	  smoothPath = 1
    }
    return path;
  }
  
  configure(fn) {
    let path = this._calculatePath()
    if(fn) {
      fn(this.ctx, path);
    } else {
      this.ctx.addPath(path);
      this.ctx.strokePath(path);
    }
    return this.ctx;
  }

}
// line binanceBTCchart END --

/* Reference define color and text function
https://github.com/Martlgap/CryptoDepotWidget/blob/main/cryptowidget.js
*/
const ENV = {// Define colors and other parameters:
    "colors": {
        "bg": new Color('#131722'),
        "normal": new Color('#B2B5BE'),
        "red": new Color('#F23645'),
        "green": new Color('#22AB94'),
        "white": new Color('#FFFFFF'),
        "gray": Color.gray(),
        "gold": new Color('#D4AF37')
    }
}

// get startTime
let today = new Date();   

let year = today.getFullYear();
let month = today.getMonth();
let date = today.getDate();
let hour = today.getHours();

// day reset 00:00 UTC (09:00 KST)
let start = new Date(year, month, date, 09)
const persentNum = new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 })


// *** get binance BTCUSDT data from API request ****************
const binanceSymbol = 'BTCUSDT'
const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`
const binanceReq = new Request(binanceUrl)
const binanceRes = await binanceReq.loadJSON()
const binanceNum = new Intl.NumberFormat('en-US',{minimumFractionDigits: 2 })

let binanceInfo = {}
binanceInfo['symbol'] = binanceRes.symbol
binanceInfo['lastPrice'] = Number(binanceRes.lastPrice)
// binanceInfo['priceChange'] = binanceRes.priceChange
// binanceInfo['priceChangePersent'] = binanceRes.priceChangePercent
binanceInfo['startTime'] = start.getTime();
binanceInfo['timePrice'] = []

if (hour < 9) {
	start = new Date(start.setDate(start.getDate() - 1));
	binanceInfo['startTime'] = start.getTime();
}

// binanceBTCchart data (chart interval 30 minutes)
let binanceChartUrl = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=30m&limit=48&startTime=${binanceInfo.startTime}`
const binanceChartReq = new Request(binanceChartUrl)
const binanceChartRes = await binanceChartReq.loadJSON()
binanceInfo['openingPrice'] = Number(binanceChartRes[0][1])
binanceInfo.timePrice.push(binanceInfo.openingPrice)

for (var i = 1; i < binanceChartRes.length; i++) {
	var openPrice = +binanceChartRes[i][1]
	var closePrice = +binanceChartRes[i][4]
	var meanPrice = (openPrice + closePrice) / 2
	//console.log('open'+ openPrice + 'close' + closePrice + 'mean'+ meanPrice)
	binanceInfo.timePrice.push(meanPrice)

}

// priceChange data
binanceInfo['priceChange'] = binanceInfo.lastPrice - binanceInfo.openingPrice
binanceInfo['priceChangePersent'] = persentNum.format(binanceInfo.priceChange / binanceInfo.openingPrice * 100)

// *** get binance BTCUSDT data from API request END ****************

// ======================================

// day reset 00:00 UTC (09:00 KST)
let start2 = new Date(year, month, date, 09)

// *** get upbit BTCKRW data from API request ****************
const upbitSymbol = 'KRW-BTC'
const upbitUrl = `https://api.upbit.com/v1/ticker?markets=${upbitSymbol}`
const upbitReq = new Request(upbitUrl)
const upbitRes = await upbitReq.loadJSON()
const upbitNum = new Intl.NumberFormat('ko-KR',{minimumFractionDigits: 0 })


let upbitInfo = {}
upbitInfo['symbol'] = upbitRes[0].market
upbitInfo['lastPrice'] = Number(upbitRes[0].trade_price)
upbitInfo['startTime'] = start2.getTime();
upbitInfo['openingPrice'] = upbitRes[0].prev_closing_price
upbitInfo['timePrice'] = []

if (hour < 9) {
	start2 = new Date(start2.setDate(start2.getDate() - 1));
	upbitInfo['startTime'] = start2.getTime();
}

// upbitBTCchart data (chart interval 30 minutes)
let upbitChartUrl = `https://api.upbit.com/v1/candles/minutes/30?market=KRW-BTC&count=48`
const upbitChartReq = new Request(upbitChartUrl)
const upbitChartRes = await upbitChartReq.loadJSON()
for (var i = 0; i < upbitChartRes.length; i++) {
	dateTime = new Date(upbitChartRes[i].candle_date_time_kst);
	var upbitDateTime = dateTime.getTime();
	
	if (upbitDateTime > upbitInfo.startTime) {
		var openPrice = upbitChartRes[i].opening_price
		var closePrice = upbitChartRes[i].trade_price
		var meanPrice = (openPrice + closePrice) / 2
		upbitInfo.timePrice.unshift(meanPrice);
	}
	else {
		break;
	}
}
upbitInfo.timePrice.unshift(upbitInfo.openingPrice);
console.log("b" + binanceInfo.timePrice.length)
console.log(upbitInfo.timePrice.length)

// priceChange data
// upbitInfo['openingPrice'] = Number(binanceChartRes[0][1])
upbitInfo['priceChange'] = upbitRes[0].signed_change_price
upbitInfo['priceChangePersent'] = persentNum.format(upbitRes[0].signed_change_rate * 100)

// *** get upbit BTCKRW data from API request END ****************


let widget = await createWidget(binanceInfo)
if (!config.runsInWidget) {
	await widget.presentMedium()
  }
else {
	Script.setWidget(widget)
	Script.complete()
}

function text(stack, content, size, color) {
    let txt = stack.addText(content)
    txt.textColor = ENV.colors[color]
    txt.font = Font.boldSystemFont(size)
}

console.log(start.toLocaleString())

// create the widget
async function createWidget(binanceInfo) {
	if(!binanceRes) {
		const errorList = new ListWidget()
		errorList.addText("loading error")
		return errorList
	}
	let list = new ListWidget()
	// refresh every 300 seconds
	list.refreshAfterDate = new Date(Date.now() + 1000 * 300);

	list.setPadding(8,8,8,8);
	list.backgroundColor = ENV.colors.bg;
	
	// coin list
	const crypto = list.addStack();
	crypto.layoutVertically();
  
	// let titleText = crypto.addText('Bitcoin Price on Binance and Upbit')
	// titleText.textColor = ENV.colors.normal;
	text(crypto,'Bitcoin Price (Binance and Upbit)', 15, "normal" )
  
	crypto.addSpacer(15)

	// coin list
	// **************** binance BTCUSDT ****************
	let binanceBTC = crypto.addStack();
	binanceBTC.layoutHorizontally();
	{
		// coin name and symbol
		let binanceBTCnames = binanceBTC.addStack();
		binanceBTCnames.layoutVertically()
		//let cryptoName = binanceBTCnames.addText('Bitcoin')
		text(binanceBTCnames, binanceInfo.symbol, 13, "white")
		binanceBTCnames.addSpacer(3)
		//let cryptoSymbol = binanceBTCnames.addText(" " + binanceInfo.symbol)
		text(binanceBTCnames, 'Bitcoin', 10, "gray")
	}

	binanceBTC.addSpacer(12)
	//binanceBTCchart
	let binanceBTCchart = new LineChart(400, 80, binanceInfo.timePrice).configure((ctx, path) => {
		ctx.opaque = false;
		ctx.setStrokeColor(((binanceInfo.priceChange >= 0) ? 
		(binanceInfo.priceChange == 0) ? ENV.colors.normal : ENV.colors.green : ENV.colors.red));
		ctx.setLineWidth(2);
		path.forEach(p => {
			ctx.addPath(p);
			ctx.strokePath(p);
			ctx.setLineWidth(5.5);
		});
		
	}).getImage();
	let binanceBTCchartStack = binanceBTC.addStack()
	let binanceBTCimg = binanceBTCchartStack.addImage(binanceBTCchart)
	binanceBTCimg.applyFittingContentMode()
	  
	binanceBTC.addSpacer(8)
	{
		// coin price and priceChangePersent
		let binanceBTCprices = binanceBTC.addStack()
		binanceBTCprices.layoutVertically()
		text(binanceBTCprices, binanceNum.format(binanceInfo.lastPrice) + " USD", 12, 
		((binanceInfo.priceChange >= 0) ? (binanceInfo.priceChange == 0) ? "normal" : "green" : "red"))
		binanceBTC.addSpacer(2)
		text(binanceBTCprices, binanceInfo.priceChangePersent + ' %', 10, 
		((binanceInfo.priceChange >= 0) ? (binanceInfo.priceChange == 0) ? "normal" : "green" : "red")) 
	}
	binanceBTC.addSpacer(12)

	// **************** binance BTCUSDT END ****************
	
	crypto.addSpacer(12)

	// **************** upbit BTCKRW ****************
	let upbitBTC = crypto.addStack();
	upbitBTC.layoutHorizontally();
	{
		// coin name and symbol
		let upbitBTCnames = upbitBTC.addStack();
		upbitBTCnames.layoutVertically()
		text(upbitBTCnames, upbitInfo.symbol, 13, "white")
		upbitBTCnames.addSpacer(3)
		text(upbitBTCnames, 'Bitcoin', 10, "gray")
	}

	upbitBTC.addSpacer(12)
	// upbitBTCchart
	let upbitBTCchart = new LineChart(400, 80, upbitInfo.timePrice).configure((ctx, path) => {
		ctx.opaque = false;
		ctx.setStrokeColor(((upbitInfo.priceChange >= 0) ? 
		(upbitInfo.priceChange == 0) ? ENV.colors.normal : ENV.colors.green : ENV.colors.red));
		ctx.setLineWidth(2);
		path.forEach(p => {
			ctx.addPath(p);
			ctx.strokePath(p);
			ctx.setLineWidth(5.5);
		});
	}).getImage();
	let upbitBTCchartStack = upbitBTC.addStack()
	let upbitBTCimg = upbitBTCchartStack.addImage(upbitBTCchart)
	upbitBTCimg.applyFittingContentMode()
	  
	upbitBTC.addSpacer(12)
	{
		// coin price and priceChangePersent
		let upbitBTCprices = upbitBTC.addStack()
		upbitBTCprices.layoutVertically()
		text(upbitBTCprices, upbitNum.format(upbitInfo.lastPrice) + " KRW", 12, 
		((upbitInfo.priceChange >= 0) ? (upbitInfo.priceChange == 0) ? "normal" : "green" : "red"))
		upbitBTC.addSpacer(2)
		text(upbitBTCprices, upbitInfo.priceChangePersent + ' %', 10, 
		((upbitInfo.priceChange >= 0) ? (upbitInfo.priceChange == 0) ? "normal" : "green" : "red")) 
	}

	// **************** upbit BTCKRW END ****************


   
  return list
}



// https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT
// https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=24
// https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=24&startTime=1649700000000
// https://api.upbit.com/v1/ticker?markets=KRW-BTC
// https://api.upbit.com/v1/candles/minutes/60?market=KRW-BTC&count=24
