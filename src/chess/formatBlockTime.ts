export function formatBlockTime(num_blocks?: number, s_per_block = 6): string {
  if (!num_blocks && num_blocks !== 0) {
    return "none";
  }
  let out = [];
  let seconds = num_blocks * s_per_block;
  if (seconds > 86400) {
    const days = Math.round(seconds / 86400);
    seconds = seconds % 86400;
    out.push(`${days}d`);
  }
  if (seconds > 3600) {
    const hours = Math.round(seconds / 3600);
    seconds = seconds % 3600;
    out.push(`${hours}h`);
  }
  if (seconds > 60) {
    const minutes = Math.round(seconds / 60);
    seconds = seconds % 60;
    out.push(`${minutes}m`);
  }
  if ((out.length < 2 && seconds > 0) || out.length === 0) {
    seconds = Math.round(seconds);
    out.push(`${seconds}s`);
  }
  return `${num_blocks} (~${out.join("")})`;
}
