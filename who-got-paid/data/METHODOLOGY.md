# How we worked out who gets paid for your groceries

When you buy a pound of produce, your money is split between the store, the
truckers and wholesalers who moved it, the farm that grew it, and the people who
grew and picked it. This page explains where each number comes from, what we
had to estimate, and what we don't know.

All numbers are U.S. averages in **cents of every dollar you pay at the register**.
They are not adjusted for inflation.

## The four slices

For each item we start with what shoppers paid per pound, then peel off one slice at a time:

| Slice | How it's worked out |
|---|---|
| **The farmworker** | One-third of what the farm was paid. **This is an estimate** (see below). |
| **The farm** | What the farm was paid, minus the farmworker slice. Covers the owner, land, seed, water, fuel, equipment, and for some items packing (see "What counts as the farm"). |
| **Trucking & wholesale** | What wholesalers charge in big-city produce markets, minus what the farm was paid. |
| **The grocery store** | What you paid, minus the wholesale price. Covers store staff, rent, power, spoilage and profit. |

The four slices always add up to 100 cents. The code checks this for every item
and stops if they don't. If any slice comes out below zero, the item is flagged
and left out of the rankings rather than forced to fit.

## Where the numbers come from

1. **What shoppers pay and what farms get.** USDA Economic Research Service (ERS),
   [Price Spreads from Farm to Consumer](https://www.ers.usda.gov/data-products/price-spreads-from-farm-to-consumer),
   fresh fruit and vegetable tables. Public domain (CC0). ERS gets retail prices
   from Circana store scanner data and farm prices from USDA's fruit and vegetable
   yearbooks. Downloaded 16 November 2026.
   Latest year available: **2025** for apples, broccoli, carrots, grapes, iceberg
   lettuce, romaine lettuce, peaches, strawberries and tomatoes; the **2024/25
   season** for oranges and grapefruit; **2024** for potatoes.
2. **Wholesale prices.** USDA Agricultural Marketing Service (AMS) Market News
   daily terminal-market reports for Atlanta, Boston, Chicago, Detroit, Los Angeles,
   Miami, New York and Philadelphia, collected by the
   [market-tracker](https://github.com/codywtripp-lgtm/market-tracker) project.
   We take one price per city per day (the middle of that day's quotes) for one
   standard pack, then average every city-day in the year. Organic lots and lots
   USDA graded as fair quality are left out.
3. **Shipping-point prices** (what packers charge at the growing area, packed and
   ready to load). Same AMS source. Used only as a cross-check of the ERS farm price.
4. **Today's shelf price.** U.S. Bureau of Labor Statistics (BLS)
   [Average Price Data](https://www.bls.gov/cpi/factsheets/average-prices.htm),
   U.S. city average. Shown for context in each item's file. It isn't used in the slices.
5. **Carton weights** where a USDA price is per carton with no weight stated:
   USDA Agricultural Handbook 697, *Weights, Measures, and Conversion Factors for
   Agricultural Commodities and Their Products* (1992), Table 6. Iceberg lettuce
   is 50 lb per carton, and California/Arizona oranges are 38 lb per carton.

Every item file in `data/items/` lists the source, URL and download date behind each slice.

## The farmworker estimate

Farm labor is about **one-third of farm revenue** for fresh fruits and vegetables
(Philip Martin, University of California, Davis, as cited by the Economic Policy
Institute). We apply that share to the ERS farm value. It is one estimate for all
items, and the real share varies by crop: it is higher for hand-picked crops like
strawberries and lower for machine-harvested ones like potatoes. The slice is
labeled as an estimate wherever it appears. It's set as a single constant,
`FARMWORKER_SHARE_OF_FARM_VALUE` in `build.py`, so it's easy to change.

## What counts as "the farm"

Many fruit and vegetable farms pack and ship their own crop. These "grower-shippers"
wash, sort, cool and box the produce before selling it. Whether packing falls in the
farm slice or the next slice depends on which price ERS uses. We checked
each item by comparing the ERS farm price with USDA's packed shipping-point price
for the same year:

| Item (2025) | ERS farm price | Packed shipping-point price | What it means |
|---|---|---|---|
| Tomatoes | 54¢/lb | 52¢/lb | Same. ERS's farm price is a packed price, so **the farm slice includes packing.** |
| Iceberg lettuce | 44¢/lb | 41¢/lb | Same. The farm slice includes packing. |
| Apples | 33¢/lb | 63¢/lb | ERS is about half. Packing and storage fall in the trucking & wholesale slice. |
| Grapes | 95¢/lb | 144¢/lb | ERS is lower. Packing is in trucking & wholesale. |
| Broccoli | 69¢/lb | 86¢/lb | ERS is lower. Packing is in trucking & wholesale. |
| Potatoes (2024) | 13¢/lb | 22¢/lb | ERS is lower. Packing is in trucking & wholesale. |
| Oranges (2024/25) | 24¢/lb | 67¢/lb | ERS is far lower. Packing is in trucking & wholesale. |

Either way, packing is counted once, never twice. Each item file records the result
under `farm_price_check`, and the chart labels change to match.

## Spoilage between farm and store

Some produce is lost on the way to the shelf. To sell one pound, a store has to buy
a little more than a pound. ERS builds this into its farm value: the farm value of
one retail pound is the farm share × the retail price, which is more than the farm
price per pound. For tomatoes the ratio is 1.18 pounds bought per pound sold.
We apply the same ratio to the wholesale price, so both slices are measured per
pound *you* buy.

## Worked example: tomatoes, 2025

| Step | Number | Source |
|---|---|---|
| Retail price | 228.8¢ per lb | ERS |
| Farm share | 27.9% | ERS |
| Farm value per retail pound | 27.9% × 228.8 = 63.8¢ | ERS |
| Farm price per pound | 54.3¢ | ERS |
| Pounds bought per pound sold | 63.8 ÷ 54.3 = 1.176 | derived |
| Wholesale price, 25 lb cartons, 8 cities | 73.5¢ per lb | AMS |
| Wholesale value per retail pound | 73.5 × 1.176 = 86.5¢ | derived |
| **Farmworker** | 27.9 ÷ 3 = **9.3¢** | estimate |
| **Farm** | 27.9 − 9.3 = **18.6¢** | |
| **Trucking & wholesale** | (86.5 − 63.8) ÷ 228.8 = **9.9¢** | |
| **Grocery store** | 100 − 27.9 − 9.9 = **62.2¢** | |

Rounded to whole cents for the chart: 9 + 19 + 10 + 62 = 100.

## Price trend

For each item we compare the ERS retail price and the ERS farm price in the latest
year with two years earlier (for example 2023 to 2025). The ranking puts items where
the shelf price rose while the farm price fell at the top, ordered by the gap between the two.

## Caveats

- **Big chains mostly skip the wholesale market.** They buy direct from shippers and
  run their own warehouses. Terminal-market prices are a stand-in for the cost of
  getting produce to a city, not what any one chain pays. For strawberries, the
  terminal price is about the same as the average retail price, which produces a
  negative store slice, so strawberries are left out of the rankings. For grapes,
  the store slice comes out at only 7¢, which is likely too low.
- **Product mix.** ERS's tomato retail price covers all fresh tomatoes (vine, grape,
  greenhouse), while the wholesale price is for standard field tomatoes. That can
  make the store slice look bigger than it is. BLS's field-grown tomato price
  averaged $1.84/lb in 2025, compared with ERS's $2.29 for all tomatoes.
- **Carrots are left out.** ERS's carrot farm share jumped from 48% (2022) to 85%
  (2025), and its farm price is more than double USDA's shipping-point price for
  loose carrots. It probably values cut and baby carrots, so the wholesale slice
  comes out negative.
- **Romaine, peaches and grapefruit** have a farm and farmworker slice but no
  wholesale/store split. Romaine has no published carton weight. Peaches and
  grapefruit aren't in the wholesale data.
- **Bananas and onions** can't be included. ERS publishes no farm value for them,
  and there's no sourced retail price for onions.
- **Potatoes'** latest ERS year is 2024.
- **Carton weights** come from a 1992 USDA handbook. For iceberg, the 50 lb weight
  gives a shipping-point price within 6% of ERS's farm price, which supports it.
- All prices are **nominal** (not adjusted for inflation) and national averages.
  Prices in your store and your city will differ.

## Rebuilding

`python who-got-paid/build.py` downloads the ERS and BLS files, reads the AMS prices
from market-tracker, and rewrites everything in `data/` and `charts/test-post.png`.
