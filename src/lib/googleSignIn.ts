import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import {
  NetworkError,
  AuthenticationError,
  ApiError,
} from "@/services/api/errors";

export function configureGoogleSignIn() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  if (!webClientId) return;

  GoogleSignin.configure({
    webClientId,
    iosClientId: iosClientId || undefined,
    offlineAccess: false,
  });
}

export class GoogleSignInError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "GoogleSignInError";
    this.code = code;
  }
}

function isErrorWithCode(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as Record<string, unknown>).code === "string"
  );
}

export async function signInWithGoogle(): Promise<string> {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new GoogleSignInError(
      "Google sign-in is not configured yet.",
      "NOT_CONFIGURED",
    );
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  } catch {
    throw new GoogleSignInError(
      "Google Play Services is required.",
      "PLAY_SERVICES",
    );
  }

  try {
    const { data } = await GoogleSignin.signIn();
    if (!data?.idToken) {
      throw new GoogleSignInError(
        "Google sign-in did not return a token.",
        "NO_TOKEN",
      );
    }
    return data.idToken;
  } catch (error: unknown) {
    if (isErrorWithCode(error)) {
      if (
        error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.code === statusCodes.IN_PROGRESS
      ) {
        throw new GoogleSignInError("Cancelled", "CANCELLED");
      }
    }

    if (error instanceof GoogleSignInError) throw error;

    throw new GoogleSignInError(
      "Google sign-in failed. Please try again.",
      "SIGN_IN_FAILED",
    );
  }
}

export async function changeGoogleAccount(): Promise<string> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // signOut may fail if not signed in — proceed anyway
  }
  return signInWithGoogle();
}

export function getGoogleConnectErrorMessage(error: unknown): string {
  if (error instanceof GoogleSignInError) {
    if (error.code === "CANCELLED") return "";
    return error.message;
  }

  if (error instanceof NetworkError) {
    return "Network error. Please check your connection.";
  }

  if (error instanceof AuthenticationError) {
    return "Authentication failed. Please try again.";
  }

  if (error instanceof ApiError) {
    if (error.statusCode === 409)
      return "This Google account is already linked to another user.";
    if (error.statusCode === 403)
      return "Your Google account email must be verified first.";
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong. Please try again.";
}
