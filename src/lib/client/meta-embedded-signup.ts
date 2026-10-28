declare global {
  interface Window {
    FB?: {
      init: (opts: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        cb: (response: {
          authResponse?: { code?: string; accessToken?: string } | null;
          status?: string;
        }) => void,
        opts: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const GRAPH_VERSION = "v21.0";

let sdkPromise: Promise<void> | null = null;

function loadFacebookSdk(appId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.FB) {
    window.FB.init({
      appId,
      cookie: true,
      xfbml: true,
      version: GRAPH_VERSION,
    });
    return Promise.resolve();
  }
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: true,
        version: GRAPH_VERSION,
      });
      resolve();
    };
    const existing = document.getElementById("facebook-jssdk");
    if (existing) return;
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.onerror = () => reject(new Error("Could not load Facebook SDK."));
    document.body.appendChild(script);
  });
  return sdkPromise;
}

export type EmbeddedSignupResult = {
  code: string;
  phoneNumberId?: string;
  wabaId?: string;
};

/** Launch Meta WhatsApp Embedded Signup (OTP to the business phone Meta has on file). */
export async function launchWhatsAppEmbeddedSignup(input: {
  appId: string;
  configId: string;
}): Promise<EmbeddedSignupResult> {
  await loadFacebookSdk(input.appId);

  let sessionPhoneNumberId: string | undefined;
  let sessionWabaId: string | undefined;

  const onMessage = (event: MessageEvent) => {
    if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
      return;
    }
    try {
      const raw = typeof event.data === "string" ? event.data : "";
      if (!raw.includes("WA_EMBEDDED_SIGNUP")) return;
      const payload = JSON.parse(raw) as {
        type?: string;
        event?: string;
        data?: { phone_number_id?: string; waba_id?: string };
      };
      if (payload.type === "WA_EMBEDDED_SIGNUP" || payload.event === "FINISH") {
        sessionPhoneNumberId = payload.data?.phone_number_id;
        sessionWabaId = payload.data?.waba_id;
      }
    } catch {
      // Meta also posts non-JSON progress frames; ignore those.
    }
  };

  window.addEventListener("message", onMessage);

  try {
    const code = await new Promise<string>((resolve, reject) => {
      if (!window.FB) {
        reject(new Error("Facebook SDK failed to load."));
        return;
      }
      window.FB.login(
        (response) => {
          const authCode = response.authResponse?.code;
          if (authCode) {
            resolve(authCode);
            return;
          }
          reject(new Error("WhatsApp signup was cancelled or did not return a code."));
        },
        {
          config_id: input.configId,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: "",
            sessionInfoVersion: "3",
          },
        },
      );
    });

    return {
      code,
      phoneNumberId: sessionPhoneNumberId,
      wabaId: sessionWabaId,
    };
  } finally {
    window.removeEventListener("message", onMessage);
  }
}
