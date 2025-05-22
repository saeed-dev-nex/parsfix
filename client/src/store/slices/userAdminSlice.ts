import {
  AdminUsersApiResponse,
  FetchAdminUsersParams,
  UserAdminState,
} from './../../types/index';
// client/src/store/slices/userAdminSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiDelete, apiGet, apiPut } from '@/lib/apiHelper';
import { User, Role, AuthError } from '@/types'; // User و Role و AuthError را داریم
import { RootState } from '../store';

// ساختار پاسخ API لیست کاربران ادمین

// State اولیه
const initialState: UserAdminState = {
  users: [],
  totalUsers: 0,
  totalPages: 0,
  currentPage: 1,
  limit: 10,
  isLoading: false,
  isProcessing: false, // مقدار اولیه
   
  error: null,
  successMessage: null,
};

// --- Thunk برای واکشی لیست کاربران ادمین ---
export const fetchAdminUsers = createAsyncThunk<
  AdminUsersApiResponse,
  FetchAdminUsersParams
>(
  'userAdmin/fetchUsers',
  async (params = { page: 1, limit: 10 }, { rejectWithValue }) => {
    try {
      console.log('Fetching admin users with params:', params);
      // Convert params to a Record<string, string | number | boolean | null | undefined>
      const queryParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null)
      );
      const responseData = await apiGet('/admin/users', {
        params: queryParams,
      }); // اندپوینت GET /admin/users
      if (responseData?.status === 'success' && responseData?.data) {
        // data شامل users و اطلاعات pagination است
        return responseData.data as AdminUsersApiResponse;
      } else {
        throw new Error(
          responseData?.message || 'ساختار پاسخ لیست کاربران نامعتبر است'
        );
      }
    } catch (error: any) {
      console.error('Error fetching admin users:', error);
      return rejectWithValue({
        message: error.message || 'خطا در واکشی لیست کاربران',
        code: error.code,
      } as AuthError);
    }
  }
);
interface BlockUserPayload {
  userId: string;
  reason?: string | null;
}
export const blockUserAdmin = createAsyncThunk<User, BlockUserPayload>( // خروجی: کاربر آپدیت شده
  'userAdmin/blockUser',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      console.log(`Attempting to block user ${userId} with reason: ${reason}`);
      const responseData = await apiPut(`/admin/users/${userId}/block`, {
        reason,
      });
      if (responseData?.status === 'success' && responseData?.data?.user) {
        return responseData.data.user as User;
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || '...' } as AuthError);
    }
  }
);

// --- Thunk رفع مسدودیت کاربر ---
export const unblockUserAdmin = createAsyncThunk<User, string>( // ورودی: userId, خروجی: User
  'userAdmin/unblockUser',
  async (userId, { rejectWithValue }) => {
    try {
      console.log(`Attempting to unblock user ${userId}`);
      const responseData = await apiPut(`/admin/users/${userId}/unblock`, {}); // بدنه خالی
      if (responseData?.status === 'success' && responseData?.data?.user) {
        return responseData.data.user as User;
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({ message: error.message || '...' } as AuthError);
    }
  }
);

// --- Thunk حذف کاربر ---
export const deleteUserAdmin = createAsyncThunk<string, string>( // ورودی: userId, خروجی: userId
  'userAdmin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await apiDelete(`/admin/users/${userId}`);
      return userId; // ID کاربر حذف شده را برگردان
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'خطا در حذف کاربر',
      } as AuthError);
    }
  }
);

// --- Thunk تغییر نقش کاربر ---
interface ChangeRolePayload {
  userId: string;
  role: Role;
}
export const changeUserRoleAdmin = createAsyncThunk<User, ChangeRolePayload>( // خروجی: User آپدیت شده
  'userAdmin/changeRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const responseData = await apiPut(`/admin/users/${userId}/role`, {
        role,
      });
      if (responseData?.status === 'success' && responseData?.data?.user) {
        return responseData.data.user as User;
      } else {
        throw new Error(responseData?.message || '...');
      }
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'خطا در تغییر نقش کاربر',
      } as AuthError);
    }
  }
);

// --- تعریف Slice ---
const userAdminSlice = createSlice({
  name: 'userAdmin', // نام مناسب برای اسلایس
  initialState,
  reducers: {
    clearUserAdminError: (state) => {
      state.error = null;
    },
    clearUserAdminSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null; /*...*/
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users; /*...*/
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AuthError;
      })

      // Block User
      .addCase(blockUserAdmin.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(blockUserAdmin.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.successMessage = 'کاربر مسدود شد.';
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(blockUserAdmin.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as AuthError;
      })

      // Unblock User
      .addCase(unblockUserAdmin.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(unblockUserAdmin.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.successMessage = 'کاربر رفع مسدودیت شد.';
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(unblockUserAdmin.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as AuthError;
      })

      // --- Delete User ---
      .addCase(deleteUserAdmin.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        deleteUserAdmin.fulfilled,
        (state, action: PayloadAction<string>) => {
          // payload is userId
          state.isProcessing = false;
          state.successMessage = 'کاربر با موفقیت حذف شد.';
          state.users = state.users.filter((u) => u.id !== action.payload);
          state.totalUsers = Math.max(0, state.totalUsers - 1);
        }
      )
      .addCase(deleteUserAdmin.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as AuthError;
      })

      // --- Change User Role ---
      .addCase(changeUserRoleAdmin.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        changeUserRoleAdmin.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.isProcessing = false;
          state.successMessage = 'نقش کاربر با موفقیت تغییر یافت.';
          const index = state.users.findIndex(
            (u) => u.id === action.payload.id
          );
          if (index !== -1) state.users[index] = action.payload; // آپدیت کاربر در لیست
        }
      )
      .addCase(changeUserRoleAdmin.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as AuthError;
      });
  },
});

// --- Export کردن Reducer, Actions, Selectors ---
export const { clearUserAdminError, clearUserAdminSuccessMessage } =
  userAdminSlice.actions;
export default userAdminSlice.reducer;

// Selectors
export const selectAdminUserList = (state: RootState) => state.userAdmin.users;
export const selectAdminUserPagination = (state: RootState) => ({
  totalRowCount: state.userAdmin.totalUsers,
  totalPages: state.userAdmin.totalPages,
  currentPage: state.userAdmin.currentPage,
  pageSize: state.userAdmin.limit,
});
export const selectAdminUserIsLoading = (state: RootState) =>
  state.userAdmin.isLoading;
export const selectAdminUserIsProcessing = (state: RootState) =>
  state.userAdmin.isProcessing; // <-- سلکتور جدید
export const selectAdminUserError = (state: RootState) => state.userAdmin.error;
export const selectAdminUserSuccessMessage = (state: RootState) =>
  state.userAdmin.successMessage; // <-- سلکتور جدید
