"""Who actually got paid for your groceries? Phase 1 data build.

    python who-got-paid/build.py            # download sources, compute, write data + chart
    python who-got-paid/build.py --offline  # reuse files already in raw/ (no downloads)

Inputs
  - USDA ERS "Price Spreads from Farm to Consumer" (fresh fruit and vegetable CSVs)  -> raw/ers/
  - BLS Average Price Data (U.S. city average)                                       -> raw/bls.json
  - USDA AMS terminal-market and shipping-point prices, read from the market-tracker
    repo (github.com/codywtripp-lgtm/market-tracker). Set MARKET_TRACKER_DIR to an
    existing clone, otherwise a sparse clone is made in who-got-paid/.cache/.        -> raw/ams_annual.csv

Outputs: data/items/<item>.json, data/rankings.csv, charts/test-post.png
(data/METHODOLOGY.md and charts/reddit-post.md are written by hand from these numbers).
"""

import csv
import datetime as dt
import glob
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import pandas as pd
import requests

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw"
DATA = ROOT / "data"
CHARTS = ROOT / "charts"

# ---------------------------------------------------------------------------
# Assumptions you may want to change
# ---------------------------------------------------------------------------

# Farm labor is about one-third of farm revenue for fresh fruits and vegetables
# (Philip Martin, UC Davis, cited by the Economic Policy Institute). An ESTIMATE.
FARMWORKER_SHARE_OF_FARM_VALUE = 1 / 3
FARMWORKER_SOURCE = ("Estimate: farm labor is about one-third of farm revenue for fresh fruits and "
                     "vegetables (Philip Martin, UC Davis, as cited by the Economic Policy Institute).")

# Item shown on charts/test-post.png. See the recommendation in the chat / README.
FEATURED = "tomatoes"

# Things people buy most weeks (ranking c).
EVERYDAY = {"tomatoes", "lettuce-iceberg", "lettuce-romaine", "apples", "bananas", "strawberries",
            "potatoes", "onions"}

# Packed shipping-point price within this fraction of the ERS farm price -> treat ERS "farm"
# as a packed grower-shipper price (packing is inside the farm layer).
FOB_MATCH_TOLERANCE = 0.15

ERS_BASE = "https://www.ers.usda.gov"
ERS_PAGE = ERS_BASE + "/data-products/price-spreads-from-farm-to-consumer"
BLS_API = "https://api.bls.gov/publicAPI/v1/timeseries/data/"
BLS_PAGE = "https://www.bls.gov/cpi/factsheets/average-prices.htm"
AMS_REPO = "https://github.com/codywtripp-lgtm/market-tracker"
AMS_SOURCE = "USDA AMS Market News (via market-tracker)"
AH697 = ("USDA Agricultural Handbook 697, Weights, Measures, and Conversion Factors for "
         "Agricultural Commodities and Their Products (1992), Table 6")
AH697_URL = "https://www.ers.usda.gov/media/7780/ah-697.pdf"

# slug: shopper name, ERS file, BLS series (+ factor to $/lb), AMS spec.
# AMS spec: commodity, pack regex, optional variety regex, optional item_size regex,
# carton_lb (only when the pack text gives no weight; with its source).
ITEMS = {
    "tomatoes": dict(name="tomatoes", ers="/media/5760/fresh-tomatoes.csv",
                     bls=("APU0000712311", 1.0, "Tomatoes, field grown, per lb"),
                     ams=dict(commodity="Tomatoes", pack=r"^25 lb cartons loose$",
                              desc="mature green field tomatoes, 25 lb cartons")),
    "lettuce-iceberg": dict(name="iceberg lettuce", ers="/media/5754/fresh-lettuce-iceberg.csv",
                            bls=("APU0000712211", 1.0, "Lettuce, iceberg, per lb"),
                            ams=dict(commodity="Lettuce, Iceberg", pack=r"^cartons$", item=r"24s",
                                     carton_lb=50, carton_src=AH697 + ": lettuce carton, 50 lb",
                                     desc="iceberg, cartons of 24 heads (50 lb)")),
    "lettuce-romaine": dict(name="romaine lettuce", ers="/media/5756/fresh-lettuce-romaine.csv",
                            bls=None, ams=None,
                            ams_why=("AMS quotes romaine per carton and no published carton weight exists; "
                                     "at the 50 lb iceberg weight the shipping-point price (39.5 c/lb, 2025) "
                                     "is far below ERS's farm price (59.7 c/lb), so the weight is wrong for "
                                     "romaine. Wholesale and store layers are not split.")),
    "potatoes": dict(name="potatoes", ers="/media/5758/fresh-potatoes.csv",
                     bls=("APU0000712112", 1.0, "Potatoes, white, per lb"),
                     ams=dict(commodity="Potatoes", pack=r"^50 lb cartons$", variety=r"^RUSSET",
                              desc="russet potatoes, 50 lb cartons")),
    "strawberries": dict(name="strawberries", ers="/media/5746/fresh-strawberries.csv",
                         bls=("APU0000711415", 16 / 12, "Strawberries, dry pint (12 oz), converted to per lb"),
                         ams=dict(commodity="Strawberries", pack=r"^flats 8 1-lb containers with lids$",
                                  desc="flats of 8 1-lb clamshells")),
    "apples": dict(name="apples", ers="/media/5736/fresh-apples.csv", bls=None,
                   ams=dict(commodity="Apples", pack=r"^cartons 12 3-lb film bags$",
                            desc="all varieties, cartons of 12 3-lb bags")),
    "grapes": dict(name="grapes", ers="/media/5740/fresh-grapes.csv", bls=None,
                   ams=dict(commodity="Grapes", pack=r"^(18|19) lb containers bagged$",
                            desc="18-19 lb containers")),
    "oranges": dict(name="oranges", ers="/media/5742/fresh-oranges.csv",
                    bls=("APU0000711311", 1.0, "Oranges, Navel, per lb"),
                    ams=dict(commodity="Oranges", pack=r"^7/10 bushel cartons$", variety=r"^NAVEL",
                             carton_lb=38, carton_src=AH697 + ": California and Arizona orange carton, 38 lb",
                             desc="navel oranges, 7/10 bushel cartons (38 lb)")),
    "broccoli": dict(name="broccoli", ers="/media/5750/fresh-broccoli.csv", bls=None,
                     ams=dict(commodity="Broccoli", pack=r"^20 lb cartons loose$",
                              desc="20 lb cartons loose")),
    "carrots": dict(name="carrots", ers="/media/5752/fresh-carrots.csv", bls=None,
                    ams=dict(commodity="Carrots", pack=r"^(25|50) lb sacks loose$",
                             desc="25 and 50 lb sacks loose")),
    "peaches": dict(name="peaches", ers="/media/5744/fresh-peaches.csv", bls=None, ams=None,
                    ams_why="Peaches are not in the AMS data collected by market-tracker."),
    "grapefruit": dict(name="grapefruit", ers="/media/5738/fresh-grapefruit.csv",
                       bls=("APU0000711411", 1.0, "Grapefruit, per lb"), ams=None,
                       ams_why="Grapefruit is not in the AMS data collected by market-tracker."),
    # No ERS farm value: listed so the gap is visible, never ranked.
    "bananas": dict(name="bananas", ers=None, bls=("APU0000711211", 1.0, "Bananas, per lb"), ams=None,
                    missing="ERS publishes no farm value for bananas (imported), and AMS has no "
                            "shipping-point price for them, so the farm and farmworker layers can't be sourced."),
    "onions": dict(name="onions", ers=None, bls=None, ams=None,
                   missing="ERS publishes no current farm value for onions and BLS publishes no average "
                           "retail price, so there is no sourced retail price to split."),
}

TODAY = dt.date.today().isoformat()


# ---------------------------------------------------------------------------
# Downloads
# ---------------------------------------------------------------------------

def get(url, **kw):
    r = requests.request(kw.pop("method", "GET"), url, timeout=120,
                         headers={"User-Agent": "Mozilla/5.0 (data research script)"}, **kw)
    r.raise_for_status()
    return r


def load_sources():
    p = RAW / "sources.json"
    return json.loads(p.read_text()) if p.exists() else {}


def fetch_ers(sources):
    (RAW / "ers").mkdir(parents=True, exist_ok=True)
    for slug, it in ITEMS.items():
        if not it["ers"]:
            continue
        url = ERS_BASE + it["ers"]
        path = RAW / "ers" / Path(it["ers"]).name
        path.write_bytes(get(url).content)
        sources[f"ers/{path.name}"] = dict(source="USDA ERS, Price Spreads from Farm to Consumer",
                                           url=url, page=ERS_PAGE, license="CC0", pulled=TODAY)


def fetch_bls(sources):
    ids = sorted({it["bls"][0] for it in ITEMS.values() if it.get("bls")})
    year = dt.date.today().year
    body = get(BLS_API, method="POST",
               json={"seriesid": ids, "startyear": str(year - 4), "endyear": str(year)}).json()
    if body.get("status") != "REQUEST_SUCCEEDED":
        raise RuntimeError(f"BLS: {body.get('status')} {body.get('message')}")
    (RAW / "bls.json").write_text(json.dumps(body, indent=1))
    sources["bls.json"] = dict(source="U.S. Bureau of Labor Statistics, Average Price Data (U.S. city average)",
                               url=BLS_API, page=BLS_PAGE, series=ids, pulled=TODAY)


def market_tracker_dir():
    d = os.environ.get("MARKET_TRACKER_DIR")
    if d:
        return Path(d)
    d = ROOT / ".cache" / "market-tracker"
    if not (d / ".git").exists():
        d.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["git", "clone", "--depth", "1", "--filter=blob:none", "--sparse", AMS_REPO, str(d)],
                       check=True)
    else:
        subprocess.run(["git", "-C", str(d), "pull", "--ff-only", "-q"], check=True)
    years = range(dt.date.today().year - 4, dt.date.today().year + 1)
    subprocess.run(["git", "-C", str(d), "sparse-checkout", "set"] +
                   [f"data/raw/{t}/{y}" for t in ("terminal", "shipping_point") for y in years], check=True)
    return d


def ams_window(year_label):
    """Months matching an ERS year: '2025' -> calendar 2025; '2024/25' -> Nov 2024-Oct 2025 (citrus season)."""
    if "/" in year_label:
        y = int(year_label[:4])
        return f"{y}-11", f"{y + 1}-10"
    return f"{year_label}-01", f"{year_label}-12"


def fetch_ams(sources, ers_years):
    """Annual average $/lb per item and market type, from market-tracker's raw AMS rows."""
    mt = market_tracker_dir()
    commit = subprocess.run(["git", "-C", str(mt), "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip()
    wanted = {slug: it["ams"] for slug, it in ITEMS.items() if it.get("ams")}
    commodities = {s["commodity"] for s in wanted.values()}
    # every year label we need: latest ERS year and two years earlier, per item
    windows = {}
    for slug in wanted:
        for lab in ers_years[slug]:
            windows[(slug, lab)] = ams_window(lab)
    first = min(w[0] for w in windows.values())[:4]
    last = max(w[1] for w in windows.values())[:4]
    cols = ["report_date", "commodity", "variety", "pack_size", "item_size", "organic", "appearance",
            "condition", "unit_price", "normalized_price", "normalized_unit", "market", "market_type"]
    frames = []
    for t in ("terminal", "shipping_point"):
        for y in range(int(first), int(last) + 1):
            for f in sorted(glob.glob(str(mt / "data" / "raw" / t / str(y) / "*.csv"))):
                x = pd.read_csv(f, dtype=str, usecols=cols)
                frames.append(x[x.commodity.isin(commodities)])
    d = pd.concat(frames)
    # standard product only: no organic, no rows USDA graded fair appearance/condition (distressed lots)
    d = d[(d.organic != "Y") & ~d.appearance.fillna("").str.contains("Fair") &
          ~d.condition.fillna("").str.contains("Fair")].copy()
    d["unit"] = pd.to_numeric(d.unit_price, errors="coerce")
    d["norm"] = pd.to_numeric(d.normalized_price, errors="coerce")
    d["month"] = d.report_date.str[:7]
    out = []
    for (slug, lab), (m0, m1) in windows.items():
        s = wanted[slug]
        x = d[(d.commodity == s["commodity"]) & d.pack_size.fillna("").str.match(s["pack"]) &
              (d.month >= m0) & (d.month <= m1)]
        if s.get("variety"):
            x = x[x.variety.fillna("").str.match(s["variety"], case=False)]
        if s.get("item"):
            x = x[x.item_size.fillna("").str.match(s["item"])]
        x = x.copy()
        if s.get("carton_lb"):
            x["lb"] = x.unit / s["carton_lb"]
        else:
            x["lb"] = x.norm.where(x.normalized_unit == "per lb")  # weight stated in the pack text
        x = x.dropna(subset=["lb"])
        # one price per market per day (median of that day's lots), then the average of all market-days
        days = x.groupby(["market_type", "market", "report_date"]).lb.median().reset_index()
        for mtype, g in days.groupby("market_type"):
            out.append(dict(item=slug, year=lab, market_type=mtype, months=f"{m0} to {m1}",
                            dollars_per_lb=round(g.lb.mean(), 4), market_days=len(g),
                            markets="; ".join(sorted(g.market.unique()))))
    pd.DataFrame(out).sort_values(["item", "year", "market_type"]).to_csv(RAW / "ams_annual.csv", index=False)
    sources["ams_annual.csv"] = dict(source="USDA AMS Market News terminal-market and shipping-point reports",
                                     url=AMS_REPO, note="annual averages computed from market-tracker data/raw",
                                     market_tracker_commit=commit, pulled=TODAY)


# ---------------------------------------------------------------------------
# Readers
# ---------------------------------------------------------------------------

def read_ers(it):
    d = pd.read_csv(RAW / "ers" / Path(it["ers"]).name, encoding="utf-8-sig", dtype={"Year": str})
    d["Attribute"] = d.Attribute.str.replace("pounds", "pound")
    p = d.pivot(index="Year", columns="Attribute", values="Value").sort_index()
    p = p.rename(columns={"Retail price (cents/pound)": "retail", "Farm price (cents/pound)": "farm_price",
                          "Farm share (percent)": "farm_share"})
    return p[["retail", "farm_price", "farm_share"]].dropna()


def read_bls():
    p = RAW / "bls.json"
    if not p.exists():
        return {}
    out = {}
    for s in json.loads(p.read_text())["Results"]["series"]:
        rows = {}
        for r in s["data"]:
            if r["period"].startswith("M") and r["period"] != "M13":
                try:
                    rows[f"{r['year']}-{r['period'][1:]}"] = float(r["value"])
                except ValueError:
                    pass
        out[s["seriesID"]] = rows
    return out


def read_ams():
    p = RAW / "ams_annual.csv"
    return pd.read_csv(p, dtype={"year": str}) if p.exists() else pd.DataFrame()


# ---------------------------------------------------------------------------
# The arithmetic
# ---------------------------------------------------------------------------

def pct(a, b):
    return round((a / b - 1) * 100, 1)


def cents_display(layers):
    """Round layer cents to whole numbers that still add to 100 (largest remainder)."""
    floor = {k: int(v // 1) for k, v in layers.items()}
    short = 100 - sum(floor.values())
    for k in sorted(layers, key=lambda k: layers[k] - floor[k], reverse=True)[:short]:
        floor[k] += 1
    return floor


def build_item(slug, it, bls, ams, sources):
    rec = dict(item=slug, name=it["name"], everyday=slug in EVERYDAY, generated=TODAY)
    if it.get("missing"):
        rec.update(status="excluded", flags=["no farm value source"], notes=[it["missing"]])
        if it.get("bls"):
            rec["current_shelf_price"] = shelf_price(it, bls)
        return rec

    ers = read_ers(it)
    years = list(ers.index)
    y = years[-1]
    y0 = years[-3]
    row = ers.loc[y]
    R, FP, S = row.retail, row.farm_price, row.farm_share
    FV = S / 100 * R                      # farm value of one retail pound (ERS: share x retail)
    k = FV / FP                           # farm pounds per retail pound (waste/shrink factor implied by ERS)
    ers_src = sources.get(f"ers/{Path(it['ers']).name}", {})
    flags, notes = [], []

    rec.update(unit="per pound", data_year=y,
               retail_price=dict(dollars=round(R / 100, 2), cents_per_lb=round(R, 1), year=y,
                                 source="USDA ERS Price Spreads from Farm to Consumer (retail data: Circana)",
                                 url=ers_src.get("url"), pulled=ers_src.get("pulled")),
               ers=dict(retail_cents_per_lb=round(R, 2), farm_price_cents_per_lb=round(FP, 2),
                        farm_share_pct=round(S, 2), farm_value_cents_per_retail_lb=round(FV, 2),
                        waste_factor_farm_lb_per_retail_lb=round(k, 3)))

    # -- layers ---------------------------------------------------------------
    fw = S * FARMWORKER_SHARE_OF_FARM_VALUE
    layers = dict(farmworker=fw, farm_owner_and_costs=S - fw)
    a = ams[(ams["item"] == slug) & (ams.year == y)] if len(ams) else ams
    sp = a[a.market_type == "shipping point"].dollars_per_lb
    tm = a[a.market_type == "terminal"].dollars_per_lb
    basis = None
    if len(sp):
        sp_c = sp.iloc[0] * 100
        ratio = sp_c / FP
        basis = "packed" if abs(ratio - 1) <= FOB_MATCH_TOLERANCE else ("before_packing" if ratio > 1 else "above_fob")
        rec["farm_price_check"] = dict(
            ers_farm_price_cents_per_lb=round(FP, 1), ams_shipping_point_cents_per_lb=round(sp_c, 1),
            ratio=round(ratio, 2), basis=basis,
            meaning={"packed": "ERS farm price matches the packed shipping-point price: the farm layer "
                               "includes packing (grower-shipper).",
                     "before_packing": "ERS farm price is below the packed shipping-point price: packing "
                                       "and cooling fall in the wholesale layer, not the farm layer.",
                     "above_fob": "ERS farm price is above the packed shipping-point price for this pack: "
                                  "pack mix differs; treat with care."}[basis])
    if len(tm):
        W = tm.iloc[0] * 100 * k          # wholesale value of one retail pound
        layers["shipping_and_wholesale"] = (W - FV) / R * 100
        layers["store"] = 100 - S - layers["shipping_and_wholesale"]
        rec["wholesale"] = dict(terminal_cents_per_lb=round(tm.iloc[0] * 100, 1),
                                cents_per_retail_lb=round(W, 1),
                                pack=it["ams"]["desc"], carton_weight_source=it["ams"].get("carton_src"),
                                market_days=int(a[a.market_type == "terminal"].market_days.iloc[0]),
                                markets=a[a.market_type == "terminal"].markets.iloc[0],
                                months=a[a.market_type == "terminal"].months.iloc[0])
    else:
        layers["after_the_farm"] = 100 - S
        flags.append("no wholesale split")
        notes.append(it.get("ams_why", "No AMS terminal-market price for this item and year."))

    total = sum(layers.values())
    assert abs(total - 100) < 1e-9, f"{slug}: layers sum to {total}"
    bad = [k_ for k_, v in layers.items() if v < 0]
    if bad:
        flags.append("negative layer: " + ", ".join(bad))
    if not 0.9 <= k <= 1.5:
        flags.append(f"implausible ERS waste factor {k:.2f}")
    if slug == "strawberries":
        notes.append("The AMS terminal-market price for strawberries ($2.99/lb in 2025) is about the same as the "
                     "ERS average retail price ($3.15/lb). Stores often sell strawberries as a low-margin draw and "
                     "large chains buy direct from shippers, so terminal prices don't describe what they pay. "
                     "Left out of the rankings.")
    if slug == "carrots":
        notes.append("ERS carrot farm share jumped from 47.6% (2022) to 84.8% (2025), and the ERS farm price "
                     "(92 c/lb) is more than double the AMS shipping-point price for loose carrots (37.5 c/lb). "
                     "The ERS series likely values a different product mix (cut and baby carrots).")
    if layers.get("store", 100) < 15 and not bad:
        notes.append(f"Store layer is only {layers['store']:.0f} cents: the terminal-market price is probably above "
                     "what large chains pay (they mostly buy direct from shippers), so the wholesale layer is "
                     "likely overstated and the store layer understated.")
    rec["layers_cents"] = {k_: round(float(v), 2) for k_, v in layers.items()}
    if not bad:
        rec["layers_cents_display"] = cents_display(layers)
        assert sum(rec["layers_cents_display"].values()) == 100
    rec["layer_sources"] = layer_sources(rec, it, ers_src, basis)

    # -- trend: retail vs farm price, latest year vs two years earlier ---------
    r0, f0 = ers.loc[y0].retail, ers.loc[y0].farm_price
    rch, fch = pct(R, r0), pct(FP, f0)
    trend = dict(from_year=y0, to_year=y,
                 retail_cents_per_lb=[round(r0, 1), round(R, 1)], retail_change_pct=rch,
                 farm_price_cents_per_lb=[round(f0, 1), round(FP, 1)], farm_price_change_pct=fch,
                 gap_points=round(rch - fch, 1), retail_up_farm_down=bool(rch > 0 and fch < 0),
                 source="USDA ERS Price Spreads from Farm to Consumer (nominal dollars)")
    a0 = ams[(ams["item"] == slug) & (ams.year == y0) & (ams.market_type == "shipping point")] if len(ams) else ams
    if len(a0) and len(sp):
        trend["ams_shipping_point_change_pct"] = pct(sp.iloc[0], a0.dollars_per_lb.iloc[0])
    rec["trend_2yr"] = trend

    if it.get("bls"):
        rec["current_shelf_price"] = shelf_price(it, bls, y)
    latest = max(v[-4:] if "/" not in v else "20" + v[-2:] for v in ITEMS_YEARS.values())
    if (y if "/" not in y else "20" + y[-2:]) != latest:
        notes.append(f"Latest ERS year for this item is {y}, older than other items.")
    notes.append(FARMWORKER_SOURCE)
    if "/" in y:
        notes.append(f"ERS reports this item by season ({y}); AMS prices averaged over November to October.")
    rec["status"] = "flagged" if (bad or "implausible" in " ".join(flags)) else "ok"
    rec["flags"], rec["notes"] = flags, notes
    return rec


def layer_sources(rec, it, ers_src, basis):
    ers_ref = f"USDA ERS Price Spreads from Farm to Consumer, {rec['data_year']} ({ers_src.get('url')})"
    s = dict(
        farmworker=f"{FARMWORKER_SOURCE} Applied to the ERS farm value. {ers_ref}",
        farm_owner_and_costs=f"ERS farm value minus the farmworker estimate. {ers_ref}",
    )
    if "wholesale" in rec:
        s["shipping_and_wholesale"] = (f"AMS terminal-market price ({rec['wholesale']['pack']}; "
                                       f"{rec['wholesale']['markets']}) adjusted by the ERS waste factor, "
                                       f"minus ERS farm value. {AMS_SOURCE}, {AMS_REPO}")
        s["store"] = "ERS retail price minus the wholesale value. " + ers_ref
    else:
        s["after_the_farm"] = "ERS retail price minus ERS farm value. " + ers_ref
    return s


def shelf_price(it, bls, year=None):
    sid, factor, label = it["bls"]
    rows = bls.get(sid, {})
    if not rows:
        return None
    last = max(rows)
    out = dict(series=sid, label=label, latest_month=last, dollars_per_lb=round(rows[last] * factor, 2),
               source="BLS Average Price Data, U.S. city average", url=BLS_PAGE)
    if year and "/" not in year:
        vals = [v for m, v in rows.items() if m.startswith(year)]
        if len(vals) >= 10:  # BLS skipped October 2025 (federal shutdown)
            out[f"average_{year}_dollars_per_lb"] = round(sum(vals) / len(vals) * factor, 2)
            out[f"months_in_{year}_average"] = len(vals)
    return out


ITEMS_YEARS = {}


# ---------------------------------------------------------------------------
# Rankings
# ---------------------------------------------------------------------------

def rankings(recs):
    ok = [r for r in recs if r["status"] == "ok"]
    rows = []
    a = sorted(ok, key=lambda r: r["layers_cents"]["farmworker"])
    for i, r in enumerate(a, 1):
        rows.append(dict(ranking="a_smallest_farmworker_share", rank=i, item=r["item"], name=r["name"],
                         value=round(r["layers_cents"]["farmworker"], 1), unit="cents per $1",
                         data_year=r["data_year"], note="; ".join(r["flags"])))
    b = sorted(ok, key=lambda r: (not r["trend_2yr"]["retail_up_farm_down"], -r["trend_2yr"]["gap_points"]))
    for i, r in enumerate(b, 1):
        t = r["trend_2yr"]
        rows.append(dict(ranking="b_retail_up_farm_down_gap", rank=i, item=r["item"], name=r["name"],
                         value=t["gap_points"], unit="retail % change minus farm price % change",
                         data_year=f"{t['from_year']}-{t['to_year']}",
                         note=(f"retail {t['retail_change_pct']:+}%, farm {t['farm_price_change_pct']:+}%"
                               + ("; retail up while farm down" if t["retail_up_farm_down"] else ""))))
    c = sorted([r for r in ok if r["everyday"]],
               key=lambda r: ("no wholesale split" in r["flags"], r["layers_cents"]["farmworker"]))
    for i, r in enumerate(c, 1):
        rows.append(dict(ranking="c_everyday_item", rank=i, item=r["item"], name=r["name"],
                         value=round(r["layers_cents"]["farmworker"], 1), unit="farmworker cents per $1",
                         data_year=r["data_year"],
                         note="full breakdown" if "no wholesale split" not in r["flags"] else "farm layer only"))
    with open(DATA / "rankings.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]), lineterminator="\n")
        w.writeheader()
        w.writerows(rows)
    return rows


# ---------------------------------------------------------------------------
# Chart
# ---------------------------------------------------------------------------

LABELS = {
    "store": ("The grocery store", "rent, staff, lights, spoilage, profit"),
    "shipping_and_wholesale": ("Trucking & wholesale", "{wholesale_sub}"),
    "farm_owner_and_costs": ("The farm", "owner, land, seed, water, {farm_sub}"),
    "farmworker": ("The farmworker", "wages for growing and picking (est.)"),
}


def chart(rec):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib import font_manager
    from matplotlib.patches import FancyBboxPatch

    fams = {f.name for f in font_manager.fontManager.ttflist}
    plt.rcParams["font.family"] = "Inter" if "Inter" in fams else "DejaVu Sans"

    INK, INK2, MUTED, BG = "#0b0b0b", "#52514e", "#8a8984", "#fcfcfb"
    ACCENT = "#eb6834"
    GRAYS = {"store": "#cfcdc6", "shipping_and_wholesale": "#b3b1a9", "farm_owner_and_costs": "#97958c"}

    packed = rec.get("farm_price_check", {}).get("basis") == "packed"
    subs = dict(wholesale_sub="trucks, terminal markets, distributors" if packed
                else "packing, trucks, distributors",
                farm_sub="packing" if packed else "fuel")
    cents = rec["layers_cents_display"]
    order = ["store", "shipping_and_wholesale", "farm_owner_and_costs", "farmworker"]
    price = rec["retail_price"]["dollars"]

    W, H = 1080, 1350
    fig = plt.figure(figsize=(W / 100, H / 100), dpi=100, facecolor=BG)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, W)
    ax.set_ylim(H, 0)
    ax.axis("off")

    renderer = fig.canvas.get_renderer()

    def wrapped(x, y, text, max_w, **kw):
        """Draw text wrapped to max_w pixels (measured, not guessed); return the y below it."""
        words, lines = text.split(), []
        for w_ in words:
            trial = (lines[-1] + " " + w_) if lines else w_
            t = ax.text(0, 0, trial, **kw)
            fits = t.get_window_extent(renderer).width <= max_w
            t.remove()
            if lines and fits:
                lines[-1] = trial
            else:
                lines.append(w_)
        t = ax.text(x, y, "\n".join(lines), va="top", **kw)
        return y + t.get_window_extent(renderer).height

    title = f"Of the ${price:.2f} you pay for a pound of {rec['name']}, here's who gets paid"
    y_ = wrapped(60, 60, title, W - 120, fontsize=46, fontweight="bold", color=INK, linespacing=1.12)
    y_ = wrapped(60, y_ + 16, f"Cents of every $1 at the register. U.S. average, {rec['data_year']}.", W - 120,
            fontsize=23, color=INK2)

    top, bottom = y_ + 44, 1150
    bx, bw = 60, 260
    gap = 4
    num_x, name_x = 540, 572           # numbers right-aligned at num_x, names left-aligned at name_x
    y = top
    for key in order:
        h = (bottom - top) * cents[key] / 100
        is_fw = key == "farmworker"
        ax.add_patch(FancyBboxPatch((bx, y + gap / 2), bw, max(h - gap, 1),
                                    boxstyle="round,pad=0,rounding_size=6",
                                    fc=ACCENT if is_fw else GRAYS[key], ec="none"))
        title_, sub = LABELS[key]
        mid = y + h / 2
        ax.text(num_x, mid, f"{cents[key]}¢", fontsize=66 if is_fw else 54, fontweight="bold",
                color=ACCENT if is_fw else INK, va="center", ha="right")
        ax.text(name_x, mid - 20, title_, fontsize=29, fontweight="bold", color=ACCENT if is_fw else INK,
                va="center")
        ax.text(name_x, mid + 20, sub.format(**subs), fontsize=19.5, color=INK2, va="center")
        assert ax.texts[-1].get_window_extent(renderer).x1 <= W - 20, f"label runs off the edge: {sub}"
        y += h

    src = ("Sources: USDA ERS Price Spreads from Farm to Consumer (retail price, farm value); USDA AMS Market "
           "News terminal-market prices, 8 U.S. cities (wholesale). Farmworker = 1/3 of farm value, an "
           "estimate (P. Martin, UC Davis, via Economic Policy Institute). \"The farm\" includes packing "
           "by grower-shippers.")
    wrapped(60, 1190, src, W - 120, fontsize=14.5, color=MUTED, linespacing=1.45)
    out = CHARTS / "test-post.png"
    fig.savefig(out, dpi=100, facecolor=BG)
    plt.close(fig)
    return out


# ---------------------------------------------------------------------------

def main():
    offline = "--offline" in sys.argv
    for p in (RAW, DATA / "items", CHARTS):
        p.mkdir(parents=True, exist_ok=True)
    sources = load_sources()
    if not offline:
        fetch_ers(sources)
        try:
            fetch_bls(sources)
        except Exception as e:  # keyless BLS API allows few requests a day; keep the last saved copy
            if not (RAW / "bls.json").exists():
                raise
            print(f"WARNING: BLS download failed ({e}); using raw/bls.json from {sources['bls.json']['pulled']}")
    ers_years = {}
    for slug, it in ITEMS.items():
        if it["ers"]:
            ys = list(read_ers(it).index)
            ers_years[slug] = [ys[-3], ys[-1]]
            ITEMS_YEARS[slug] = ys[-1]
    if not offline:
        fetch_ams(sources, ers_years)
        (RAW / "sources.json").write_text(json.dumps(sources, indent=1))
    bls, ams = read_bls(), read_ams()

    recs = []
    for slug, it in ITEMS.items():
        rec = build_item(slug, it, bls, ams, sources)
        (DATA / "items" / f"{slug}.json").write_text(json.dumps(rec, indent=1, default=float))
        recs.append(rec)
        lay = rec.get("layers_cents_display") or rec.get("layers_cents") or {}
        print(f"{slug:16} {rec['status']:9} {rec.get('data_year', ''):8} {lay} {rec.get('flags')}")
    rankings(recs)
    feat = next(r for r in recs if r["item"] == FEATURED)
    assert feat["status"] == "ok" and "no wholesale split" not in feat["flags"], "featured item needs all layers"
    print("chart:", chart(feat))


if __name__ == "__main__":
    main()
