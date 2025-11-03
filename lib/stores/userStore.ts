/**
 * USER STORE - Zustand State Management
 *
 * This store manages user authentication and profile state globally
 */

import { create } from 'zustand';
import { UserService } from '../services/userService';
import { User } from '../models/person/User';

interface UserState {
    // State
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    initialized: boolean; // Track if auth has been initialized

    // Actions
    initializeAuth: () => Promise<void>;
    signUp: (email: string, password: string, name: string, role: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    fetchUser: (userId: string) => Promise<void>;
    clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    // Initial State
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    initialized: false,

    // Initialize Auth - Check if user is already logged in
    initializeAuth: async () => {
        try {
            const { user: authUser } = await UserService.getCurrentUser();

            if (authUser) {
                const { user: userProfile } = await UserService.getUserProfile(authUser.id);
                if (userProfile) {
                    set({
                        user: userProfile,
                        isAuthenticated: true,
                        initialized: true,
                    });
                    return;
                }
            }

            set({ initialized: true });
        } catch (error) {
            set({ initialized: true });
        }
    },

    // Sign Up Action
    signUp: async (email, password, name, role) => {
        set({ isLoading: true, error: null });
        try {
            const { user: authUser, error } = await UserService.signUp(email, password, name, role);

            if (error || !authUser) throw error || new Error('Failed to create user');

            // Fetch full user profile after signup
            const { user: userProfile, error: profileError } = await UserService.getUserProfile(authUser.id);

            if (profileError || !userProfile) throw profileError || new Error('Failed to fetch user profile');

            set({
                user: userProfile,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Sign up failed',
            });
            throw error; // Re-throw so signup page can show error
        }
    },

    // Sign In Action
    signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { user, session, error } = await UserService.signIn(email, password);

            if (error) throw error;

            // Fetch full user profile
            if (user) {
                const { user: userProfile } = await UserService.getUserProfile(user.id);
                set({
                    user: userProfile,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
            }
        } catch (error: unknown) {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Sign in failed',
            });
        }
    },

    // Sign Out Action
    signOut: async () => {
        set({ isLoading: true });
        try {
            await UserService.signOut();
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Sign out failed',
            });
        }
    },

    // Fetch User Profile
    fetchUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const { user, error } = await UserService.getUserProfile(userId);

            if (error) throw error;

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error: unknown) {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch user',
            });
        }
    },

    // Clear Error
    clearError: () => set({ error: null }),
}));

/**
 * USAGE EXAMPLES:
 *
 * // In a React component:
 * import { useUserStore } from '@/lib/stores/userStore';
 *
 * function LoginForm() {
 *   const { signIn, isLoading, error } = useUserStore();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     await signIn(email, password);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <p>{error}</p>}
 *       <button disabled={isLoading}>
 *         {isLoading ? 'Loading...' : 'Sign In'}
 *       </button>
 *     </form>
 *   );
 * }
 */
