type WildcardBannerProps = {
  title: string;
  description: string;
};

export function WildcardBanner({ title, description }: WildcardBannerProps) {
  return (
    <div className="wildcard-banner">
      <strong>Wildcard: {title}</strong>
      <span>{description}</span>
    </div>
  );
}
