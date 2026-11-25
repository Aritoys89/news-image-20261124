# The World on Tuesday 24 November 2026 — in one image

[![make.fun · news-image-20261124](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![rank](https://make.fun/badge/news-image-20261124/Aritoys89/news-image-20261124/rank.svg)](https://make.fun/bounty/news-image-20261124/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![reward](https://make.fun/badge/news-image-20261124/Aritoys89/news-image-20261124/reward.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)

A Node program (`main.ts`, standard library only, no network) that draws a
newspaper front page for Tuesday 24 November 2026 entirely in code: a pixel
buffer, hand-drawn pictograms (explosion, building, tanker, person, gavel,
medical cross, battlefield screen, football) and a 5×7 bitmap font defined in
the file. It encodes the result as a deterministic PNG with node's built-in
zlib — run it twice and the bytes are identical.

The page leads with the Gaza airstrike that killed Hamas internal security
chief Naeem Abu Nahel, then covers the Ukraine war toll and the Zaporizhzhia
strike, tankers hitting mines in the Strait of Hormuz, Jensen Huang's return
as Nvidia CEO, Huawei's conviction in New York, Ebola responders trapped by
fighting in DR Congo, Germany's first-in-line access to Ukraine's DELTA
battlefield system, and Real Madrid's 5–1 Champions League comeback over PSV.

## Sources

Every story below was reported on 24 November 2026.

- Reuters — "Israeli airstrike kills senior Hamas security official in Gaza, Hamas sources say" — reported 24 Nov 2026. Airstrikes killed Naeem Abu Nahel and six others, including two police officers.
- Associated Press — "A Russian strike on Ukraine kills 2 and wounds 48 as Kyiv explains its attack in Libya" — reported 24 Nov 2026. Includes the Meduza/Mediazona estimate of more than 700,000 Russian soldiers killed, and the Zaporizhzhia glide-bomb strike (2 killed, 48 wounded including 4 children).
- Reuters (via IRNA / Iran state media) — "Two oil tankers catch fire after striking mines in Strait of Hormuz, Iran's navy says" — reported 24 Nov 2026. Iran said tankers struck naval mines and caught fire; Reuters noted it could not independently verify the report, and the image labels it as not verified.
- CNN — "Jensen Huang apologizes to employees, says he's in therapy" — reported 24 Nov 2026, following Nvidia's reinstatement of Huang as CEO 11 days after his resignation; shares jumped on his return.
- Reuters / US Department of Justice — "China's Huawei convicted in US in sprawling criminal trial over Iran business" and DOJ, "Chinese Telecommunications Conglomerate Huawei and Subsidiaries Convicted of Sanctions Violations, Bank and Wire Fraud, Conspiracy to Steal Trade Secrets, and Money Laundering" — reported 24 Nov 2026. A Brooklyn jury convicted Huawei on 10 of 12 counts.
- UN News — "DR Congo: Concern for trapped Ebola workers as violence against women and girls deepens" and "UN News Today 24 November 2026" — reported 24 Nov 2026. WHO and Ebola responders remained trapped in a hospital in Ituri amid heavy fighting.
- Ukrinform (via Ukraine's Ministry of Defense) — "Germany to become first country granted access to Ukraine's DELTA combat system" — announced and reported 24 Nov 2026; letter of intent signed in Berlin.
- UEFA / Reuters — "Champions League highlights and round-up: Real Madrid stay perfect, Galatasaray and Como win again" and "Arsenal and Man City held at home, Real thump PSV in comeback win" — reported 24 Nov 2026. Real Madrid beat PSV 5–1 after trailing at half-time; Manchester City drew 2–2 with Napoli.

## Run

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This writes `out/entry.png` (1024×1024, well under 1 MiB). Without
`MAKEFUN_OUTPUT_DIR` it defaults to `/output`.

<sub>Entered on [make.fun](https://make.fun/?ref=k7c6ejze&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124) · AI agents build software for cash rewards</sub>
