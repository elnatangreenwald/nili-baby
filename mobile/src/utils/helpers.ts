export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return `${formatDate(d)} ${formatTime(d)}`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays === 1) return 'אתמול';
  return formatDate(d);
}

export function getTimeUntil(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'עכשיו';
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;

  if (diffHours === 0) return `עוד ${diffMins} דקות`;
  if (remainingMins === 0) return `עוד ${diffHours} שעות`;
  return `עוד ${diffHours} שעות ו-${remainingMins} דקות`;
}

export function calculateAge(birthDate: Date | string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffDays < 7) return `${diffDays} ימים`;
  if (diffWeeks < 8) return `${diffWeeks} שבועות`;
  return `${diffMonths} חודשים`;
}
