const createPlaceholderDataUri = (name = 'SafeHer') => {
  const initials = String(name || 'SafeHer')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" fill="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7c3aed"/>
          <stop offset="100%" stop-color="#ec4899"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="128" fill="url(#g)"/>
      <circle cx="128" cy="104" r="46" fill="rgba(15,23,42,0.2)"/>
      <path d="M62 210c14-34 42-52 66-52s52 18 66 52" fill="rgba(15,23,42,0.2)"/>
      <text x="128" y="138" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="700" fill="#ffffff">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const getAvatarSrc = (avatarUrl, name) => {
  if (!avatarUrl || avatarUrl.includes('default-avatar.png')) {
    return createPlaceholderDataUri(name);
  }

  return avatarUrl;
};
