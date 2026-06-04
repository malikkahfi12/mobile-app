export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  avatarInitials: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DeviceIdentity {
  deviceId: string;
  publicKey: string;
}

export interface RegisterParams {
  username: string;
  displayName: string;
  publicKey: string;
  deviceName?: string;
  platform?: string;
}

export interface DeviceInfo {
  id: string;
  deviceName?: string;
  platform?: string;
  lastSeenAt?: string;
  createdAt?: string;
  isCurrent?: boolean;
}

export interface RegisterResponse {
  user: User;
  device: DeviceInfo;
  accessToken: string;
  refreshToken: string;
}

export interface ChallengeRequest {
  username: string;
  deviceId: string;
}

export interface ChallengeResponse {
  challengeId: string;
  challenge: string;
  expiresAt: string;
}

export interface LoginRequest {
  challengeId: string;
  signature: string;
}

export interface LoginResponse {
  user: User;
  device: DeviceInfo;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RecoveryGoogleResponse {
  recoveryToken: string;
}

export interface RecoveryRegisterDeviceRequest {
  publicKey: string;
  deviceName?: string;
  platform?: string;
}

export interface RecoveryRegisterDeviceResponse {
  deviceId: string;
  challengeId: string;
  challenge: string;
  expiresAt: string;
}
