import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  GlobalSignOutCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommandInput,
  GetUserCommand,
  GetUserCommandInput,
  UpdateUserAttributesCommand,
  ChangePasswordCommandInput,
  ChangePasswordCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserData } from '../types';
import { parseJwt } from '../lib/utils';
import { getLocalStorageItem, setLocalStorageItem } from '../lib/localStorage';
import { showToast } from '../services/toastService';
import { createUser, getCurrentUserDetails, authService } from '../services/api';
import { getEnvConfig } from '../config/env';
import { t } from 'i18next';

export type SignUpParams = {
  email: string;
  password: string;
  givenName: string;
  familyName: string;
  locale: string;
  role: string;
};

let cognitoClient: CognitoIdentityProviderClient | null = null;
let envConfig: Awaited<ReturnType<typeof getEnvConfig>> | null = null;

const initializeCognitoClient = async () => {
  if (!cognitoClient) {
    envConfig = await getEnvConfig();
    if (!envConfig) {
      throw new Error(t('auth_service.failed_to_initialize_environment_configuration'));
    }
    cognitoClient = new CognitoIdentityProviderClient({
      region: envConfig.COGNITO_REGION,
    });
  }
  return {
    client: cognitoClient,
    config: envConfig as NonNullable<typeof envConfig>,
  };
};

export const getUserData = async (): Promise<UserData> => {
  const { client } = await initializeCognitoClient();
  const idToken = getLocalStorageItem('idToken');
  const accessToken = getLocalStorageItem('accessToken');
  const userDetails = await getCurrentUserDetails();

  if (idToken) {
    const user = parseJwt(idToken);
    return {
      ...user,
      picture: userDetails.picture,
      'custom:avatar': userDetails['custom:avatar'],
      role: userDetails.role,
      group: userDetails.group,
    };
  }

  const params: GetUserCommandInput = {
    AccessToken: accessToken ?? '',
  };

  try {
    const command = new GetUserCommand(params);
    const { UserAttributes } = await client.send(command);

    const userData = (UserAttributes ?? []).reduce((acc: Record<string, string>, attribute) => {
      if (attribute.Name && attribute.Value) {
        acc[attribute.Name] = attribute.Value;
      }
      return acc;
    }, {});

    return {
      user_id: userData.sub ?? '',
      locale: userData.locale ?? '',
      email: userData.email ?? '',
      given_name: userData.given_name ?? '',
      family_name: userData.family_name ?? '',
      picture: userData['custom:avatar'] ?? '',
      'custom:avatar': userData['custom:avatar'] ?? '',
      role: userDetails.role,
      group: userDetails.group,
    };
  } catch (error: any) {
    if (
      error.name === 'NotAuthorizedException' &&
      error.message.includes('Access Token has expired')
    ) {
      console.warn(t('auth_service.access_token_has_expired_refreshing_token'));
      await refreshToken();
      return getUserData();
    }
    console.error(t('auth_service.error_getting_user_data'), error);
    throw error;
  }
};

export const updateUserData = async (
  userData: UserData,
  updatePicture: boolean = false
): Promise<void> => {
  const accessToken = getLocalStorageItem('accessToken');
  if (!accessToken) {
    throw new Error(t('auth_service.no_access_token_found_in_local_storage'));
  }

  const customPictureValue = userData['custom:avatar'] ?? '';

  const attributes = [
    { Name: 'given_name', Value: userData.given_name },
    { Name: 'family_name', Value: userData.family_name },
    { Name: 'locale', Value: userData.locale },
    ...(updatePicture ? [{ Name: 'custom:avatar', Value: customPictureValue }] : []),
  ];

  const params = {
    AccessToken: accessToken,
    UserAttributes: attributes,
  };

  try {
    const command = new UpdateUserAttributesCommand(params);
    await cognitoClient?.send(command);
    await refreshToken();
    showToast('success', t('auth_service.user_data_updated_successfully'));
  } catch (error: any) {
    if (
      error.name === 'NotAuthorizedException' &&
      error.message.includes('Access Token has expired')
    ) {
      console.warn(t('auth_service.access_token_has_expired_refreshing_token'));
      await refreshToken();
      return updateUserData(userData);
    }
    throw error;
  }
};

export const signOut = async (token: string) => {
  const params = {
    AccessToken: token,
  };
  try {
    const command = new GlobalSignOutCommand(params);
    const GlobalSignOutCommandOutput = await cognitoClient?.send(command);
    return GlobalSignOutCommandOutput;
  } catch (error) {
    console.error(t('auth_service.error_signing_out'), error);
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  const { config } = await initializeCognitoClient();
  const params = {
    ClientId: config.COGNITO_APP_CLIENT_ID,
    Username: email,
  };

  try {
    const command = new ForgotPasswordCommand(params);
    await cognitoClient?.send(command);
  } catch (error) {
    console.error(t('auth_service.error_initiating_forgot_password'), error);
    showToast('error', t('auth_service.failed_to_send_reset_code_please_try_again'));
    throw error;
  }
};

export const confirmForgotPassword = async (
  email: string,
  confirmationCode: string,
  newPassword: string
): Promise<void> => {
  const { config } = await initializeCognitoClient();
  const params = {
    ClientId: config.COGNITO_APP_CLIENT_ID,
    Username: email,
    ConfirmationCode: confirmationCode,
    Password: newPassword,
  };

  try {
    const command = new ConfirmForgotPasswordCommand(params);
    await cognitoClient?.send(command);
  } catch (error) {
    console.error(t('auth_service.error_confirming_password_reset'), error);
    showToast('error', t('auth_service.failed_to_reset_password_please_try_again'));
    throw error;
  }
};

export const signIn = async (username: string, password: string) => {
  try {
    const response = await authService.login(username, password);

    // Handle password challenges if present
    if (response.challengeName === 'NEW_PASSWORD_REQUIRED') {
      return {
        challengeName: 'NEW_PASSWORD_REQUIRED',
        session: response.session,
        username: username,
      };
    }

    // Normal login success
    if (response.idToken && response.accessToken && response.refreshToken) {
      setLocalStorageItem('idToken', response.idToken);
      setLocalStorageItem('accessToken', response.accessToken);
      setLocalStorageItem('refreshToken', response.refreshToken);
      return {
        IdToken: response.idToken,
        AccessToken: response.accessToken,
        RefreshToken: response.refreshToken,
      };
    }

    throw new Error('Invalid response from server');
  } catch (error: any) {
    console.error(t('auth_service.error_signing_in'), error);
    showToast('error', error.message || t('auth_service.failed_to_sign_in'));
    throw error;
  }
};

export const handlePasswordChallenge = async (
  username: string,
  newPassword: string,
  session: string
) => {
  try {
    const response = await authService.passwordChallenge(username, newPassword, session);

    if (response.idToken && response.accessToken && response.refreshToken) {
      setLocalStorageItem('idToken', response.idToken);
      setLocalStorageItem('accessToken', response.accessToken);
      setLocalStorageItem('refreshToken', response.refreshToken);
      return {
        IdToken: response.idToken,
        AccessToken: response.accessToken,
        RefreshToken: response.refreshToken,
      };
    }

    throw new Error('Invalid response from server');
  } catch (error: any) {
    console.error(t('auth_service.error_handling_password_challenge'), error);
    showToast('error', error.message || t('auth_service.failed_to_set_new_password'));
    throw error;
  }
};

export const signUp = async (data: SignUpParams & { role: string }) => {
  const { client, config } = await initializeCognitoClient();
  const params = {
    ClientId: config.COGNITO_APP_CLIENT_ID,
    Username: data.email,
    Password: data.password,
    UserAttributes: [
      {
        Name: 'email',
        Value: data.email,
      },
      {
        Name: 'given_name',
        Value: data.givenName,
      },
      {
        Name: 'family_name',
        Value: data.familyName,
      },
      {
        Name: 'locale',
        Value: data.locale,
      },
    ],
  };
  try {
    const command = new SignUpCommand(params);
    const response = await client.send(command);

    createUser({
      cognito_id: response.UserSub,
      name: data.givenName + ' ' + data.familyName,
      email: data.email,
      role: data.role,
    });

    return response;
  } catch (error) {
    console.error('Error signing up: ', error);
    throw error;
  }
};

export const confirmSignUp = async (username: string, code: string) => {
  const { client, config } = await initializeCognitoClient();
  const params = {
    ClientId: config.COGNITO_APP_CLIENT_ID,
    Username: username,
    ConfirmationCode: code,
  };
  try {
    const command = new ConfirmSignUpCommand(params);
    await client.send(command);
    return true;
  } catch (error) {
    console.error(t('auth_service.error_confirming_sign_up'), error);
    throw error;
  }
};

export const refreshToken = async () => {
  const { client, config } = await initializeCognitoClient();
  const refreshToken = getLocalStorageItem('refreshToken');
  const params: InitiateAuthCommandInput = {
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: config.COGNITO_APP_CLIENT_ID,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  } as InitiateAuthCommandInput;
  try {
    const command = new InitiateAuthCommand(params);
    const { AuthenticationResult } = await client.send(command);
    if (AuthenticationResult) {
      setLocalStorageItem('idToken', AuthenticationResult.IdToken ?? '');
      setLocalStorageItem('accessToken', AuthenticationResult.AccessToken ?? '');
      return AuthenticationResult;
    }
  } catch (error: any) {
    if (
      (error.name === 'NotAuthorizedException' &&
        error.message.includes('Refresh Token has been revoked')) ??
      error.name === 'UserNotFoundException'
    ) {
      console.error(error.message);
      handleTokenRevocation();
    } else {
      console.error(t('auth_service.error_refreshing_token'), error);
      throw error;
    }
  }
};

const handleTokenRevocation = async () => {
  try {
    localStorage.removeItem('idToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  } catch (error) {
    console.error(t('auth_service.error_during_sign_out'), error);
  }
};

export const completeRegistration = async (
  username: string,
  password: string,
  inviteCode: string
) => {
  const { client, config } = await initializeCognitoClient();
  const params = {
    ClientId: config.COGNITO_APP_CLIENT_ID,
    Username: username,
    Password: password,
    UserAttributes: [
      {
        Name: 'custom:invite_code',
        Value: inviteCode,
      },
    ],
  };
  try {
    const command = new SignUpCommand(params);
    const response = await client.send(command);
    return response;
  } catch (error) {
    console.error(t('auth_service.error_completing_registration'), error);
    throw error;
  }
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  const { client } = await initializeCognitoClient();
  const accessToken = getLocalStorageItem('accessToken');

  if (!accessToken) {
    throw new Error(t('auth_service.no_access_token_found'));
  }

  const params: ChangePasswordCommandInput = {
    AccessToken: accessToken,
    PreviousPassword: oldPassword,
    ProposedPassword: newPassword,
  };

  try {
    const command = new ChangePasswordCommand(params);
    await client.send(command);
    showToast('success', t('auth_service.password_changed_successfully'));
  } catch (error: any) {
    console.error('Error changing password: ', error);
    showToast('error', t('auth_service.failed_to_change_password') + error.message);
    throw error;
  }
};
