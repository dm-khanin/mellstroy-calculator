;(async () => {
  const MELLSTROY_COIN_ID = '32016';
  const DOGE_COIN_ID = '74';
  const SHIBA_INU_COIN_ID = '5994';
  const PEPE_COIN_ID = '24478';

  const getCoinsInfo = async () => {
    const CMC_URL = 'https://khanin.dev/api/coin-info';
    const result = {
      [MELLSTROY_COIN_ID]: null,
      [DOGE_COIN_ID]: null,
      [SHIBA_INU_COIN_ID]: null,
      [PEPE_COIN_ID]: null,
    };

    try {
      const response = await fetch(`${CMC_URL}?id=${MELLSTROY_COIN_ID},${DOGE_COIN_ID},${SHIBA_INU_COIN_ID},${PEPE_COIN_ID}`, {
        method: 'GET',
      });

      const data = await response.json();
      if (!data.data || !Object.keys(data).length) {
        throw new Error('Failed to get data from CMC');
      }

      Object.entries(data.data).forEach(([coinId, {
        name,
        symbol,
        self_reported_market_cap,
        quote: { USD: { price, market_cap } },
      }]) => {
        result[coinId] = {
          name,
          symbol,
          price,
          marketCap: market_cap || self_reported_market_cap,
        };
      });

      return result;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const format = (n) => {
    if (n < 1) {
      return n.toString().slice(0, 10);
    }

    const rounded = Math.round(+n);
    // TODO multi locales support
    return rounded.toLocaleString('ru');
  };

  const getXCountCont = (coinsInfo, container) => {
    const { marketCap: mellMarketCap } = coinsInfo[MELLSTROY_COIN_ID];
    Object.entries(coinsInfo)
      .forEach(([coinId, { name, symbol, marketCap }]) => {
        if (coinId === MELLSTROY_COIN_ID) {
          return;
        }

        const xCount = Math.round(marketCap / mellMarketCap);
        const element = document.createElement('div');

        element.textContent = `${name} ($${symbol}) MCap ${format(marketCap)} - ${format(xCount)} иксов`;
        element.classList.add('x-count-item');

        container.appendChild(element);
      });

    container.appendChild(document.createElement('br'));
    return container;
  };

  const calculateListener = (e, coinsInfo) => {
    const investment = document.querySelector('.investment-input')?.value;
    if (!investment || investment < 0) {
      return;
    }

    const investResultsCont = document.querySelector('.invest-results');
    investResultsCont.innerHTML = '';
    investResultsCont.classList.remove('is-hidden');
    investResultsCont.appendChild(document.createElement('br'));

    const { marketCap: mellMarketCap } = coinsInfo[MELLSTROY_COIN_ID];

    Object.entries(coinsInfo)
      .forEach(([coinId, { name, marketCap }]) => {
        if (coinId === MELLSTROY_COIN_ID) {
          return;
        }

        const xCount = marketCap / mellMarketCap;

        const earnings = Math.round(investment * xCount);

        const element = document.createElement('div');
        element.textContent = `На капитализации ${name} я заработаю $${format(earnings)}`;
        element.classList.add('invest-item');

        investResultsCont.appendChild(element);
      });
  };

  const getInvestCont = (coinsInfo, container) => {
    const mellstroyInfo = coinsInfo[MELLSTROY_COIN_ID];
    const { symbol: mellSymbol, price: mellPrice, marketCap: mellMarketCap } = mellstroyInfo;

    console.log(mellstroyInfo);

    const mellstroyElem = document.createElement('div');
    mellstroyElem.textContent = `Mellstroy ($${mellSymbol}) MCap ${format(mellMarketCap)}, цена токена ${format(mellPrice)}`;
    container.prepend(document.createElement('br'));
    container.prepend(mellstroyElem);

    const calcBtn = document.querySelector('.calculate');
    calcBtn.addEventListener('click', e => calculateListener(e, coinsInfo));

    const resetBtn = document.querySelector('.reset');
    resetBtn.addEventListener('click', () => {
      const investResultsCont = document.querySelector('.invest-results');
      investResultsCont.innerHTML = '';
    });

    return container;
  };


  const info = await getCoinsInfo();
  const cont = document.querySelector('.container');

  if (!info) {
    const errorElem = document.createElement('div');
    errorElem.classList.add('error');
    // TODO multi languages support
    errorElem.textContent = 'Не удалось загрузить информацию о монетах, пожалуйста, обновите страницу';
    cont.appendChild(errorElem);
    return;
  }

  const xCountContainer = getXCountCont(info, document.querySelector('.x-count'));
  const calcContainer = getInvestCont(info, document.querySelector('.invest-box'));

  xCountContainer.classList.remove('is-hidden');
  calcContainer.classList.remove('is-hidden');

  cont.append(xCountContainer, calcContainer);
})();
