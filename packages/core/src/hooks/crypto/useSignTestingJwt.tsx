import axios from "../../config/axios";
import { handleError } from "../../utils/handleError";

const WARNING = `
    WARNING: You are using a testing function to generate JWTs in your client application.
    This is NOT secure and should ONLY be used for initial development and testing purposes.

    In production:
    - NEVER expose your secret key in client-side code.
    - Refer to the documentation at https://docs.replyke.com to implement JWT signing on your backend.
    - Rotate your secret key periodically, especially after moving from testing to production.

    Failure to follow these practices can lead to security vulnerabilities.
  `;

function useSignTestingJwt() {
  const signTestingJwt = async ({
    projectId,
    privateKey,
    userData,
  }: {
    projectId: string;
    privateKey: string;
    userData: { id: string } & Record<string, any>;
  }) => {
    try {
      if (!projectId) {
        throw new Error("No project specified");
      }

      // Warn developers about the security risks
      console.warn(WARNING);
      const response = await axios.post(
        `/${projectId}/crypto/sign-testing-jwt/v2`,
        {
          projectId,
          privateKey,
          userData,
        },
      );

      return response.data as string;
    } catch (err: unknown) {
      handleError(err, "Failed to sign testing jwt: ");
    }
  };

  return signTestingJwt;
}

export default useSignTestingJwt;
