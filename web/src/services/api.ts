// API service layer for CodeBuddy
// This would integrate with your backend API routes

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth API calls
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  sendOTP: async (email: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  verifyOTP: async (email: string, otp: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  logout: async (token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
};

// Project API calls
export const projectAPI = {
  create: async (projectData: {
    title: string;
    description: string;
    skills: string[];
    maxMembers: number;
  }, token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/project/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  requestJoin: async (projectId: string, token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/project/request-join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  acceptJoin: async (requestId: string, token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/project/accept-join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  close: async (projectId: string, token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/project/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  getAllOpen: async (token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/project/open`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  getMyProjects: async (token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/project/my-projects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
};

// User API calls
export const userAPI = {
  sendFriendRequest: async (userId: string, token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/send-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  acceptFriendRequest: async (requestId: string, token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/accept-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  getFriends: async (token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/friends`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  getSuggestions: async (token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/suggestions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  getUserDetails: async (userId: string, token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/user-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  uploadProfilePic: async (imageFile: File, token: string): Promise<ApiResponse<any>> => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch(`${API_BASE_URL}/user/upload-pic`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  updateContact: async (contactData: any, token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/update-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(contactData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  getDetails: async (token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/details`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  updatePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }, token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  updateUserDetails: async (userDetails: any, token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/upload-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userDetails),
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },
};