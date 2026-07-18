"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Google reCAPTCHA v2 Component
 * Renders the CAPTCHA checkbox widget and calls onVerify with the token.
 * Prevents automated bot submissions on login and registration forms.
 */
interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export default function ReCaptcha({ onVerify, onExpire }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

  useEffect(() => {
    // Load reCAPTCHA script if not already loaded
    if (window.grecaptcha && window.grecaptcha.render) {
      setLoaded(true);
      return;
    }

    window.onRecaptchaLoad = () => {
      setLoaded(true);
    };

    const existingScript = document.querySelector('script[src*="recaptcha"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup
      window.onRecaptchaLoad = () => {};
    };
  }, []);

  useEffect(() => {
    if (loaded && containerRef.current && widgetId.current === null) {
      try {
        widgetId.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onVerify(token),
          "expired-callback": () => {
            onVerify(null);
            if (onExpire) onExpire();
          },
          theme: "light",
          size: "normal",
        });
      } catch (e) {
        // Widget may already be rendered
        console.warn("reCAPTCHA render error:", e);
      }
    }
  }, [loaded, siteKey, onVerify, onExpire]);

  return (
    <div className="flex justify-center my-3">
      <div ref={containerRef} />
    </div>
  );
}
