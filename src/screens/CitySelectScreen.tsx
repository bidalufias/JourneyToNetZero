import { cityArchetypes } from "../data";
import { IndicatorBar } from "../components/IndicatorBar";
import { useGameStore } from "../store/useGameStore";

const indicatorLabels = {
  economy: "Economy",
  emissions: "Emissions",
  trust: "Trust",
  equity: "Equity",
  resilience: "Resilience",
  energySecurity: "Energy Security",
} as const;

export function CitySelectScreen() {
  const setupCity = useGameStore((state) => state.setupCity);

  return (
    <section className="screen city-select-screen">
      <header>
        <p className="eyebrow">City Archetype</p>
        <h2>Choose your city</h2>
        <p>Pick a starting condition. You can also let fate decide.</p>
      </header>

      <div className="city-grid">
        {cityArchetypes.map((city) => (
          <article className="wc-card city-card" key={city.id}>
            <h3>{city.title}</h3>
            <p>{city.description}</p>
            <div className="city-card__bars">
              {Object.entries(city.indicators).map(([key, value]) => (
                <IndicatorBar key={key} label={indicatorLabels[key as keyof typeof indicatorLabels]} value={value} />
              ))}
            </div>
            <button className="wc-button" type="button" onClick={() => setupCity(city.id)}>
              Select City
            </button>
          </article>
        ))}

        <article className="wc-card city-card city-card--random" key="random-city">
          <h3>Wildcard Start</h3>
          <p>Randomly assign one of the city archetypes.</p>
          <button
            className="wc-button"
            type="button"
            onClick={() => {
              const randomIndex = Math.floor(Math.random() * cityArchetypes.length);
              setupCity(cityArchetypes[randomIndex].id);
            }}
          >
            Random City
          </button>
        </article>
      </div>
    </section>
  );
}
