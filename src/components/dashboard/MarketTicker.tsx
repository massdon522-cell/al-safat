import React, { useEffect, useRef } from "react";

const MarketTicker = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent double injection in dev
    if (containerRef.current && containerRef.current.querySelector('script')) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        { "proName": "FOREXCOM:SPX500", "title": "S&P 500 Index" },
        { "proName": "FOREXCOM:NSXUSD", "title": "US 100" },
        { "proName": "FX_IDC:EURUSD", "title": "EUR/USD" },
        { "proName": "BITSTAMP:BTCUSD", "title": "BTC/USD" },
        { "proName": "BITSTAMP:ETHUSD", "title": "ETH/USD" },
        { "proName": "BINANCE:XRPUSDT", "title": "XRP/USDT" }
      ],
      "showSymbolLogo": true,
      "isTransparent": true,
      "displayMode": "adaptive",
      "colorTheme": "light",
      "locale": "en"
    });

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="bg-white border-b border-black/5 overflow-hidden h-[46px] flex items-center">
      <div ref={containerRef} className="tradingview-widget-container w-full">
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
};

export default MarketTicker;
