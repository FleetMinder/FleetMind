// Re-export auth-based company helpers
// Tutte le API route importano da qui, quindi basta aggiornare questo file
export { getCompany, getCompanyId, getProtectedCompanyId } from "./auth";
