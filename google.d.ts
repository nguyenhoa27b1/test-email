
// This file provides TypeScript definitions for the Google Identity Services (GIS) library.
// Since the library is loaded from a <script> tag, these globals are not automatically
// recognized by the TypeScript compiler. This declaration file makes them available globally.

declare global {
  interface CredentialResponse {
    credential?: string;
    select_by?:
      | 'auto'
      | 'user'
      | 'user_1tap'
      | 'user_2tap'
      | 'button'
      | 'btn'
      | 'btn_confirm'
      | 'btn_add_session'
      | 'btn_confirm_add_session';
    clientId?: string;
  }

  // Augment the global Window interface to include the `google` object definition.
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: CredentialResponse) => void;
            auto_select?: boolean;
            login_uri?: string;
            ux_mode?: 'popup' | 'redirect';
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string;
              locale?: string;
            }
          ) => void;
          prompt: (notification?: (notification: any) => void) => void;
        };
      };
    };
  }
}

// Also declare `google` as a global constant for scripts that might access it directly without `window`.
declare const google: typeof window.google;

// Convert this file to a module to allow global augmentation.
// An empty export statement turns this file into a module, which is required for `declare global` to work.
export {};
