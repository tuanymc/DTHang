/** user từ /auth/me khớp fn_get_profile (roles: TEXT[]) */
export function hasAdminRole(user: unknown): boolean {
    if (!user || typeof user !== "object") return false;
    const roles = (user as { roles?: unknown }).roles;
    if (!Array.isArray(roles)) return false;
    return roles.some(
        (r) =>
            typeof r === "string"
            && r.trim().toLowerCase() === "admin",
    );
}
