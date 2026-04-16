const API = 'http://localhost:5002/api';

function authHeader(token: string) {
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function handleRes(res: Response) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

export const superAdminApi = {
    // ── Auth ──────────────────────────────────────────────
    getCaptcha: () => fetch(`${API}/auth/captcha`).then(handleRes),

    login: (email: string, password: string, captchaId: string, captchaAnswer: string) =>
        fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, captchaId, captchaAnswer }),
        }).then(handleRes),

    getMe: (token: string) =>
        fetch(`${API}/auth/me`, { headers: authHeader(token) }).then(handleRes),

    // ── Bunk Admins ───────────────────────────────────────
    getBunkAdmins: (token: string) =>
        fetch(`${API}/bunkadmins`, { headers: authHeader(token) }).then(handleRes),

    getPending: (token: string) =>
        fetch(`${API}/bunkadmins/pending`, { headers: authHeader(token) }).then(handleRes),

    getBunkAdminStats: (token: string) =>
        fetch(`${API}/bunkadmins/stats/summary`, { headers: authHeader(token) }).then(handleRes),

    approveBunkAdmin: (token: string, id: string) =>
        fetch(`${API}/bunkadmins/${id}/approve`, {
            method: 'PUT', headers: authHeader(token),
        }).then(handleRes),

    rejectBunkAdmin: (token: string, id: string, reason?: string) =>
        fetch(`${API}/bunkadmins/${id}/reject`, {
            method: 'PUT',
            headers: authHeader(token),
            body: JSON.stringify({ reason }),
        }).then(handleRes),

    deleteBunkAdmin: (token: string, id: string) =>
        fetch(`${API}/bunkadmins/${id}`, {
            method: 'DELETE', headers: authHeader(token),
        }).then(handleRes),

    // ── Users ─────────────────────────────────────────────
    getUsers: (token: string) =>
        fetch(`${API}/users`, { headers: authHeader(token) }).then(handleRes),

    getUserStats: (token: string) =>
        fetch(`${API}/users/stats/summary`, { headers: authHeader(token) }).then(handleRes),

    deleteUser: (token: string, id: string) =>
        fetch(`${API}/users/${id}`, {
            method: 'DELETE', headers: authHeader(token),
        }).then(handleRes),

    // ── Feedback ──────────────────────────────────────────
    getFeedback: (token: string) =>
        fetch(`${API}/feedback`, { headers: authHeader(token) }).then(handleRes),

    deleteFeedback: (token: string, id: string) =>
        fetch(`${API}/feedback/${id}`, {
            method: 'DELETE', headers: authHeader(token),
        }).then(handleRes),

    // ── Settings ──────────────────────────────────────────
    getGlobalPrice: (token: string) =>
        fetch(`${API}/settings/price`, { headers: authHeader(token) }).then(handleRes),

    updateGlobalPrice: (token: string, pricePerKg: number) =>
        fetch(`${API}/settings/price`, {
            method: 'POST',
            headers: authHeader(token),
            body: JSON.stringify({ pricePerKg }),
        }).then(handleRes),

    // ── Bookings ──────────────────────────────────────────
    getAllBookings: (token: string) =>
        fetch(`${API}/bunkadmins/stats/all-bookings`, { headers: authHeader(token) }).then(handleRes),
};
