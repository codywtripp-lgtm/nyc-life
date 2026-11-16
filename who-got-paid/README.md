# Who actually got paid for your groceries?

Follows the price of a pound of produce back from the store shelf to the people who
picked it, in cents per dollar. Phase 1: data layer + one test chart.

## Rebuild everything

```
pip install -r who-got-paid/requirements.txt
python who-got-paid/build.py
```

This downloads the USDA ERS and BLS files into `raw/` (with URL and date in
`raw/sources.json`), reads AMS wholesale and shipping-point prices from
[market-tracker](https://github.com/codywtripp-lgtm/market-tracker), and rewrites
`data/` and `charts/test-post.png`. About 3 minutes the first time.

- To use an existing market-tracker clone, set `MARKET_TRACKER_DIR=/path/to/market-tracker`.
  Otherwise a sparse clone (about 1.6 GB, git-ignored) goes in `.cache/`.
- `--offline` rebuilds from the files already in `raw/`.
- The BLS API without a key allows only a few requests a day. If it refuses, the
  last saved `raw/bls.json` is used and a warning is printed.

## Files

| File | What |
|---|---|
| `data/items/<item>.json` | Cents-per-dollar slices, prices, years, sources per slice, notes, 2-year trend, today's BLS shelf price |
| `data/rankings.csv` | (a) smallest farmworker share, (b) retail up while farm down, (c) everyday items |
| `data/METHODOLOGY.md` | Plain-English method, sources, caveats |
| `charts/test-post.png` | 1080×1350 test chart (item set by `FEATURED` in `build.py`) |
| `charts/reddit-post.md` | r/dataisbeautiful title and source comment |
| `raw/` | Downloaded source files and the AMS annual averages behind every wholesale number |

Settings you may want to change are at the top of `build.py`:
`FARMWORKER_SHARE_OF_FARM_VALUE`, `FEATURED`, `EVERYDAY`.
