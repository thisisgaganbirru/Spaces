// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://localhost:3001/api",
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// API endpoints
export const API_ENDPOINTS = {
  SPACES: {
    ROOT: "/spaces/root",
    USER_ROOT: (userId) => `/spaces/user/${userId}/root`,
    USER_SPACES: (userId) => `/spaces/user/${userId}`,
    BY_ID: (spaceId) => `/spaces/${spaceId}`,
    CHILDREN: (spaceId) => `/spaces/${spaceId}/children`,
    CREATE: "/spaces",
    UPDATE: (spaceId) => `/spaces/${spaceId}`,
    DELETE: (spaceId) => `/spaces/${spaceId}`,
  },
  USERS: {
    BY_ID: (userId) => `/users/${userId}`,
    BY_EMAIL: (email) => `/users/email/${encodeURIComponent(email)}`,
    CREATE: "/users",
    UPDATE: (userId) => `/users/${userId}`,
  },
  CARDS: {
    STYLES: "/cards/styles",
    BY_ID: (cardId) => `/cards/${cardId}`,
    USER_CARDS: (userId) => `/cards/user/${userId}`,
    CREATE: "/cards",
    UPDATE: (cardId) => `/cards/${cardId}`,
    DELETE: (cardId) => `/cards/${cardId}`,
  },
};

export default API_CONFIG;
