"""Journey to Net Zero - full content pack. All 6 rounds x 3 variations."""

def op(oid, arch, title, desc, cost, e, g, h, gr, flags=(), headline="", **kw):
    d = dict(id=oid, arch=arch, title=title, desc=desc, cost=cost or {},
             e=e, g=g, h=h, gr=gr, flags=list(flags), headline=headline)
    d.update(kw)
    return d

F = lambda n: {"fiscal": n}
C = lambda n: {"capital": n}

# Flags that reduce the Round 6 disaster shock
RESILIENCE = {
    "GREEN_STIMULUS", "GRID_UPGRADED", "WATER_LAW", "RIVER_WATCH", "WASTE_LAW",
    "MARINE_LAW", "MONITORING_LAW", "CITIZEN_MONITORING", "CITIZEN_SCIENCE",
    "PEAT_RESTORED", "CANOPY", "HEAT_PLAN", "TRANSIT_BUILT", "RECYCLING_BUILT",
    "INDUSTRY_PACT", "LOCAL_SUPPLY", "URBAN_COOLING", "CLEAN_AIR_SHELTERS",
    "GREEN_PARK", "JUST_TRANSITION",
}

SCEN = {}

# ============================ ROUND 1 - FINANCIAL ============================
SCEN["R1A"] = dict(
    rnd=1, var="A", kind="financial", title="The Great Contraction",
    situation="Semiconductor orders from the Northern markets collapse 30% overnight. Three factories in Perindu announce layoffs before lunch. The Ringga slides.",
    shock=dict(g=-1.45, h=-0.29, e=0, capital=-1),
    options=dict(
      government=[
        op("R1A-G1","SPEND_STEER","Green Stimulus Package","RG 3bn into rooftop solar, rail and building retrofits.",F(2),-10,0.8,0.4,8,["GREEN_STIMULUS"],"Government bets recovery on clean jobs"),
        op("R1A-G2","DEREGULATE","Bail Out the Big Exporters","Rescue the giants. Cut everything else.",F(1),2,0.9,-0.4,-2,["BAILOUT_BIG"],"Rescue for the giants, belt-tightening for the rest",grants=("business","capital",2)),
        op("R1A-G3","DEREGULATE","Hold the Line","No new spending. Protect the reserves.",F(-1),0,0.2,-0.3,0,["FISCAL_HAWK"],"Minister urges patience as reserves hold"),
      ],
      business=[
        op("R1A-B1","TRANSITION","Retool for the Green Market","Convert lines to EV and solar components. Retrain everyone.",C(3),-8,0.3,0.3,10,["RETOOLED"],"Sawit Prima retools for the green economy"),
        op("R1A-B2","EXPAND","Cut Costs, Cut Jobs","Twelve thousand redundancies. Offshore the rest.",C(-2),-4,-0.5,-0.6,-2,["LAYOFFS"],"12,000 jobs gone as Perindu plants shut"),
        op("R1A-B3","PARTNER","Ask for a Lifeline","State support in exchange for guaranteeing the jobs.",C(0),-3,0.6,0.3,3,["OWES_GOV"],"Industry seeks state support, pledges to save jobs"),
      ],
      community=[
        op("R1A-C1","ADAPT","Tighten Belts, Buy Local","Spend less, spend closer to home, wait it out.",None,-4,-0.2,-0.2,3,["LOCAL_ECON"],"Households cut back as local markets revive"),
        op("R1A-C2","DEMAND_RELIEF","March for Jobs","Demand the government spend, and spend now.",None,2,0.4,0.4,-1,[],"Thousands march in Kota Damai demanding jobs"),
        op("R1A-C3","SELF_ORGANISE","Community Skills Fund","Neighbourhood retraining cooperatives.",None,-2,0.1,0.5,4,["COMMUNITY_FUND"],"Laid-off workers start their own retraining scheme"),
      ],
      activist=[
        op("R1A-A1","ESCALATE","No Bailouts for Polluters","Green conditions on every rescue Ringga.",None,-4,-0.3,-0.1,4,[],"Campaigners demand climate conditions on bailouts"),
        op("R1A-A2","COLLABORATE","Join the Recovery Taskforce","Take the seat. Shape it from inside.",None,-3,0.3,0.3,5,["AT_THE_TABLE","COMPROMISED"],"Movement leader joins recovery taskforce"),
        op("R1A-A3","EDUCATE","Publish the Green Jobs Report","Independent modelling of a clean recovery.",None,-1,0.0,0.2,3,["EVIDENCE_1"],"Report: clean recovery could create 340,000 jobs"),
      ]))

SCEN["R1B"] = dict(
    rnd=1, var="B", kind="financial", title="Currency Shock",
    situation="The Ringga loses 22% in eleven days. Imported food, medicine and machinery become brutally expensive. Exporters are quietly delighted.",
    shock=dict(g=-1.11, h=-0.47, e=0),
    options=dict(
      government=[
        op("R1B-G1","SPEND_STEER","Import Substitution Drive","Build what we keep buying: panels, batteries, food.",F(2),-9,0.6,0.3,9,["LOCAL_SUPPLY"],"Minister launches drive to make it here"),
        op("R1B-G2","REGULATE","Defend the Currency","Burn reserves and raise rates to hold the line.",F(2),0,-0.4,0.3,0,["RESERVES_SPENT"],"Central bank burns reserves defending the Ringga"),
        op("R1B-G3","DEREGULATE","Let It Float","Stop intervening. Let the market decide.",F(-1),3,0.7,-0.6,-2,["FLOATED"],"Ringga left to find its own level"),
      ],
      business=[
        op("R1B-B1","TRANSITION","Localise the Supply Chain","Bring inputs home. Expensive now, resilient later.",C(3),-13,0.2,0.4,11,["LOCAL_SUPPLY"],"Manufacturer brings its supply chain home"),
        op("R1B-B2","EXPAND","Reprice for the Export Boom","A cheap Ringga makes us the cheapest supplier alive.",C(-2),7,0.9,-0.3,-3,["EXPORT_SURGE"],"Exporters post record margins as Ringga slides"),
        op("R1B-B3","PARTNER","Co-Fund a Local Components Plant","Split the cost of building it here.",C(1),-7,0.3,0.3,6,["LOCAL_SUPPLY"],"Joint venture to build components at home"),
      ],
      community=[
        op("R1B-C1","ADAPT","Switch to Local Food","Cheaper, closer, and a lot less choice.",None,-5,-0.1,-0.2,4,["FOOD_LOCAL"],"Local produce sales up 40%"),
        op("R1B-C2","DEMAND_RELIEF","Demand Price Controls","Cap the price of the forty things that matter.",None,2,0.1,0.6,-1,["PRICE_CONTROLS"],"Government caps prices on 40 essential goods"),
        op("R1B-C3","SELF_ORGANISE","Neighbourhood Buying Groups","Buy in bulk, cut out the middleman.",None,-4,0.2,0.4,4,["BUYING_GROUPS"],"Buying clubs cut household bills by a fifth"),
      ],
      activist=[
        op("R1B-A1","ESCALATE","Expose the Speculators","Name the funds betting against the country.",None,-2,-0.5,0.1,2,[],"Investigation names the funds shorting the Ringga"),
        op("R1B-A2","COLLABORATE","Join the Economic Council","Argue for a green industrial policy from inside.",None,-3,0.3,0.3,5,["COMPROMISED"],"Campaigner takes seat on economic council"),
        op("R1B-A3","EDUCATE","Map the Import Dependency","Show exactly where the country is exposed.",None,-1,0.0,0.2,3,["EVIDENCE_1"],"Study maps Semenanjara's hidden import risk"),
      ]))

SCEN["R1C"] = dict(
    rnd=1, var="C", kind="financial", title="The Downgrade",
    situation="A ratings agency drops Semenanjara two notches. Borrowing costs jump. A lender of last resort offers a facility, and every condition attached is a headline waiting to happen.",
    shock=dict(g=-1.39, h=-0.32, e=0, fiscal=-1),
    options=dict(
      government=[
        op("R1C-G1","REGULATE","Raise Taxes on Carbon and Wealth","Fix the revenue base. Take the political damage now.",F(-2),-6,-0.7,-0.5,4,["TAX_REFORM"],"Carbon and wealth taxes announced"),
        op("R1C-G2","DEREGULATE","Accept the Facility","Take the money. Accept the austerity conditions.",F(-1),3,0.6,-0.6,-2,["IMF_CONDITIONS"],"Government accepts facility, austerity begins"),
        op("R1C-G3","DEREGULATE","Sell State Assets","Sell the stake in NuriTenaga and plug the hole.",F(-2),4,0.5,-0.2,-4,["ASSETS_SOLD"],"State stake in NuriTenaga put up for sale"),
      ],
      business=[
        op("R1C-B1","TRANSITION","Issue a Green Bond","Raise cheap money by promising to actually spend it green.",C(2),-12,0.4,0.2,10,["GREEN_BOND"],"RG 4bn green bond oversubscribed"),
        op("R1C-B2","EXPAND","Move Capital Offshore","Protect the balance sheet. Somewhere else.",C(-3),2,-0.7,-0.5,-3,["CAPITAL_FLIGHT"],"Capital leaves as confidence falls"),
        op("R1C-B3","PARTNER","Co-Invest in Public Infrastructure","Build the rail line with the state, share the risk.",C(1),-8,0.4,0.4,6,["PPP"],"Public-private rail deal signed"),
      ],
      community=[
        op("R1C-C1","ADAPT","Accept the Austerity","Leaner years. Nobody likes it, everyone survives it.",None,-5,-0.2,-0.5,2,[],"Households brace for leaner years"),
        op("R1C-C2","DEMAND_RELIEF","General Strike","Shut the ports and the rail until they listen.",None,1,-0.5,0.5,0,["STRIKE"],"National strike halts ports and rail"),
        op("R1C-C3","SELF_ORGANISE","Community Credit Unions","If the banks won't lend, we will.",None,-3,0.3,0.4,4,["CREDIT_UNIONS"],"Credit unions fill the lending gap"),
      ],
      activist=[
        op("R1C-A1","ESCALATE","Reject the Conditions","Austerity by another name. Fight it publicly.",None,-2,-0.5,0.2,2,[],"Movement rejects 'austerity by another name'"),
        op("R1C-A2","COLLABORATE","Negotiate Green Conditionality","Rewrite the loan conditions around clean investment.",None,-4,0.2,0.3,6,["GREEN_CONDITIONS","COMPROMISED"],"Loan conditions rewritten around clean investment"),
        op("R1C-A3","EDUCATE","Publish the Debt Audit","Show the public what the debt actually bought.",None,-1,0.1,0.2,3,["EVIDENCE_1"],"Citizens' audit questions RG 30bn of debt"),
      ]))

# ============================= ROUND 2 - ENERGY =============================
SCEN["R2A"] = dict(
    rnd=2, var="A", kind="energy", title="The Gas Shock",
    situation="Global LNG prices triple. Semenanjara exports gas and subsidises it at home, so the country is somehow both richer and broker. The subsidy bill hits RG 52 billion.",
    shock=dict(g=-0.55, h=-0.44, e=0, fiscal=-1),
    options=dict(
      government=[
        op("R2A-G1","SPEND_STEER","Fast-Track Renewables and the Grid","5 GW of solar plus the transmission to carry it.",F(2),-12,0.2,0.2,10,["GRID_UPGRADED"],"Five gigawatts of solar fast-tracked"),
        op("R2A-G2","DEREGULATE","Freeze Fuel Prices","The pump price does not move. Full stop.",F(2),5,0.5,0.6,-4,["SUBSIDY_LOCK"],"Pump prices frozen as global costs soar"),
        op("R2A-G3","REGULATE","Float Prices, Targeted Cash Aid","Painful, honest, correct.",F(1),-6,-0.3,-0.5,4,["SUBSIDY_REFORM"],"Fuel prices float; cash aid for the bottom half"),
      ],
      business=[
        op("R2A-B1","TRANSITION","Solar and Storage on Every Roof","Generate our own. Never take this call again.",C(3),-13,-0.2,0.2,11,["SELF_GEN"],"Factories go off-grid with solar and storage"),
        op("R2A-B2","EXPAND","Switch to Cheap Coal","Available, legal, filthy.",C(-2),8,0.7,-0.3,-5,["BUILT_COAL"],"Industry switches to coal as gas prices bite"),
        op("R2A-B3","PARTNER","Corporate Power Purchase Agreement","Twenty-year clean power deal. Needs the state to sign.",C(1),-8,0.3,0.1,7,["PPA"],"Landmark corporate clean power deal signed"),
      ],
      community=[
        op("R2A-C1","ADAPT","National Energy Saving Pact","Everyone uses less. Nobody enjoys it.",None,-5,-0.1,-0.2,3,[],"Households cut power use by 12%"),
        op("R2A-C2","DEMAND_RELIEF","Protest the Tariff Hike","Electricity is not a luxury.",None,3,0.3,0.5,-2,["TARIFF_REVOLT"],"Tariff protests fill the capital"),
        op("R2A-C3","SELF_ORGANISE","Village Solar Cooperatives","Own the panels, own the savings.",None,-4,0.1,0.4,5,["ENERGY_COOP"],"Kampung solar cooperatives spread fast"),
      ],
      activist=[
        op("R2A-A1","ESCALATE","Blockade the Coal Terminal","Make the cheap option expensive.",None,-3,-0.5,-0.2,3,[],"Protesters blockade the coal terminal"),
        op("R2A-A2","COLLABORATE","Co-Design the Energy Roadmap","Write the plan instead of shouting at it.",None,-4,0.2,0.3,6,["COMPROMISED"],"Campaigners co-write the national energy roadmap"),
        op("R2A-A3","EDUCATE","Expose the Subsidy Bill","Show the public where the subsidy really goes.",None,-1,0.1,-0.1,3,["EVIDENCE_2"],"Top 10% take a third of the fuel subsidy"),
      ]))

SCEN["R2B"] = dict(
    rnd=2, var="B", kind="energy", title="Blackout Season",
    situation="Peak demand beats supply six evenings running. Rolling blackouts across three states. A data centre boom nobody planned for is eating 9% of the grid.",
    shock=dict(g=-0.48, h=-0.48, e=0),
    options=dict(
      government=[
        op("R2B-G1","SPEND_STEER","Emergency Solar and Battery Rollout","Three gigawatts and storage, in eighteen months.",F(2),-11,0.3,0.4,10,["GRID_UPGRADED"],"Emergency solar and storage programme launched"),
        op("R2B-G2","DEREGULATE","Fire Up the Old Coal Plants","They still work. Turn them on tonight.",F(-1),9,0.6,0.4,-5,["BUILT_COAL"],"Mothballed coal plants restarted"),
        op("R2B-G3","REGULATE","Ration Industrial Power","Industry cuts load 20%. Households keep the lights on.",F(1),-13,-0.8,-0.1,5,["POWER_RATIONING"],"Industry ordered to cut load by a fifth"),
      ],
      business=[
        op("R2B-B1","TRANSITION","Build Behind-the-Meter Renewables","Our own generation, our own certainty.",C(3),-14,-0.1,0.3,11,["SELF_GEN"],"Factories go off-grid with solar"),
        op("R2B-B2","EXPAND","Buy Diesel Generators","Loud, dirty, available on Tuesday.",C(-2),7,0.6,-0.3,-4,["DIESEL_FLEET"],"Diesel imports surge as firms self-supply"),
        op("R2B-B3","PARTNER","Demand Response Agreement","Shift our load off peak in exchange for a tariff deal.",C(1),-8,0.2,0.2,7,["DEMAND_RESPONSE"],"Industry agrees to shift load off peak"),
      ],
      community=[
        op("R2B-C1","ADAPT","Voluntary Load Shedding","Everything off at seven. It works.",None,-6,-0.1,-0.3,3,[],"Households switch off at 7pm"),
        op("R2B-C2","DEMAND_RELIEF","Demand Compensation","A rebate for every blackout hour.",None,2,0.2,0.5,-1,[],"Consumers win rebate for blackout hours"),
        op("R2B-C3","SELF_ORGANISE","Neighbourhood Microgrids","One street, one battery, no blackouts.",None,-5,0.1,0.5,5,["ENERGY_COOP"],"Kampung microgrids keep the lights on"),
      ],
      activist=[
        op("R2B-A1","ESCALATE","Occupy the Utility HQ","Sit in the lobby until someone explains the plan.",None,-3,-0.5,-0.1,3,[],"Protesters occupy NuriTenaga lobby"),
        op("R2B-A2","COLLABORATE","Join the Grid Taskforce","Help fix it rather than film it.",None,-4,0.2,0.3,6,["COMPROMISED"],"Campaigner joins national grid taskforce"),
        op("R2B-A3","EDUCATE","Publish the Data Centre Audit","Who is actually using all this power?",None,-1,0.0,0.2,3,["EVIDENCE_2"],"Audit: data centres take 9% of the grid"),
      ]))

SCEN["R2C"] = dict(
    rnd=2, var="C", kind="energy", title="The Subsidy Cliff",
    situation="The fuel subsidy now costs more than health and education combined. The Treasury says it ends this year. Every taxi driver in Kota Damai disagrees.",
    shock=dict(g=-0.33, h=-0.55, e=0, fiscal=-1),
    options=dict(
      government=[
        op("R2C-G1","REGULATE","Targeted Subsidy with Digital ID","Help reaches only those who need it. Everyone else pays.",F(2),-8,0.0,-0.1,6,["SUBSIDY_REFORM"],"Fuel aid to reach only those who need it"),
        op("R2C-G2","DEREGULATE","Keep the Blanket Subsidy","Another year. Another RG 52 billion.",F(2),6,0.5,0.7,-5,["SUBSIDY_LOCK"],"Pump prices frozen for another year"),
        op("R2C-G3","SPEND_STEER","Redirect Subsidy into Public Transport","Stop subsidising the fuel. Subsidise the alternative.",F(2),-13,0.3,0.2,11,["TRANSIT_BUILT"],"Subsidy billions shifted to rail and buses"),
      ],
      business=[
        op("R2C-B1","TRANSITION","Electrify the Fleet","Nine thousand vehicles. All of them.",C(3),-13,-0.2,0.3,10,["FLEET_EV"],"Nation's largest logistics fleet goes electric"),
        op("R2C-B2","EXPAND","Pass Costs to Consumers","Every price rises. Not our problem.",C(-2),4,0.7,-0.6,-2,["PRICE_PASS"],"Delivery and food prices climb"),
        op("R2C-B3","PARTNER","Fund a Transition Voucher Scheme","Help the drivers we depend on to switch.",C(1),-7,0.2,0.5,6,["VOUCHERS"],"Industry co-funds transport vouchers"),
      ],
      community=[
        op("R2C-C1","ADAPT","Switch to Public Transport","Slower. Cheaper. Actually fine.",None,-6,-0.1,-0.3,4,["TRANSIT_USE"],"Ridership up 30% as fuel bites"),
        op("R2C-C2","DEMAND_RELIEF","Convoy Protest","Two thousand lorries, one ring road.",None,3,-0.2,0.5,-2,["TARIFF_REVOLT"],"Lorry convoy blocks the capital"),
        op("R2C-C3","SELF_ORGANISE","Ride-Share Cooperatives","Four to a car, run by the neighbourhood.",None,-5,0.2,0.4,5,["RIDESHARE_COOP"],"Neighbourhood car-pooling takes off"),
      ],
      activist=[
        op("R2C-A1","ESCALATE","Name the Biggest Beneficiaries","Publish the list. Let people see it.",None,-3,-0.3,0.2,3,[],"Top earners take a third of fuel subsidy"),
        op("R2C-A2","COLLABORATE","Co-Design the Targeting System","Make sure it doesn't miss the people it's for.",None,-4,0.3,0.4,6,["COMPROMISED"],"Civil society helps design the new system"),
        op("R2C-A3","EDUCATE","Publish the Distributional Study","Who really gains from cheap fuel?",None,-1,0.0,0.2,3,["EVIDENCE_2"],"Study shows who really gains from cheap fuel"),
      ]))

# ============================= ROUND 3 - HEALTH =============================
SCEN["R3A"] = dict(
    rnd=3, var="A", kind="health", title="Wabak-24",
    situation="A new respiratory virus reaches Semenanjara in nine days. Hospitals hit capacity. Borders close. The economy stops.",
    shock=dict(g=-1.38, h=-0.42, e=-8),
    options=dict(
      government=[
        op("R3A-G1","SPEND_STEER","Green Strings on Every Recovery Ringga","Aid, but only to those who cut emissions.",F(2),-9,0.4,0.3,8,["GREEN_RECOVERY"],"Recovery aid tied to emissions cuts"),
        op("R3A-G2","DEREGULATE","Cash for Everyone, Immediately","Money in accounts by Friday. No conditions.",F(3),3,0.9,0.8,-2,["BIG_HANDOUT"],"Cash lands in every account by Friday"),
        op("R3A-G3","REGULATE","Hard Lockdown, Health First","Everything stops. Lives over ledgers.",F(1),-10,-1.0,-0.2,2,["HARD_LOCKDOWN"],"Nationwide lockdown declared"),
      ],
      business=[
        op("R3A-B1","TRANSITION","Keep Everyone on Payroll","Nobody loses a job on our watch.",C(3),-5,-0.4,0.7,3,["LOYAL_EMPLOYER"],"Group pledges no layoffs through the crisis"),
        op("R3A-B2","EXPAND","Pivot to Essentials, Raise Prices","Demand is inelastic. So is our pricing.",C(-3),2,0.6,-0.6,-2,["PRICE_GOUGE"],"Essential goods prices double"),
        op("R3A-B3","PARTNER","Convert Plants to Medical Supplies","Masks, oxygen, ventilators. At cost.",C(1),-4,0.4,0.5,2,["NATIONAL_SERVICE"],"Factories retooled for medical supplies"),
      ],
      community=[
        op("R3A-C1","ADAPT","Full Compliance, Stay Home","Everyone indoors. For months.",None,-7,-0.4,-0.3,2,[],"Streets empty as compliance holds"),
        op("R3A-C2","DEMAND_RELIEF","Demand Reopening","We cannot eat a lockdown.",None,4,0.6,0.4,-2,["REOPEN_PRESSURE"],"Pressure mounts to reopen the economy"),
        op("R3A-C3","SELF_ORGANISE","Mutual Aid Networks","A white flag on the gate, and a neighbour who answers.",None,-3,0.1,0.7,3,["MUTUAL_AID"],"Neighbours feed neighbours as aid networks spread"),
      ],
      activist=[
        op("R3A-A1","ESCALATE","Name the Price Gougers","Publish every doubled price.",None,-2,-0.2,0.2,2,[],"Campaign names the price gougers"),
        op("R3A-A2","COLLABORATE","Join the National Recovery Council","Fight for a green recovery from inside the room.",None,-3,0.3,0.4,5,["COMPROMISED"],"Campaigner joins national recovery council"),
        op("R3A-A3","EDUCATE","Map Clean Air and Health Data","Prove what clean air is worth in lives.",None,-1,0.0,0.2,3,["EVIDENCE_3"],"Study links clean air to 12,000 lives a year"),
      ]))

SCEN["R3B"] = dict(
    rnd=3, var="B", kind="health", title="The Long Haze",
    situation="Peat and plantation fires push the air pollution index past 300 for eleven straight days. Schools shut. Respiratory admissions triple. Half the smoke comes from across the border and half of it does not.",
    shock=dict(g=-0.66, h=-0.77, e=-3),
    options=dict(
      government=[
        op("R3B-G1","REGULATE","Transboundary Haze Act","Our companies, liable for fires anywhere.",F(1),-12,-0.4,0.5,6,["HAZE_ACT"],"Companies made liable for fires abroad"),
        op("R3B-G2","DEREGULATE","Diplomatic Protest Only","A strongly worded note. Nothing else.",F(-1),2,0.3,-0.5,-2,["DIPLOMACY_ONLY"],"Foreign ministry issues strongly worded note"),
        op("R3B-G3","SPEND_STEER","Ban Open Burning and Enforce It","Satellites, inspectors, and real prosecutions.",F(2),-10,-0.1,0.5,8,["BURN_BAN"],"Satellite enforcement of burning ban begins"),
      ],
      business=[
        op("R3B-B1","TRANSITION","Audit the Whole Supply Chain","Every concession, every supplier, published.",C(3),-13,-0.3,0.5,10,["SUPPLY_AUDIT"],"Group publishes concession-level audit"),
        op("R3B-B2","EXPAND","Deny Any Link","Our concessions are clean. Prove otherwise.",C(-2),5,0.4,-0.7,-3,["DENIAL"],"Plantation giant denies fire link"),
        op("R3B-B3","PARTNER","Fund Peatland Restoration","Rewet the peat. It stops burning when it's wet.",C(2),-10,0.1,0.5,8,["PEAT_RESTORED"],"RG 800m peatland restoration fund launched"),
      ],
      community=[
        op("R3B-C1","ADAPT","Buy Purifiers and Cope","Seal the windows and wait for the wind.",None,-2,0.2,-0.4,0,[],"Air purifier sales triple"),
        op("R3B-C2","DEMAND_RELIEF","Demand School Compensation","Eleven days of lost schooling has a price.",None,1,0.1,0.5,-1,[],"Parents win compensation for lost school days"),
        op("R3B-C3","SELF_ORGANISE","Neighbourhood Clean Air Shelters","Community halls, filters, open to everyone.",None,-3,0.1,0.6,4,["CLEAN_AIR_SHELTERS"],"Community halls become clean air refuges"),
      ],
      activist=[
        op("R3B-A1","ESCALATE","Publish the Concession Maps","Overlay the fires on the ownership records.",None,-4,-0.3,0.3,4,[],"Maps link burning to named concessions"),
        op("R3B-A2","COLLABORATE","Join the Regional Haze Panel","Slow, diplomatic, and the only thing that crosses borders.",None,-4,0.2,0.4,6,["COMPROMISED"],"Activist appointed to regional haze panel"),
        op("R3B-A3","EDUCATE","Citizen Air Sensor Network","Two thousand sensors nobody can argue with.",None,-1,0.0,0.3,3,["EVIDENCE_3","CITIZEN_SCIENCE"],"2,000 low-cost air sensors go live"),
      ]))

SCEN["R3C"] = dict(
    rnd=3, var="C", kind="health", title="Fever Season",
    situation="A record dengue and heat-illness year. Hospitals overwhelmed in the same weeks as a 38-degree heatwave. Outdoor workers are dying and nobody is counting them properly.",
    shock=dict(g=-0.65, h=-0.78, e=0),
    options=dict(
      government=[
        op("R3C-G1","SPEND_STEER","National Heat and Health Plan","Cooling centres, warning system, hospital surge capacity.",F(2),-9,0.2,0.6,8,["HEAT_PLAN"],"First national heat-health plan launched"),
        op("R3C-G2","DEREGULATE","Emergency Hospital Funding Only","Treat the sick. Leave the causes for later.",F(1),1,0.3,0.2,-1,[],"Extra beds funded, causes left untouched"),
        op("R3C-G3","REGULATE","Mandatory Outdoor Work Rules","No outdoor work above 36 degrees. Enforced.",F(1),-11,-0.6,0.4,5,["WORK_RULES"],"Outdoor work banned above 36 degrees"),
      ],
      business=[
        op("R3C-B1","TRANSITION","Shade, Water and Shifted Hours","Rebuild every site around the heat.",C(2),-8,-0.2,0.7,6,["WORKER_CARE"],"Group shifts outdoor work to dawn"),
        op("R3C-B2","EXPAND","Push Back on Work Rules","Warn that the rules will cost jobs.",C(-2),5,0.6,-0.6,-3,["LOBBIED_RULES"],"Industry warns work rules will cost jobs"),
        op("R3C-B3","PARTNER","Fund the Urban Cooling Programme","Trees, white roofs, shaded walkways.",C(2),-11,0.1,0.5,8,["URBAN_COOLING"],"Corporate fund to cool the city centre"),
      ],
      community=[
        op("R3C-C1","ADAPT","Community Fogging and Clean-Up","Every weekend, every drain.",None,-4,-0.1,-0.1,2,[],"Weekend clean-ups cut breeding sites"),
        op("R3C-C2","DEMAND_RELIEF","Demand Free Healthcare Expansion","Nobody should pay to survive a heatwave.",None,2,0.1,0.6,-1,[],"Public demands universal free treatment"),
        op("R3C-C3","SELF_ORGANISE","Plant the Neighbourhood Canopy","Three hundred thousand trees, street by street.",None,-5,0.1,0.5,5,["CANOPY"],"300,000 trees planted street by street"),
      ],
      activist=[
        op("R3C-A1","ESCALATE","Publish the Heat Death Count","Six hundred deaths nobody recorded.",None,-3,-0.3,0.2,3,[],"Investigation: 600 heat deaths uncounted"),
        op("R3C-A2","COLLABORATE","Join the Health Adaptation Board","Write the standards instead of protesting them.",None,-4,0.2,0.4,6,["COMPROMISED"],"Campaigner joins health adaptation board"),
        op("R3C-A3","EDUCATE","Train Community Health Volunteers","Five thousand people who know the warning signs.",None,-1,0.1,0.3,3,["EVIDENCE_3","CITIZEN_SCIENCE"],"5,000 volunteers trained in heat first aid"),
      ]))

# ============================ ROUND 4 - ELECTION ============================
SCEN["R4A"] = dict(
    rnd=4, var="A", kind="election", title="The General Election",
    situation="Parliament dissolves. Eleven days of campaigning. Every choice made in the last three rounds is now a poster, a meme, or a scandal.",
    shock=dict(g=-0.09, h=-0.17, e=0),
    options=dict(
      government=[
        op("R4A-G1","SPEND_STEER","Run on the Green Manifesto","Stake the whole campaign on the transition.",F(2),-12,0.3,0.5,12,["GREEN_MANDATE"],"Minister stakes election on green manifesto",gate_trust=3),
        op("R4A-G2","DEREGULATE","Promise Cheap Everything","Fuel, food, electricity. Frozen. Guaranteed.",F(3),6,0.7,0.9,-5,["POPULIST_PLEDGE"],"Government promises to freeze the cost of living"),
        op("R4A-G3","DEREGULATE","Quiet Campaign, Keep the Lights On","Promise nothing. Survive.",F(1),-3,0.2,0.0,2,[],"A quiet campaign, and a quiet result"),
      ],
      business=[
        op("R4A-B1","PARTNER","Fund the Green Coalition","Put our money behind the transition candidates.",C(2),-6,0.2,0.2,6,["POLITICAL_ALLY"],"Business backs the green coalition"),
        op("R4A-B2","EXPAND","Fund Whoever Protects Us","Buy the policy environment we need.",C(-2),4,0.5,-0.3,-4,["REGULATORY_CAPTURE"],"Donations flow to the anti-regulation bloc"),
        op("R4A-B3","TRANSITION","Stay Neutral, Publish the Transition Plan","No donations. Just a credible plan, in public.",C(1),-7,0.1,0.3,6,["TRANSPARENT"],"Group publishes its full transition plan"),
      ],
      community=[
        op("R4A-C1","ADAPT","Vote for the Long Term","Accept short-term cost for a liveable country.",None,-5,-0.2,0.0,5,["LONGTERM_MANDATE"],"Voters choose the long game"),
        op("R4A-C2","DEMAND_RELIEF","Vote for My Wallet","The bills are due now. The sea level is not.",None,3,0.5,0.6,-3,["WALLET_MANDATE"],"It was the cost of living, say voters"),
        op("R4A-C3","SELF_ORGANISE","Field Independent Local Candidates","If none of them represent us, we'll stand ourselves.",None,-3,0.0,0.5,4,["LOCAL_POWER"],"Independents take eleven seats"),
      ],
      activist=[
        op("R4A-A1","ESCALATE","Score Every Candidate, Name and Shame","A climate scorecard for all 222 seats.",None,-3,-0.2,0.1,4,[],"Climate scorecard published for every seat"),
        op("R4A-A2","COLLABORATE","Negotiate Manifesto Commitments","Trade our endorsement for binding pledges.",None,-5,0.2,0.3,7,["MANIFESTO_DEAL","COMPROMISED"],"Endorsement traded for binding climate pledges"),
        op("R4A-A3","EDUCATE","Get Out the Youth Vote","Register everyone under thirty.",None,-2,0.1,0.4,4,["YOUTH_WAVE"],"Youth turnout jumps 19 points"),
      ]))

SCEN["R4B"] = dict(
    rnd=4, var="B", kind="election", title="The Perindu By-Election",
    situation="One industrial seat. A refinery town where 8,000 jobs depend on the thing everyone says must close. The whole country is watching a constituency of 41,000 people.",
    shock=dict(g=-0.09, h=-0.17, e=0),
    options=dict(
      government=[
        op("R4B-G1","SPEND_STEER","Announce a Just Transition Fund","RG 2bn. No worker left behind, in writing.",F(2),-11,0.3,0.6,11,["GREEN_MANDATE","JUST_TRANSITION"],"RG 2bn fund promises no worker left behind",gate_trust=3),
        op("R4B-G2","DEREGULATE","Guarantee the Refinery Stays Open","Say the words the town wants to hear.",F(2),6,0.6,0.7,-5,["POPULIST_PLEDGE"],"Minister: 'The refinery is not closing'"),
        op("R4B-G3","DEREGULATE","Say Nothing and Hope","Let the local candidate carry it.",F(-1),0,0.1,-0.3,0,[],"Government silent as Perindu votes"),
      ],
      business=[
        op("R4B-B1","TRANSITION","Commit to Retraining Every Worker","Eight thousand people, guaranteed a next job.",C(3),-10,0.2,0.7,9,["RETRAIN_PLEDGE"],"Every refinery worker guaranteed a new job"),
        op("R4B-B2","EXPAND","Threaten Closure If Regulated","Make the cost of regulating us politically fatal.",C(-2),4,0.4,-0.6,-4,["REGULATORY_CAPTURE"],"Group warns: regulate us and we leave"),
        op("R4B-B3","PARTNER","Announce a Green Industrial Park","Same site, same workers, different century.",C(2),-9,0.4,0.5,8,["GREEN_PARK","TRANSPARENT"],"Perindu to host the region's first green park"),
      ],
      community=[
        op("R4B-C1","ADAPT","Vote on the Climate Issue","The refinery poisoned this town for forty years.",None,-5,-0.2,0.0,5,["LONGTERM_MANDATE"],"Perindu votes for the long term"),
        op("R4B-C2","DEMAND_RELIEF","Vote on Jobs","Eight thousand paycheques beat any manifesto.",None,3,0.5,0.6,-3,["WALLET_MANDATE"],"It was the jobs, says Perindu"),
        op("R4B-C3","SELF_ORGANISE","Organise a Workers' Assembly","The workers write the transition plan themselves.",None,-3,0.1,0.5,4,["WORKER_POWER","LOCAL_POWER"],"Workers write their own transition plan"),
      ],
      activist=[
        op("R4B-A1","ESCALATE","Campaign on the Ground","Twenty thousand doors in eleven days.",None,-3,-0.2,0.1,4,[],"Movement knocks on 20,000 doors"),
        op("R4B-A2","COLLABORATE","Broker a Worker-Green Alliance","Unions and greens, in one room, finally.",None,-6,0.2,0.5,8,["MANIFESTO_DEAL","COMPROMISED"],"Unions and greens sign historic pact"),
        op("R4B-A3","EDUCATE","Publish the Just Transition Costing","Show that keeping it open costs more.",None,-2,0.1,0.3,4,["YOUTH_WAVE"],"Costing: transition cheaper than closure"),
      ]))

SCEN["R4C"] = dict(
    rnd=4, var="C", kind="election", title="The Coalition Wobble",
    situation="Four MPs cross the floor at 11pm. The government survives by two votes. Nothing can pass without buying somebody, and everyone knows it.",
    shock=dict(g=-0.14, h=-0.14, e=0),
    options=dict(
      government=[
        op("R4C-G1","SPEND_STEER","Buy Support with Green Investment","Win the rebels back with clean projects in their seats.",F(3),-12,0.2,0.4,12,["GREEN_MANDATE"],"Rebels won over with clean investment",gate_trust=3),
        op("R4C-G2","DEREGULATE","Buy Support with Contracts","The old way. It works.",F(3),6,0.6,-0.2,-5,["POPULIST_PLEDGE","PATRONAGE"],"Contracts flow to the seats that mattered"),
        op("R4C-G3","DEREGULATE","Call a Confidence Vote","Gamble everything on one afternoon.",F(-1),0,-0.3,0.2,1,[],"Minister gambles on a confidence vote"),
      ],
      business=[
        op("R4C-B1","PARTNER","Publicly Demand Policy Certainty","Tell them plainly: we cannot invest in chaos.",C(1),-8,0.3,0.3,7,["TRANSPARENT"],"CEOs demand a climate law they can plan around"),
        op("R4C-B2","EXPAND","Back Stability at Any Price","Whoever governs, we fund.",C(-2),4,0.6,-0.2,-3,["REGULATORY_CAPTURE"],"Business backs whoever can govern"),
        op("R4C-B3","EXPAND","Lobby the Defectors","Four people. Four conversations.",C(-1),3,0.3,-0.5,-3,["LOBBY_SCANDAL"],"Leaked messages show lobbying of defectors"),
      ],
      community=[
        op("R4C-C1","ADAPT","Accept the Deal for Stability","Just let them govern.",None,-4,0.3,-0.2,3,[],"Public shrugs: 'Just let them govern'"),
        op("R4C-C2","DEMAND_RELIEF","Demand a Fresh Election","A million signatures in nine days.",None,1,-0.3,0.4,0,[],"Petition for fresh elections passes a million"),
        op("R4C-C3","SELF_ORGANISE","Petition for a Fixed Climate Law","Something no coalition can undo.",None,-5,0.0,0.5,6,["LOCAL_POWER","CLIMATE_LAW_PUSH"],"Citizens' petition demands a binding climate act"),
      ],
      activist=[
        op("R4C-A1","ESCALATE","Occupy Parliament Square","Tents until they commit.",None,-3,-0.4,0.0,4,[],"Tents go up outside parliament"),
        op("R4C-A2","COLLABORATE","Extract Cross-Party Commitments","Every faction signs, or none of them govern.",None,-6,0.2,0.4,8,["MANIFESTO_DEAL","COMPROMISED"],"All sides sign a climate commitment"),
        op("R4C-A3","EDUCATE","Publish the Lobbying Register","Who met whom, and when.",None,-2,0.0,0.3,4,["YOUTH_WAVE"],"First public register of who met whom"),
      ]))

# =========================== ROUND 5 - POLLUTION ============================
SCEN["R5A"] = dict(
    rnd=5, var="A", kind="pollution", title="The Poisoned Reservoir",
    situation="At 3am a tanker discharges solvent waste into Sungai Jernih. By dawn the treatment plants are shut. Four million people have no water for six days.",
    shock=dict(g=-0.34, h=-0.59, e=0),
    options=dict(
      government=[
        op("R5A-G1","SPEND_STEER","Emergency Clean-Up plus a New Water Act","Fix the river and change the law in the same week.",F(2),-8,-0.2,0.6,7,["WATER_LAW"],"Emergency clean-up and landmark Water Act",block_flag="POPULIST_PLEDGE"),
        op("R5A-G2","DEREGULATE","Blame, Fine, Move On","Name a company. Issue a fine. Change the subject.",F(0),1,0.2,-0.2,0,["COVER_UP"],"Operator fined RG 2m, case closed"),
        op("R5A-G3","REGULATE","Nationalise the Water Utility","Water is not a business.",F(3),-5,-0.4,0.7,5,["WATER_PUBLIC","WATER_LAW"],"State takes back the water utility"),
      ],
      business=[
        op("R5A-B1","TRANSITION","Own It and Pay for Full Restoration","Before anyone asks. Every Ringga of it.",C(3),-9,-0.5,0.8,8,["ACCOUNTABLE"],"Company pays before it is asked to"),
        op("R5A-B2","EXPAND","Deny and Litigate","Our discharge was within permit. See you in court.",C(-1),3,0.3,-0.8,-3,["DENIAL"],"Firm denies liability, heads to court"),
        op("R5A-B3","PARTNER","Lead an Industry-Wide Discharge Standard","Every plant on the river, one standard, monitored.",C(2),-10,-0.1,0.4,8,["INDUSTRY_PACT"],"Industry adopts a shared discharge standard"),
      ],
      community=[
        op("R5A-C1","ADAPT","Ration and Endure","Buckets, tankers, and six days of queuing.",None,-3,-0.1,-0.4,1,[],"Six days of queuing for water"),
        op("R5A-C2","DEMAND_RELIEF","Class Action and Street Protest","Four million plaintiffs.",None,-1,-0.3,0.3,3,["LAWSUIT"],"Four million join the class action"),
        op("R5A-C3","SELF_ORGANISE","Citizen River Watch","Two thousand volunteers. Every outfall photographed.",None,-4,0.0,0.6,5,["RIVER_WATCH"],"Volunteers begin watching every outfall"),
      ],
      activist=[
        op("R5A-A1","ESCALATE","Leak the Discharge Records","Eight years of records nobody was meant to see.",None,-5,-0.4,0.2,5,[],"Leaked records show years of illegal discharge",boost_flag="EVIDENCE_3"),
        op("R5A-A2","COLLABORATE","Broker the Clean Water Accord","Get everyone in a room and don't leave until it's signed.",None,-6,0.1,0.5,7,["COMPROMISED"],"Clean Water Accord signed by all parties"),
        op("R5A-A3","EDUCATE","Train Citizen Scientists","Give people the kit to test their own water.",None,-2,0.0,0.3,4,["CITIZEN_SCIENCE"],"Citizens trained to test their own water"),
      ]))

SCEN["R5B"] = dict(
    rnd=5, var="B", kind="pollution", title="The Landfill Fire",
    situation="An illegal plastic and e-waste dump burns for nine days. Dioxin readings beside a primary school. The containers were imported legally, under a code nobody bothered to read.",
    shock=dict(g=-0.31, h=-0.61, e=0),
    options=dict(
      government=[
        op("R5B-G1","REGULATE","Ban Waste Imports and Enforce","Close the border to other countries' rubbish.",F(1),-11,-0.4,0.6,7,["WASTE_LAW"],"Border closed to foreign plastic waste",block_flag="POPULIST_PLEDGE"),
        op("R5B-G2","DEREGULATE","Fine the Operator Only","One company, one fine, done.",F(0),1,0.2,-0.3,0,["COVER_UP"],"Operator fined, case closed"),
        op("R5B-G3","SPEND_STEER","National Recycling Infrastructure","Twelve regional plants. Build the thing we lack.",F(2),-9,0.2,0.5,9,["RECYCLING_BUILT"],"Twelve regional recycling plants announced"),
      ],
      business=[
        op("R5B-B1","TRANSITION","Take Back Our Own Packaging","We made it. We collect it.",C(3),-10,-0.3,0.7,9,["ACCOUNTABLE"],"Producer take-back scheme launched"),
        op("R5B-B2","EXPAND","Blame the Importers","Not our waste. Not our problem.",C(-1),3,0.3,-0.7,-3,["DENIAL"],"Industry: 'Not our waste, not our problem'"),
        op("R5B-B3","PARTNER","Build a Domestic Recycling Plant","Turn the problem into a business.",C(2),-11,0.1,0.4,8,["INDUSTRY_PACT"],"First large-scale domestic recycler breaks ground"),
      ],
      community=[
        op("R5B-C1","ADAPT","Separate Waste at Source","Three bins in every kitchen.",None,-4,-0.1,-0.2,3,[],"Household separation becomes the norm"),
        op("R5B-C2","DEMAND_RELIEF","Blockade the Landfill Road","Not one more lorry.",None,-1,-0.3,0.4,3,["LAWSUIT"],"Residents block every lorry into the dump"),
        op("R5B-C3","SELF_ORGANISE","Neighbourhood Zero-Waste Scheme","Cut what we send by seventy percent.",None,-5,0.0,0.6,5,["CITIZEN_MONITORING"],"Zero-waste kampung cuts landfill by 70%"),
      ],
      activist=[
        op("R5B-A1","ESCALATE","Trace the Containers","Follow every container back to its port of origin.",None,-5,-0.4,0.3,5,[],"Investigation traces waste to three countries",boost_flag="EVIDENCE_3"),
        op("R5B-A2","COLLABORATE","Join the Waste Policy Review","Co-chair the review that rewrites the code.",None,-6,0.1,0.5,7,["COMPROMISED"],"Campaigner co-chairs waste policy review"),
        op("R5B-A3","EDUCATE","Run School Air Quality Testing","Children's data is hard to ignore.",None,-2,0.0,0.3,4,["CITIZEN_SCIENCE"],"Children's air data forces a response"),
      ]))

SCEN["R5C"] = dict(
    rnd=5, var="C", kind="pollution", title="The Dead Coast",
    situation="An effluent plume kills the fisheries off Pulau Manis. Twelve resorts cancel their season. Three thousand fishing families have no income and no proof of who did it.",
    shock=dict(g=-0.4, h=-0.56, e=0),
    options=dict(
      government=[
        op("R5C-G1","SPEND_STEER","Marine Protection Zone and Compensation","A new marine park and RG 400m for the families.",F(2),-8,-0.2,0.7,7,["MARINE_LAW"],"New marine park and RG 400m in compensation",block_flag="POPULIST_PLEDGE"),
        op("R5C-G2","DEREGULATE","Reopen the Beaches Quickly","The season is worth more than the argument.",F(-1),2,0.4,-0.4,-2,["COVER_UP"],"Beaches declared safe; scientists disagree"),
        op("R5C-G3","REGULATE","Mandatory Effluent Monitoring for All","Every coastal outfall, live, public.",F(1),-12,-0.4,0.5,7,["MONITORING_LAW"],"Every coastal outfall to be monitored live"),
      ],
      business=[
        op("R5C-B1","TRANSITION","Fund the Fishermen and Fix the Outfall","Pay first, argue never.",C(3),-9,-0.4,0.8,8,["ACCOUNTABLE"],"Company pays fishing families within a week"),
        op("R5C-B2","EXPAND","Dispute the Science","Our experts disagree with their experts.",C(-1),3,0.3,-0.8,-3,["DENIAL"],"Firm's experts dispute the plume findings"),
        op("R5C-B3","PARTNER","Finance a Coastal Restoration Bond","RG 1bn, repaid by the tourism that comes back.",C(2),-11,0.1,0.5,8,["INDUSTRY_PACT"],"RG 1bn coastal restoration bond issued"),
      ],
      community=[
        op("R5C-C1","ADAPT","Accept Compensation and Move On","Take the payout. Find other work.",None,-3,0.1,-0.3,1,[],"Families take the payout and go quiet"),
        op("R5C-C2","DEMAND_RELIEF","Occupy the Jetty","Three hundred boats across the shipping lane.",None,-1,-0.4,0.4,3,["LAWSUIT"],"Fishing boats blockade the industrial jetty"),
        op("R5C-C3","SELF_ORGANISE","Community-Run Marine Monitoring","The fishermen become the early warning system.",None,-4,0.0,0.6,5,["CITIZEN_MONITORING"],"Fishermen become the coast's early warning"),
      ],
      activist=[
        op("R5C-A1","ESCALATE","Publish the Plume Modelling","Independent science, pinpointing the outfall.",None,-5,-0.4,0.2,5,[],"Independent model pinpoints the source",boost_flag="EVIDENCE_3"),
        op("R5C-A2","COLLABORATE","Negotiate the Coastal Accord","Industry, villages, and the state, on one page.",None,-6,0.1,0.5,7,["COMPROMISED"],"Coastal accord signed by industry and villages"),
        op("R5C-A3","EDUCATE","Train the Fishing Communities","Teach three thousand people to test their own water.",None,-2,0.0,0.4,4,["CITIZEN_SCIENCE"],"Fishermen trained to test their own water"),
      ]))

# =========================== ROUND 6 - DISASTER =============================
SCEN["R6A"] = dict(
    rnd=6, var="A", kind="disaster", title="The Great Monsoon Flood",
    situation="Four days of continuous rain. Eight states under water. 90,000 displaced, 43 dead, RG 12 billion in damage. The rescue boats are mostly private, mostly volunteer, mostly late.",
    shock=dict(g=-1.16, h=-0.77, e=0),
    options=dict(
      government=[
        op("R6A-G1","SPEND_STEER","National Resilience Plan","Flood defences, early warning, rebuilt drainage.",F(2),-10,0.4,0.8,9,[],"National resilience plan announced"),
        op("R6A-G2","DEREGULATE","Emergency Payouts Only","Money now. Questions never.",F(2),2,0.5,0.5,-2,[],"Emergency payouts reach flood victims"),
        op("R6A-G3","REGULATE","Declare a Climate Emergency","A binding 2050 law, passed in a week.",F(3),-16,-0.3,0.3,14,["CLIMATE_LAW"],"Parliament declares a climate emergency",gate_trust=2,boost_flag="GREEN_MANDATE"),
      ],
      business=[
        op("R6A-B1","TRANSITION","Fund the Rebuild, Build Back Green","Rebuild it better than it was.",C(3),-12,0.3,0.8,10,[],"Industry funds a green rebuild"),
        op("R6A-B2","EXPAND","Claim the Insurance and Relocate","This country is becoming uninsurable.",C(-2),3,-0.6,-0.7,-4,[],"Major employer announces offshore move"),
        op("R6A-B3","PARTNER","Restore the Mangroves and Catchment","Nature does flood defence cheaper than concrete.",C(2),-9,0.1,0.6,8,[],"Mangrove and catchment restoration funded"),
      ],
      community=[
        op("R6A-C1","ADAPT","Rebuild Exactly Where We Were","This is home. It has always flooded.",None,2,0.3,0.2,-1,[],"Families rebuild on the same ground"),
        op("R6A-C2","DEMAND_RELIEF","Managed Relocation to Safer Ground","Leave the floodplain. It will not stop.",None,-5,-0.3,-0.2,5,[],"Twelve villages agree to relocate"),
        op("R6A-C3","SELF_ORGANISE","The Community Flood Corps","Trained volunteers, boats, radios, in every district.",None,-4,0.2,0.8,5,[],"Volunteer flood corps rescues 4,000"),
      ],
      activist=[
        op("R6A-A1","ESCALATE","Sue the State for Climate Negligence","Make the failure legally binding.",None,-6,-0.5,-0.1,6,[],"Landmark climate negligence case filed"),
        op("R6A-A2","COLLABORATE","Sign the 2050 National Accord","Everyone at one table, one signature.",None,-8,0.3,0.6,9,["COMPROMISED"],"2050 National Accord signed"),
        op("R6A-A3","EDUCATE","Hand Over the Roadmap","Ten years of work, given away for free.",None,-4,0.2,0.4,7,[],"Movement hands its roadmap to government",boost_evidence=True),
      ]))

SCEN["R6B"] = dict(
    rnd=6, var="B", kind="disaster", title="The Long Dry",
    situation="Nine months without meaningful rain. Reservoirs at 21%. Rationing in four states, hydro output halved, and a rice harvest that simply did not happen.",
    shock=dict(g=-1.16, h=-0.77, e=0),
    options=dict(
      government=[
        op("R6B-G1","SPEND_STEER","National Water Security Programme","Pipes, storage, leak repair, and a plan that lasts.",F(2),-10,0.4,0.8,9,[],"Nationwide water security programme begins"),
        op("R6B-G2","DEREGULATE","Cloud Seeding and Emergency Imports","Fly the planes. Buy the rice.",F(2),2,0.4,0.5,-2,[],"Planes seed clouds as reservoirs fall"),
        op("R6B-G3","REGULATE","Permanent Water Pricing Reform","Price water like it matters. Because it does.",F(3),-16,-0.4,0.3,14,["CLIMATE_LAW"],"Water priced properly for the first time",gate_trust=2,boost_flag="GREEN_MANDATE"),
      ],
      business=[
        op("R6B-B1","TRANSITION","Cut Industrial Water Use by Half","Nine weeks. Every plant.",C(3),-12,0.2,0.8,10,[],"Industry halves its water draw in nine weeks"),
        op("R6B-B2","EXPAND","Buy Priority Water Access","We can outbid a rice farmer.",C(-2),3,-0.5,-0.8,-4,[],"Firms outbid farmers for what's left"),
        op("R6B-B3","PARTNER","Fund Catchment Reforestation","Half a million hectares. It rains where forests are.",C(2),-9,0.1,0.6,8,[],"Half a million hectares to be replanted"),
      ],
      community=[
        op("R6B-C1","ADAPT","Strict Household Rationing","Two hours of water a day, and no complaints.",None,-4,-0.3,-0.2,4,[],"Two hours of water a day, and no complaints"),
        op("R6B-C2","DEMAND_RELIEF","Protest the Industrial Allocation","Why do they have water and we don't?",None,1,-0.3,0.4,2,[],"Farmers march on the water authority"),
        op("R6B-C3","SELF_ORGANISE","Rainwater Harvesting Everywhere","A tank on every roof in ninety days.",None,-4,0.2,0.8,5,[],"A tank on every roof in ninety days"),
      ],
      activist=[
        op("R6B-A1","ESCALATE","Expose Who Gets the Water","Forty percent goes to twelve companies.",None,-6,-0.5,-0.1,6,[],"Data shows 40% of water goes to 12 firms"),
        op("R6B-A2","COLLABORATE","Join the Water Allocation Council","Rewrite the rules from inside.",None,-8,0.3,0.6,9,["COMPROMISED"],"Allocation council rewrites the rules"),
        op("R6B-A3","EDUCATE","Publish the Basin Recovery Plan","A way back, costed and ready.",None,-4,0.2,0.4,7,[],"Basin recovery plan offers a way back",boost_evidence=True),
      ]))

SCEN["R6C"] = dict(
    rnd=6, var="C", kind="disaster", title="The Hillside",
    situation="After three days of rain a hillside above a new township gives way. Thirty-one dead. The development approval was signed four years ago by someone who is in this room.",
    shock=dict(g=-1.16, h=-0.77, e=0),
    options=dict(
      government=[
        op("R6C-G1","SPEND_STEER","Halt Hillside Development and Review","Every approval frozen. Every slope re-surveyed.",F(2),-10,0.4,0.8,9,[],"Every hillside approval frozen"),
        op("R6C-G2","DEREGULATE","Compensate Victims and Continue","Pay the families. Keep building.",F(2),2,0.5,0.5,-2,[],"Compensation paid, projects continue"),
        op("R6C-G3","REGULATE","National Land Use and Slope Law","The law we should have passed a decade ago.",F(3),-16,-0.3,0.3,14,["CLIMATE_LAW"],"Landmark land use act passes in a week",gate_trust=2,boost_flag="GREEN_MANDATE"),
      ],
      business=[
        op("R6C-B1","TRANSITION","Full Compensation and Independent Audit","Open the books. All of them.",C(3),-12,0.3,0.8,10,[],"Developer opens its books to independent audit"),
        op("R6C-B2","EXPAND","Defend the Approval Process","Every approval was lawful.",C(-2),3,-0.6,-0.7,-4,[],"'Every approval was lawful,' says developer"),
        op("R6C-B3","PARTNER","Fund Nationwide Slope Stabilisation","Fix the eight hundred slopes like this one.",C(2),-9,0.1,0.6,8,[],"Industry funds slope works across eight states"),
      ],
      community=[
        op("R6C-C1","ADAPT","Accept Resettlement","New homes, flat ground, no view.",None,-5,-0.3,-0.2,5,[],"Families accept new homes on flat ground"),
        op("R6C-C2","DEMAND_RELIEF","Occupy the Development Site","Nobody builds above us again.",None,1,-0.3,0.4,1,[],"Residents occupy the site above their homes"),
        op("R6C-C3","SELF_ORGANISE","Community Hazard Mapping","Map every dangerous slope in the country.",None,-4,0.2,0.8,5,[],"Volunteers map every dangerous slope"),
      ],
      activist=[
        op("R6C-A1","ESCALATE","Publish the Approval Documents","Every signature, every date.",None,-6,-0.5,-0.1,6,[],"Approval documents published in full"),
        op("R6C-A2","COLLABORATE","Co-Write the New Planning Code","Build the rules that stop the next one.",None,-8,0.3,0.6,9,["COMPROMISED"],"New planning code written with civil society"),
        op("R6C-A3","EDUCATE","Train Community Slope Monitors","People who can see it coming.",None,-4,0.2,0.4,7,[],"Communities trained to monitor their own slopes",boost_evidence=True),
      ]))

ROUND_VARIANTS = {r: [f"R{r}{v}" for v in "ABC"] for r in range(1, 7)}
