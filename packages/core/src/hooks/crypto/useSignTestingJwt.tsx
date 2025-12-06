import axios from "axios";
import { handleError } from "../../utils/handleError";
import { useProject } from "../projects";

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
    privateKey,
    payload,
  }: {
    privateKey: string;
    payload: Record<string, any>;
  }) => {
    const { projectId } = useProject();

    try {
      if (!projectId) {
        throw new Error("No project specified");
      }

      // Warn developers about the security risks
      console.warn(WARNING);
      const response = await axios.post(
        `/${projectId}/crypto/sign-testing-jwt`,
        {
          privateKey,
          payload,
        }
      );

      return response.data as string;
    } catch (err: unknown) {
      handleError(err, "Failed to sign testing jwt: ");
    }
  };

  return signTestingJwt;
}

export default useSignTestingJwt;
