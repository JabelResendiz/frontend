import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import { FriendlyCaptchaSDK } from "@friendlycaptcha/sdk";

let sdkInstance: FriendlyCaptchaSDK | null = null;

const getFriendlyCaptchaSDK = () => {
  if (!sdkInstance) {
    sdkInstance = new FriendlyCaptchaSDK({ startAgent: true });
  }
  return sdkInstance;
};

export interface FriendlyCaptchaRef {
  reset: () => void;
}

interface FriendlyCaptchaProps {
  sitekey: string;
  onChange: (token: string | null) => void;
  language?: string;
  theme?: "light" | "dark";
}

export const FriendlyCaptcha = forwardRef<FriendlyCaptchaRef, FriendlyCaptchaProps>(
  ({ sitekey, onChange, language = "es", theme = "light" }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetRef = useRef<any>(null);
    const onChangeRef = useRef(onChange);

    useImperativeHandle(ref, () => ({
      reset: () => {
        widgetRef.current?.reset();
      }
    }), []);

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      if (!containerRef.current || !sitekey) {
        return;
      }

      const container = containerRef.current;
      const sdk = getFriendlyCaptchaSDK();
      const widget = sdk.createWidget({
        element: container,
        sitekey,
        language,
        theme,
        formFieldName: null,
        startMode: "auto"
      });

      widgetRef.current = widget;

      const handleComplete = (event: Event) => {
        const detail = (event as CustomEvent)?.detail;
        const token = detail?.response;
        onChangeRef.current(typeof token === "string" ? token : null);
      };

      const handleExpire = () => onChangeRef.current(null);
      const handleError = () => onChangeRef.current(null);

      container.addEventListener("frc:widget.complete", handleComplete);
      container.addEventListener("frc:widget.expire", handleExpire);
      container.addEventListener("frc:widget.error", handleError);

      return () => {
        container.removeEventListener("frc:widget.complete", handleComplete);
        container.removeEventListener("frc:widget.expire", handleExpire);
        container.removeEventListener("frc:widget.error", handleError);
        widget.destroy();
        widgetRef.current = null;
      };
    }, [sitekey, language, theme]);

    return <div ref={containerRef} className="w-full" />;
  }
);
FriendlyCaptcha.displayName = "FriendlyCaptcha";
