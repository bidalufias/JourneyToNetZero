"""
Generate golden fixtures from the reference implementation.

`reference/engine.py` is authoritative: the content pack's constants were fitted
against it across roughly 200,000 simulated games. This script replays it over a
spread of scenario paths and agent mixes and records, for every round, both the
inputs a human table would supply (the four choices, the veto, the co-funding
decision) and the complete resulting state.

`test/parity.test.ts` feeds those same inputs to the TypeScript port and asserts
the state matches exactly. If a refactor breaks the resolution order, that test
fails, which is the whole point of it.

Usage:  npm run fixtures
"""
import json
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "reference"))

from engine import CFG, POLICIES, ROLES, Game, all_paths, goal_met  # noqa: E402

OUT = os.path.join(ROOT, "test", "fixtures", "golden.json")

# Enough games to exercise every scenario, both endings, all legacy-flag
# interactions and the Round 6 resilience scaling.
N_GAMES = 240
GOAL_IDS = ["G-a", "G-b", "G-c", "B-a", "B-b", "B-c",
            "C-a", "C-b", "C-c", "A-a", "A-b", "A-c"]


def snapshot(gm):
    """Full engine state, in the shape the TS test compares against."""
    return dict(
        e=gm.e, g=gm.g, h=gm.h, gr=gm.gr,
        fiscal=gm.fiscal, capital=gm.capital,
        spot=gm.spot, vetoes=gm.vetoes,
        trust=dict(gm.trust),
        flags=sorted(gm.flags),
        role_e={r: gm.role_e[r] for r in ROLES},
        spot_hits=gm.spot_hits, vetoes_used=gm.veto_used,
        coalition_rounds=gm.coalition_rounds,
        collabs=gm.collabs, selforg=gm.selforg,
        self_org_ok=gm.self_org_ok,
        last_dirty=sorted(gm.last_dirty),
        g_hist=list(gm.g_hist), h_hist=list(gm.h_hist),
    )


def veto_decision(gm, rnd):
    """
    Recompute the reference's veto choice.

    The condition reads only pre-round state: vetoes, last_dirty, the round
    number, the Community policy's cooperativeness and emissions, none of which
    the treasury or shock steps touch, so evaluating it here matches what
    `play_round` will decide a moment later.
    """
    if (gm.vetoes > 0 and gm.last_dirty and rnd >= 2
            and gm.pol["community"].coop > 0.35
            and gm.e > 300 - (300 - 200) * (rnd - 1) / 6.0):
        return sorted(gm.last_dirty)[0]
    return None


def main():
    rng = random.Random(20250726)
    paths = all_paths()
    policy_names = list(POLICIES)
    games = []

    # Guarantee coverage of the documented table archetypes alongside the
    # random mixes, so the fixtures include both endings and the extremes.
    forced_mixes = [
        {r: "selfish" for r in ROLES},
        {r: "cooperator" for r in ROLES},
        {r: "balanced" for r in ROLES},
        {r: "populist" for r in ROLES},
        {r: "ideologue" for r in ROLES},
        {**{r: "cooperator" for r in ROLES}, "business": "selfish"},
        {**{r: "cooperator" for r in ROLES}, "government": "selfish"},
    ]

    for i in range(N_GAMES):
        path = rng.choice(paths)
        if i < len(forced_mixes):
            mix = forced_mixes[i]
        else:
            mix = {r: rng.choice(policy_names) for r in ROLES}
        pol = {r: POLICIES[mix[r]] for r in ROLES}

        gm = Game(path, pol, CFG, seed=rng.randrange(10 ** 9))
        rounds = []
        for idx in range(6):
            rnd = idx + 1
            veto = veto_decision(gm, rnd)
            # `Policy.cofund` ignores its arguments and returns coop > 0.45.
            # PARTNER is a Business-only archetype, so one decision per round.
            cofund = bool(pol["government"].coop > 0.45)

            gm.play_round(idx)

            rounds.append(dict(
                round=rnd,
                scenario=path[idx],
                choices=gm.picks[-1],
                veto_target=veto,
                cofund=cofund,
                state=snapshot(gm),
            ))

        res = gm.result()
        games.append(dict(
            path=path,
            mix=mix,
            rounds=rounds,
            result=dict(
                win=res["win"], pe=res["pe"], pg=res["pg"], ph=res["ph"],
                e=res["e"], g=res["g"], h=res["h"], gr=res["gr"],
                fiscal=res["fiscal"], capital=res["capital"],
                trust=res["trust"], flags=sorted(res["flags"]),
                role_e=res["role_e"], spot_hits=res["spot_hits"],
                vetoes_used=res["vetoes_used"],
                coalition_rounds=res["coalition_rounds"],
                self_org_ok=res["self_org_ok"],
                g_hist=res["g_hist"], h_hist=res["h_hist"],
            ),
            goals={gid: goal_met(gid, res) for gid in GOAL_IDS},
        ))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        # repr-precision floats: the TS side must reproduce these exactly.
        json.dump(dict(generatedBy="reference/engine.py", games=games), f)

    scenarios = {r["scenario"] for gme in games for r in gme["rounds"]}
    wins = sum(1 for gme in games if gme["result"]["win"])
    print(f"wrote {OUT}")
    print(f"  {len(games)} games, {len(games) * 6} rounds")
    print(f"  {len(scenarios)}/18 scenarios covered")
    print(f"  {wins} wins / {len(games) - wins} losses")


if __name__ == "__main__":
    main()
