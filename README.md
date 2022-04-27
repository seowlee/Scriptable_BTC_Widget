# Scriptable_BTC_Widget

## Shows the current Bitcoin price on Binance and Upbit.  

<img width="361" alt="스크린샷 2022-04-27 21 16 10" src="https://user-images.githubusercontent.com/46402145/165516105-23053c4a-d595-4e96-86f6-e5d692a073f0.png">  

### Symbol(market) :  

Binance - BTCUTDT  
Upbit - KRW-BTC  

### chart :  
30 minutes the market price candle  
### price and priceChangePersent :  
refresh every 300 seconds. 

### day reset 00:00 UTC (09:00 KST). 

### Binance API docs. 
https://binance-docs.github.io/apidocs/spot/en/#change-log   

### Upbit API docs. 
https://ujhin.github.io/upbit-client-docs/#upbit-client-official-reference  

### API url example. 
https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT  
https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=24  
https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=24&startTime=1649700000000  
https://api.upbit.com/v1/ticker?markets=KRW-BTC  
https://api.upbit.com/v1/candles/minutes/60?market=KRW-BTC&count=24  
  
참고(Reference)

https://github.com/dersvenhesse/awesome-scriptable#finance  
https://gist.github.com/kevinkub/b74f9c16f050576ae760a7730c19b8e2  
https://github.com/Chrischi-/tradegate-stock-widget-for-scriptable/blob/main/tradegate-stock-widget.js  
https://github.com/Martlgap/CryptoDepotWidget/blob/main/cryptowidget.js
