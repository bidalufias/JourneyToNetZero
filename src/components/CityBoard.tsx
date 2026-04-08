type CityBoardProps = {
  cityTitle: string;
  round: number;
  eventTitle?: string;
  eventDescription?: string;
  friction: number;
};

export function CityBoard({ cityTitle, round, eventTitle, eventDescription, friction }: CityBoardProps) {
  return (
    <article className="city-board wc-card">
      <div className="city-board__header">
        <p className="eyebrow">{cityTitle}</p>
        <h3>City Board</h3>
      </div>
      <div className="city-board__map" aria-hidden="true">
        <span className="city-node city-node--a" />
        <span className="city-node city-node--b" />
        <span className="city-node city-node--c" />
      </div>
      <div className="city-board__brief">
        <p>
          Round {round}: <strong>{eventTitle}</strong>
        </p>
        <p>{eventDescription}</p>
      </div>
      <div className="friction-meter">
        <span>Friction</span>
        <strong>{friction} / 5</strong>
      </div>
    </article>
  );
}
