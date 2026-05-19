export const createInviteLink = (origin: string, token: string) => {
  const safeOrigin = origin.replace(/\/$/, "");

  return `${safeOrigin}/invite/${token}`;
};
