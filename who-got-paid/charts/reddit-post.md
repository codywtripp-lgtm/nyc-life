# r/dataisbeautiful post

## Title

[OC] Of the $2.29 Americans paid for a pound of tomatoes in 2025, about 62¢ went to the grocery store and an estimated 9¢ to farmworkers

(Alternative, shorter: [OC] Who gets paid when you buy a pound of tomatoes: store 62¢, farm 19¢, trucking & wholesale 10¢, farmworkers ~9¢)

## Image

`charts/test-post.png`

## Required source and tools comment (post within the first hour)

**Sources**

- Retail price and farm value: USDA Economic Research Service, *Price Spreads from Farm to Consumer*, fresh tomatoes, 2025 (public domain). https://www.ers.usda.gov/data-products/price-spreads-from-farm-to-consumer
- Wholesale price: USDA AMS Market News daily terminal-market reports, 25 lb cartons of field tomatoes, averaged over every city-day in 2025 across Atlanta, Boston, Chicago, Detroit, Los Angeles, Miami, New York and Philadelphia (1,757 city-days).
- Farmworker share: an **estimate**. Farm labor is about one-third of farm revenue for fresh fruits and vegetables (Philip Martin, UC Davis, as cited by the Economic Policy Institute). I applied 1/3 to the farm's share.

**Method, briefly**

- Farm slice = ERS farm share of the retail price (27.9%), minus the farmworker estimate (27.9 ÷ 3 = 9.3¢).
- Trucking & wholesale = wholesale price per pound you buy, minus farm value (9.9¢). Wholesale is adjusted for produce lost between farm and shelf, using the ratio implied by ERS's own numbers (1.18 lb bought per lb sold).
- Store = everything left (62.2¢).
- For tomatoes, ERS's farm price matches USDA's packed shipping-point price, so "the farm" includes packing by grower-shippers.

**Caveats**

- Big chains mostly buy direct from shippers, not at terminal markets, so the wholesale slice is a stand-in.
- ERS's retail price covers all fresh tomatoes, including vine, grape and greenhouse. Field-grown tomatoes alone averaged $1.84/lb (BLS).
- The store's 62¢ isn't profit. It also covers staff, rent, power and the tomatoes that go bad on the shelf.

Full method, every number and the code: [link to METHODOLOGY / repo]

**Tools**: Python (pandas, matplotlib).
