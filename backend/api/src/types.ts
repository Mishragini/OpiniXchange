type getMeReq = {
    type: 'get_me',
    payload: {
        token: string
    }
}

type cancelOrderReq = {
    type: 'cancel_buy_order' | 'cancel_sell_order',
    payload: {
        token: string,
        orderId: string,
        marketSymbol: string
    }
}

type signUpReq = {
    type: "signup",
    payload: {
        username: string,
        email: string,
        password: string,
        role: string
    }
}

type loginReq = {
    type: "login",
    payload: {
        email: string,
        password: string
    }
}

type getMarketsReq = {
    type: 'get_all_markets',
    payload: {
        token: string
    }
}

type getMarketReq = {
    type: 'get_market',
    payload: {
        token: string,
        marketSymbol: string
    }
}

type getOrderbookReq = {
    type: "get_orderbook",
    payload: {
        token: string,
        symbol: string
    }
}

type onrampInrReq = {
    type: 'onramp_inr',
    payload: {
        token: string,
        amount: number
    }
}

enum stockType {
    yes = "yes",
    no = "no"
}

type buyReq = {
    type: 'buy',
    payload: {
        token: string,
        symbol: string,
        quantity: number,
        price: number,
        stockType: stockType
    }
}

type sellReq = {
    type: 'sell',
    payload: {
        token: string,
        symbol: string,
        quantity: number,
        price: number,
        stockType: stockType
    }
}

type createMarketReq = {
    type: 'create_market',
    payload: {
        token: string,
        symbol: string,
        endTime: Date,
        description: string,
        sourceOfTruth: string,
        categoryTitle: string
    }
}

type createCategoryReq = {
    type: 'create_category',
    payload: {
        token: string,
        title: string,
        icon: string,
        description: string
    }
}

type mintReq = {
    type: 'mint',
    payload: {
        token: string,
        symbol: string,
        quantity: number,
        price: number,
    }
}

export type RequestPayload = signUpReq | loginReq | getMarketReq | getMarketsReq | buyReq | sellReq | getOrderbookReq | mintReq | createMarketReq | onrampInrReq | createCategoryReq | getMeReq | cancelOrderReq;