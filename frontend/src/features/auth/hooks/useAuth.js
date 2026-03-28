import { useDispatch } from "react-redux";
import { setUser, setLoading, setError } from "../auth.slice";
import { registerUser, loginUser, getMe } from "../service/auth.api";

/**
 * Must stay synchronous: React hooks cannot be `async` (that would return a Promise).
 * The *handlers* below are async—callers await them from event handlers (e.g. onSubmit).
 */
export const useAuth = () => {
  const dispatch = useDispatch();

  /**
   * Register does not establish an app session: user must verify email, then sign in.
   * The API may still return a token; we do not dispatch setUser here so Redux stays logged-out.
   */
  const handleRegister = async ({ name, email, password }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await registerUser({ name, email, password });
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Registration failed"),
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogin = async ({ email, password }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const body = await loginUser({ email, password });
      const session = body?.data;
      if (session) dispatch(setUser(session));
    } catch (error) {
      dispatch(setError(error.response?.data?.message || "Login failed"));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetMe = async () => {
    try {
      dispatch(setLoading(true));
      const body = await getMe();
      const session = body?.data ?? body;
      if (session) dispatch(setUser(session));
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Can't get user details"),
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    handleLogin,
    handleRegister,
    handleGetMe,
  };
};
