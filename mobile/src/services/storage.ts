import * as Keychain from "react-native-keychain";

export async function saveToken(token: string) {
  try {
    await Keychain.setGenericPassword("auth", token);
  } catch (err) {
    console.error("Error saving token:", err);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    const creds = await Keychain.getGenericPassword();
    return creds ? creds.password : null;
  } catch (err) {
    console.error("Error reading token:", err);
    return null;
  }
}

export async function removeToken() {
  try {
    await Keychain.resetGenericPassword();
  } catch (err) {
    console.error("Error removing token:", err);
  }
}
