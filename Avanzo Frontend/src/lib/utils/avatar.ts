/**
 * Returns the correct avatar image URL for a user based on their gender.
 *
 * Priority:
 *  1. Existing profile image URL from the backend (if provided and non-empty)
 *  2. Local male/female PNG asset based on the normalised gender field
 *  3. Fallback to the neutral avatar PNG
 *
 * Uses Vite's `new URL(..., import.meta.url)` so the assets are resolved
 * correctly in both dev and production builds.
 */

const maleAvatarUrl = new URL("../../assets/avatar_male.png", import.meta.url).href;
const femaleAvatarUrl = new URL("../../assets/avatar_female.png", import.meta.url).href;
const neutralAvatarUrl = new URL("../../assets/avatar.png", import.meta.url).href;

export const getAvatarUrl = (
  _fullName: string,
  gender?: string,
  avatarUrl?: string
): string => {
  // 1. Use the existing profile image if the backend supplied one.
  if (avatarUrl && avatarUrl.trim() !== "") return avatarUrl;

  // 2. Pick the correct local asset based on gender (case-insensitive).
  const normalizedGender = gender?.toLowerCase().trim();
  if (normalizedGender === "male") return maleAvatarUrl;
  if (normalizedGender === "female") return femaleAvatarUrl;

  // 3. Neutral fallback.
  return neutralAvatarUrl;
};
