In my solution I chosen English auction, because this contract I designed only for unique nft (721).
Nft (MarketItem) contains url, what made able to pass any file inside.

---

In a marketplace smart contract, there are different ways to handle bids and payments. Here are some conceptual ideas:

1. Escrow-payment.
   Buyer sends value to the third-party contract who holds the funds untill goods are delivered. Once buyer release goods, they can release the funds to the seller.

   - Low risk of fraud

2. Direct payment.
   Buyer sends the payment directly to the seller.

   - High rigsk of fraud

3. Conditional payment
   Funds held in escrow until conditions are met.
   Buyer might release the funds only after they have received and verified goods, or seller might receive the funds only after they have shipped goods.

4. Auctions.
   Payment usually made directly to the seller address, but escriw or conditional payment can also be used.

   - English auction: Starting price is set low, and the auctioneer raises the price until no one is willing to bid higher.
     Suite for selling unique art collections
   - Dutch auction: Starting with high price and gradually lowers the price until someone willing to buy.
     Suite for selling multiple identical items(token sale).
   - First-Price sealed-bid auction: Bidders submit bids privately, highest bid win the auction
     Suite for sell assets where the true value is difficult to determine.
   - Second-Price sealed-bid auction(Vickrey): Bidders submit bids privately, highest bid win auction, but pays price of 2nd position
     Suite for sell assets where the true value is difficult to determine.

   - Reverse auction: Buyers sets starting price and sellers compete to offer the lowest price. Seller with lowest price wins the auction.
     Suite for buyers is seeking the lowest possible price.
   - All-pay auction: Bidders pay their bids, regardless they win or not. Highest budder wins the auction and receives goods, but bidders lose their bids.

---
