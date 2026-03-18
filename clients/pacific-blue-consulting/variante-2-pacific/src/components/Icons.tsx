type IconProps = {
  className?: string;
};

export function PlaneIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 19l-3-3m0 0l-7-4 18-8-8 18-3-7zm0 0l3-3" />
    </svg>
  );
}

export function BuildingIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

export function LeafIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M5 21c.5-4.5 2.5-8 7-10m0 0c-4.5-2-8-2.5-10-7C6.5 5.5 10 3 17 3c0 7-2.5 10.5-7 14.5" />
      <path d="M12 11c1.5 1.5 3 3 4.5 5" />
    </svg>
  );
}

export function ChartIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

export function CompassIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </svg>
  );
}

export function UsersIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

export function getIcon(name: string, className?: string) {
  const props = { className };
  switch (name) {
    case "plane":
      return <PlaneIcon {...props} />;
    case "building":
      return <BuildingIcon {...props} />;
    case "leaf":
      return <LeafIcon {...props} />;
    case "chart":
      return <ChartIcon {...props} />;
    case "compass":
      return <CompassIcon {...props} />;
    case "users":
      return <UsersIcon {...props} />;
    default:
      return <PlaneIcon {...props} />;
  }
}
