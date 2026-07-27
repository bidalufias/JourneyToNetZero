"""Journey to Net Zero - simulation engine + agent policies."""
import random, itertools
from content import SCEN, RESILIENCE, ROUND_VARIANTS

ROLES = ["government", "business", "community", "activist"]
SUPPORTIVE = {"SPEND_STEER", "TRANSITION", "PARTNER", "COLLABORATE"}
DIRTY = {"EXPAND", "DEREGULATE"}

CFG = dict(
    trend=4.5, persist=0.35,
    green_scale=0.60, green_decay=0.97, green_power=1.5,
    green_dividend=95.0,          # growth bonus = (greenShare-10)/this
    h_b0=6.15, h_b_green=1.5, h_b_growth=0.25, h_persist=0.72, h_scale=0.65,
    # Growth carbon, per point of growth, by green share band. A third of the
    # values this pack was fitted with, because the same tonnes land against a
    # country a third the size. Unscaled, six rounds of drift alone would add
    # two thirds of the national budget back and nothing could win.
    drift=[(20, 0.80), (40, 0.63), (60, 0.50), (100, 0.37)],
    # The abatement multiplier: cheap cuts first, expensive ones last. Reference
    # and range follow the state space down. The floor is 0.60 rather than 0.45
    # because the old game stopped at 200 and never reached the flat part of the
    # curve, while this one runs all the way to zero and spends its endgame
    # there. The ceiling is unchanged at mac_lo + mac_span = 1.15, so the last
    # tonnes still cost nearly twice what the first ones did.
    mac_lo=0.60, mac_span=0.55, mac_ref=50.0, mac_range=50.0,
    self_org_mult=1.5, partner_unfunded=0.5,
    spotlight_backdown=0.50, accountability_bonus=0.22, vetoes=2, regulation_bite=0.55, public_pressure=0.50,      # spotlit dirty option keeps only this share
    evidence_green=1.0,           # green share per round per EVIDENCE flag
    fiscal_income=2, fiscal_bonus_at=5.5, capital_income_at=5.0,
    fiscal_cap=8, capital_cap=12,
    # 300 Mt gross, about 200 absorbed by forest and peatland, so 100 net, and
    # net zero is the actual target rather than a third of the way to it.
    # Emissions are deliberately never clamped: a table that goes net negative
    # has earned it.
    tgt_e=0.0, tgt_g=5.0, tgt_h=7.0,
    start=dict(e=100.0, g=4.5, h=6.0, gr=10, fiscal=4, capital=5, spot=3),
    e_green=1.15, e_dirty=0.95, h_scale2=0.62,
    role_e={"government":0.80,"business":1.00,"community":1.40,"activist":1.30},
    regulate_abate=6.0, credibility_decay=0.92, volunteer_fatigue=0.94,
    coalition={2:(1.0,0.05,0.5), 3:(7.0,0.20,3.0), 4:(9.5,0.36,4.5)}, coal_scale=1.0,   # aligned picks -> (E cut, happiness, green)
    r6_flag_reduce=0.25, r6_flag_cap=0.60, r6_high_e=87, r6_high_mult=2.0,
)


_PACE_CACHE = {}


def pace_schedule(cfg):
    """Where a table should be at the start of each round to be on track.

    A straight line from the start to the target assumes every round can cut
    the same amount, which is only true while the abatement multiplier is flat.
    Over 300 to 200 it very nearly is, so the old linear schedule was fair. Over
    100 to zero it is not: the multiplier crosses its whole range and the last
    rounds are worth a third less than the first. A table sitting exactly on a
    straight line at round four is already behind and cannot tell.

    So the schedule cuts each round in proportion to what that round is actually
    worth, found by solving for the constant effort that lands on the target.
    """
    key = (cfg["start"]["e"], cfg["tgt_e"], cfg["mac_lo"], cfg["mac_span"],
           cfg["mac_ref"], cfg["mac_range"])
    if key in _PACE_CACHE:
        return _PACE_CACHE[key]
    e0, et = cfg["start"]["e"], cfg["tgt_e"]
    lo, span, ref, rng = cfg["mac_lo"], cfg["mac_span"], cfg["mac_ref"], cfg["mac_range"]

    def m(e):
        return max(lo, min(lo + span, lo + span * (e - ref) / rng))

    def land(rate):
        e = e0
        for _ in range(6):
            e -= rate * m(e)
        return e

    los, his = 0.0, max(e0 - et, 1.0) * 2
    for _ in range(80):
        mid = (los + his) / 2
        if land(mid) > et:
            los = mid
        else:
            his = mid
    rate, e, out = (los + his) / 2, e0, [e0]
    for _ in range(6):
        e -= rate * m(e)
        out.append(e)
    _PACE_CACHE[key] = out
    return out


def K(gr, cfg):
    for cap, k in cfg["drift"]:
        if gr <= cap:
            return k
    return cfg["drift"][-1][1]


class Game:
    def __init__(self, path, policies, cfg=CFG, seed=None):
        self.cfg = cfg
        self.rng = random.Random(seed)
        self.path = path                    # e.g. ["R1A","R2C",...]
        self.pol = policies                 # {role: Policy}
        s = cfg["start"]
        self.e, self.g, self.h, self.gr = s["e"], s["g"], s["h"], s["gr"]
        self.fiscal, self.capital, self.spot = s["fiscal"], s["capital"], s["spot"]
        self.trust = {"government": 0, "business": 0, "activist": 0}
        self.flags = set()
        self.g_hist, self.h_hist = [], []
        self.picks = []                     # list of dicts per round
        self.role_e = {r: 0.0 for r in ROLES}
        self.spot_hits = 0
        self.coalition_rounds = 0
        self.collabs = 0
        self.last_dirty = set()
        self.vetoes = cfg["vetoes"]
        self.veto_used = 0
        self.selforg = 0
        self.self_org_ok = 0
        self.log = []

    # ---------- availability ----------
    def available(self, role, sc):
        out = []
        for o in sc["options"][role]:
            cost = o["cost"]
            if "fiscal" in cost and cost["fiscal"] > 0:
                c = cost["fiscal"] - (1 if "GRID_UPGRADED" in self.flags and o["arch"] in SUPPORTIVE else 0)
                if self.fiscal < max(c, 0):
                    continue
            if "capital" in cost and cost["capital"] > 0:
                c = cost["capital"] - (1 if "GRID_UPGRADED" in self.flags and o["arch"] in SUPPORTIVE else 0)
                if self.capital < max(c, 0):
                    continue
            if o.get("gate_trust") and self.trust["government"] < o["gate_trust"]:
                continue
            if o.get("block_flag") and o["block_flag"] in self.flags:
                continue
            out.append(o)
        return out or sc["options"][role][:1]

    # ---------- one round ----------
    def veto_choice(self, rnd):
        """Whose dirty options the Community strikes this round, or None.

        The Community spends a Mandate when the country is behind schedule and
        somebody went dirty last round. "Behind" reads the schedule rather than
        the two numbers this pack happened to ship with: against a 100 Mt
        country a test for emissions above 300 never fires, which silently
        removes the one mechanic the design credits with making a defecting
        Business survivable at all.

        It lives here because the fixture generator needs the same answer, and a
        second copy of the condition is how the two drift apart. It reads only
        pre-round state, so calling it before the treasury and shock steps gives
        what `play_round` decides a moment later.
        """
        if (self.vetoes > 0 and self.last_dirty and rnd >= 2
                and self.pol["community"].coop > 0.35
                and self.e > pace_schedule(self.cfg)[rnd - 1]):
            return sorted(self.last_dirty)[0]
        return None

    def mac(self):
        c = self.cfg
        return max(c["mac_lo"], min(c["mac_lo"] + c["mac_span"],
                   c["mac_lo"] + c["mac_span"] * (self.e - c["mac_ref"]) / c["mac_range"]))

    def play_round(self, i):
        cfg = self.cfg
        sc = SCEN[self.path[i]]
        rnd = i + 1

        # treasury and corporate income (the economy pays for the transition)
        if rnd >= 2:
            self.fiscal += cfg["fiscal_income"]
            if self.g >= cfg["fiscal_bonus_at"]:
                self.fiscal += 1
            self.capital += 1
            if self.g >= cfg["capital_income_at"]:
                self.capital += 1

        # legacy: subsidy lock drains the treasury in R4 and R5
        if "SUBSIDY_LOCK" in self.flags and rnd in (4, 5):
            self.fiscal = max(0, self.fiscal - 1)

        # ---- shock ----
        sh = sc["shock"]
        mult = 1.0
        if rnd == 5 and ("BUILT_COAL" in self.flags or "REGULATORY_CAPTURE" in self.flags):
            mult = 1.6
        if rnd == 6:
            if self.e > cfg["r6_high_e"]:
                mult *= cfg["r6_high_mult"]
            if "BUILT_COAL" in self.flags:
                mult *= 1.5
            nres = len(self.flags & RESILIENCE)
            mult *= max(1 - min(nres * cfg["r6_flag_reduce"], cfg["r6_flag_cap"]), 0.0)
        sh_g, sh_h, sh_e = sh["g"] * mult, sh["h"] * mult, sh.get("e", 0)
        self.fiscal = max(0, self.fiscal + sh.get("fiscal", 0))
        self.capital = max(0, self.capital + sh.get("capital", 0))

        self.fiscal = min(self.fiscal, cfg["fiscal_cap"])
        self.capital = min(self.capital, cfg["capital_cap"])

        # ---- choices ----
        veto_on = None
        veto_on = self.veto_choice(rnd)
        if veto_on:
            self.vetoes -= 1
            self.veto_used += 1

        chosen = {}
        for r in ROLES:
            opts = self.available(r, sc)
            if r == veto_on:
                clean = [o for o in opts if o["arch"] not in DIRTY]
                opts = clean or opts
            chosen[r] = self.pol[r].pick(self, opts, r, rnd)

        gov_regulates = chosen["government"]["arch"] == "REGULATE"
        gov_isolated = (chosen["government"]["arch"] == "DEREGULATE" and
                        all(chosen[r]["arch"] not in DIRTY | {"DEMAND_RELIEF"}
                            for r in ROLES if r != "government"))

        # ---- spotlight ----
        spot_target = None
        act = chosen["activist"]
        if act["arch"] == "ESCALATE" and self.spot > 0:
            cand = [r for r in ("business", "government") if chosen[r]["arch"] in DIRTY]
            if cand:
                spot_target = max(cand, key=lambda r: chosen[r]["e"])
                self.spot -= 1

        # ---- resolve ----
        de = dg = dh = dgr = 0.0
        for r in ROLES:
            o = chosen[r]
            e, g, h, gr = o["e"], o["g"], o["h"], o["gr"]
            m = 1.0
            if o["arch"] == "PARTNER":
                cof = self.pol["government"].cofund(self, o) and self.fiscal >= 1
                if cof:
                    self.fiscal -= 1
                else:
                    m *= cfg["partner_unfunded"]
            if o["arch"] == "SELF_ORGANISE":
                sup = "MUTUAL_AID" in self.flags or any(
                    chosen[x]["arch"] in SUPPORTIVE for x in ("government", "business"))
                if sup:
                    m *= cfg["self_org_mult"]
                    self.self_org_ok += 1
            if o["arch"] == "REGULATE" and "REGULATORY_CAPTURE" in self.flags and rnd >= 5:
                m *= 0.5
            if o.get("boost_flag") and o["boost_flag"] in self.flags:
                m *= 1.5
            if o.get("boost_evidence") and len([f for f in self.flags if f.startswith("EVIDENCE")]) >= 2:
                m *= 2.0
            if r == "activist":
                m *= cfg["credibility_decay"] ** self.collabs
            if r == "community" and o["arch"] == "SELF_ORGANISE":
                m *= cfg["volunteer_fatigue"] ** self.selforg
            if r == "activist" and o["arch"] == "ESCALATE" and spot_target:
                m *= 1.4
            if r == spot_target:
                m *= cfg["spotlight_backdown"]
            if r == "business" and o["arch"] in DIRTY and gov_regulates:
                m *= cfg["regulation_bite"]
            if r == "government" and gov_isolated:
                m *= cfg["public_pressure"]

            em = (cfg["e_green"] * self.mac()) if e < 0 else cfg["e_dirty"]
            e = e * em * cfg["role_e"][r]
            de += e * m; dg += g * m; dh += h * m * cfg["h_scale2"]; dgr += gr * m
            self.role_e[r] += e * m

            # costs
            c = dict(o["cost"])
            if "GRID_UPGRADED" in self.flags and o["arch"] in SUPPORTIVE:
                for k in c:
                    if c[k] > 0:
                        c[k] = max(0, c[k] - 1)
            self.fiscal = max(0, self.fiscal - c.get("fiscal", 0))
            self.capital = max(0, self.capital - c.get("capital", 0))
            if o.get("grants"):
                who, res, amt = o["grants"]
                if res == "capital":
                    self.capital += amt
            if o["arch"] == "DEMAND_RELIEF":
                if self.fiscal >= 2:
                    self.fiscal -= 1
                else:
                    self.trust["government"] = max(0, self.trust["government"] - 1)
            self.flags.update(o["flags"])
            if o["arch"] == "COLLABORATE":
                self.collabs += 1
            if o["arch"] == "SELF_ORGANISE":
                self.selforg += 1

        # THE COALITION BONUS - things only possible when most of the table pulls together
        # holding a defector to account is cooperation too
        aligned = sum(1 for r in ROLES
                      if chosen[r]["arch"] not in DIRTY | {"DEMAND_RELIEF"})
        if aligned in cfg["coalition"]:
            ce, ch, cg = [x * cfg["coal_scale"] for x in cfg["coalition"][aligned]]
            ce *= self.mac()
            de -= ce; dh += ch; dgr += cg
            self.coalition_rounds += 1

        # regulation forces abatement: the polluter cuts whether they meant to or not
        if gov_regulates:
            ab = cfg["regulate_abate"] * self.mac() * (1.0 if chosen["business"]["arch"] in DIRTY else 0.45)
            de -= ab
            self.role_e["government"] -= ab
            self.capital = max(0, self.capital - 1)

        if gov_isolated:
            self.trust["government"] = max(0, self.trust["government"] - 1)

        # spotlight bite
        if spot_target:
            dh += cfg["accountability_bonus"]      # being caught is not the same as being unpunished
            self.trust[spot_target] = max(0, self.trust[spot_target] - 1)
            self.spot_hits += 1

        # ---- apply ----
        self.e += sh_e + de
        prev_dev = self.g - cfg["trend"]
        self.g = cfg["trend"] + cfg["persist"] * prev_dev + sh_g + dg
        self.g = max(-5.0, min(9.0, self.g))
        # hedonic adaptation: people get used to good news
        # wellbeing reverts toward a baseline set by how the transition is actually going
        hb = cfg["h_b0"] + cfg["h_b_green"] * (self.gr / 100.0) + cfg["h_b_growth"] * (self.g - 4.5)
        self.h = hb + cfg["h_persist"] * (self.h - hb) + sh_h + dh * cfg["h_scale"]
        self.h = max(0.0, min(10.0, self.h))

        # green economy: depreciates, and gets harder as it grows
        nev = len([f for f in self.flags if f.startswith("EVIDENCE")])
        add = (dgr + nev * cfg["evidence_green"]) * cfg["green_scale"]
        add *= (1 - self.gr / 100.0) ** cfg["green_power"]
        self.gr = max(0, min(100, self.gr * cfg["green_decay"] + add))

        # the green economy is itself a growth sector
        self.g += (self.gr - 10) / cfg["green_dividend"]
        self.g = max(-5.0, min(9.0, self.g))

        # drift
        self.e += self.g * K(self.gr, cfg)

        # trust: Community awards one token for care, one for the future
        for key in ("h", "gr"):
            best, bv = None, -99
            for r in ("government", "business", "activist"):
                v = chosen[r][key] - (1.0 if r == "business" and "LAYOFFS" in self.flags else 0)
                if v > bv:
                    best, bv = r, v
            if best:
                self.trust[best] += 1

        self.last_dirty = {r for r in ROLES if chosen[r]["arch"] in DIRTY}
        self.g_hist.append(self.g)
        self.h_hist.append(self.h)
        self.picks.append({r: chosen[r]["id"] for r in ROLES})

    def run(self):
        for i in range(6):
            self.play_round(i)
        return self.result()

    def result(self):
        c = self.cfg
        avg_g = sum(self.g_hist) / len(self.g_hist)
        pe, pg, ph = self.e <= c["tgt_e"], avg_g >= c["tgt_g"], self.h >= c["tgt_h"]
        return dict(win=pe and pg and ph, pe=pe, pg=pg, ph=ph,
                    e=self.e, g=avg_g, h=self.h, gr=self.gr,
                    fiscal=self.fiscal, capital=self.capital, trust=dict(self.trust),
                    flags=set(self.flags), role_e=dict(self.role_e),
                    spot_hits=self.spot_hits, vetoes_used=self.veto_used, coalition_rounds=self.coalition_rounds, self_org_ok=self.self_org_ok,
                    g_hist=list(self.g_hist), h_hist=list(self.h_hist),
                    picks=list(self.picks))


# ------------------------- private goals -------------------------
def goal_met(gid, res):
    e, g, h, gr = res["e"], res["g"], res["h"], res["gr"]
    t, f = res["trust"], res["flags"]
    return {
        "G-a": t["government"] >= 6,
        "G-b": min(res["g_hist"]) >= 4.0,
        "G-c": gr >= 55,
        "B-a": res["capital"] >= 6,
        "B-b": res["role_e"]["business"] <= -33,
        "B-c": t["business"] >= 2 and res["capital"] >= 4,
        "C-a": h >= 8.0,
        "C-b": min(res["h_hist"]) >= 6.3,
        "C-c": res["self_org_ok"] >= 4,
        # Every Collaborate card sets COMPROMISED, so both halves of this goal
        # now bite. Measured against an Activist who plays for it (the
        # "nocompromise" policy) rather than against agents that do not know
        # their goal and take Collaborate in 95% of games: 40.1%, against a
        # published 40.9%. The carbon bar did not have to move.
        "A-a": "COMPROMISED" not in f and e <= -25,
        "A-b": gr >= 52,
        "A-c": h >= 7.0 and res["spot_hits"] >= 1,
    }[gid]


# ------------------------- agent policies -------------------------
class Policy:
    def __init__(self, name, w, coop=0.5):
        self.name, self.w, self.coop = name, w, coop

    def cofund(self, gm, o):
        if o["arch"] == "COLLABORATE":
            s -= w.get("gr", 0.2) * 6 * (6 - rnd) * 0.25     # spent credibility costs later rounds
        if o["arch"] == "SELF_ORGANISE":
            s -= w.get("h", 0.3) * 3 * (6 - rnd) * 0.20      # volunteers burn out
        return self.coop > 0.45

    def score(self, gm, o, role, rnd):
        w = self.w
        cost = o["cost"].get("fiscal", 0) + o["cost"].get("capital", 0)
        s = (w["e"] * (-o["e"]) + w["g"] * o["g"] * 10 + w["h"] * o["h"] * 10
             + w["gr"] * o["gr"] + w["res"] * (-cost) * 3)
        if role == "activist":
            s0 = gm.cfg["credibility_decay"] ** gm.collabs
        elif role == "community" and o["arch"] == "SELF_ORGANISE":
            s0 = gm.cfg["volunteer_fatigue"] ** gm.selforg
        else:
            s0 = 1.0
        # Pace, and how far off it, both read the configured start and target
        # rather than the numbers the game happened to ship with. An agent that
        # thinks the country starts at 300 and lands at 200 scores every option
        # wrongly once those move, which would quietly invalidate a rebalance.
        e0, et = gm.cfg["start"]["e"], gm.cfg["tgt_e"]
        pace = pace_schedule(gm.cfg)[rnd - 1]
        off_pace = max(0.0, (gm.e - pace) / (abs(e0 - et) * 0.1))
        if o["arch"] in ("ESCALATE", "REGULATE"):
            s += w.get("gap", 0.3) * off_pace * 8
            if gm.last_dirty - {role}:
                s += 4.0 * (1 + w.get("e", 0.2))     # someone defected: apply pressure
        if w.get("gap"):
            need_e = max(0.0, (gm.e - et) / (e0 - et))
            need_g = max(0.0, (gm.cfg["tgt_g"] - (sum(gm.g_hist) / max(len(gm.g_hist), 1) if gm.g_hist else gm.g)))
            need_h = max(0.0, gm.cfg["tgt_h"] - gm.h)
            s += w["gap"] * (need_e * (-o["e"]) * 1.2 + need_g * o["g"] * 12 + need_h * o["h"] * 12)
        if o["arch"] == "COLLABORATE":
            s -= w.get("gr", 0.2) * 6 * (6 - rnd) * 0.25     # spent credibility costs later rounds
        if o["arch"] == "SELF_ORGANISE":
            s -= w.get("h", 0.3) * 3 * (6 - rnd) * 0.20      # volunteers burn out
        return s * s0

    def pick(self, gm, opts, role, rnd):
        if self.name == "random":
            return gm.rng.choice(opts)
        scored = [(self.score(gm, o, role, rnd) + gm.rng.uniform(-1.5, 1.5), o) for o in opts]
        return max(scored, key=lambda x: x[0])[1]


class NoCompromise(Policy):
    """An Activist who took the No Compromise goal and plays for it.

    The stock policies do not know their private goal, so measuring a goal that
    forbids a whole archetype against them measures the agents' taste for that
    archetype rather than the goal's difficulty. Collaborate is taken in about
    95% of games, which capped No Compromise at 5% however the carbon bar was
    set. A player who takes the goal avoids the card. This is that player.
    """

    def pick(self, gm, opts, role, rnd):
        clean = [o for o in opts if o["arch"] != "COLLABORATE"] or opts
        return Policy.pick(self, gm, clean, role, rnd)


POLICIES = {
    "selfish":    Policy("selfish",    dict(e=0.05, g=1.0, h=0.3, gr=0.02, res=1.2), 0.15),
    "cooperator": Policy("cooperator", dict(e=0.35, g=0.5, h=0.6, gr=0.30, res=0.2, gap=1.0), 0.9),
    "balanced":   Policy("balanced",   dict(e=0.20, g=0.7, h=0.5, gr=0.15, res=0.6, gap=0.4), 0.55),
    "populist":   Policy("populist",   dict(e=0.05, g=0.8, h=1.2, gr=0.03, res=0.5), 0.4),
    "ideologue":  Policy("ideologue",  dict(e=0.60, g=0.05, h=0.2, gr=0.55, res=0.1), 0.35),
    "random":     Policy("random",     dict(e=0, g=0, h=0, gr=0, res=0), 0.5),
}

# The six policies a random table is drawn from. Named separately because
# POLICIES also holds measurement-only agents, and a random mix that quietly
# included one would not be measuring the same game the report describes.
MIX_POLICIES = list(POLICIES)

# Measurement only: it exists to measure one goal against a player who is
# actually chasing it. See goal_met("A-a"). Never drawn into a random table.
POLICIES["nocompromise"] = NoCompromise(
    "nocompromise", POLICIES["balanced"].w, POLICIES["balanced"].coop)


def all_paths():
    return [list(p) for p in itertools.product(*[ROUND_VARIANTS[r] for r in range(1, 7)])]


def run_many(n, mix=None, cfg=CFG, seed=0):
    rng = random.Random(seed)
    paths = all_paths()
    out = []
    for i in range(n):
        path = rng.choice(paths)
        if mix:
            pol = {r: POLICIES[mix[r]] for r in ROLES}
        else:
            pol = {r: POLICIES[rng.choice(MIX_POLICIES)] for r in ROLES}
        gm = Game(path, pol, cfg, seed=rng.randrange(10**9))
        res = gm.run()
        res["path"] = path
        res["mix"] = {r: pol[r].name for r in ROLES}
        out.append(res)
    return out
