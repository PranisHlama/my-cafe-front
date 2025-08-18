"use client";

import { useState, useEffect } from "react";
import { AuthService } from "@/lib/services/authService";
import { TokenUtils } from "@/lib/utils/tokenUtils";

export default function TokenDebugger() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    updateTokenInfo();
  }, []);

  const updateTokenInfo = () => {
    const token = AuthService.getAccessToken();
    if (token) {
      const info = TokenUtils.getTokenInfo(token);
      setTokenInfo(info);
    } else {
      setTokenInfo({ valid: false, error: "No token found" });
    }
  };

  const clearToken = () => {
    AuthService.logout();
    updateTokenInfo();
  };

  const refreshToken = async () => {
    try {
      await AuthService.refreshToken();
      updateTokenInfo();
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 z-50"
        title="Debug Token Issues"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Token Debugger</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Status:</span>
          <span
            className={tokenInfo?.valid ? "text-green-600" : "text-red-600"}
          >
            {tokenInfo?.valid ? "Valid" : "Invalid"}
          </span>
        </div>

        {tokenInfo?.valid && (
          <>
            <div className="flex justify-between">
              <span>Expired:</span>
              <span
                className={
                  tokenInfo?.isExpired ? "text-red-600" : "text-green-600"
                }
              >
                {tokenInfo?.isExpired ? "Yes" : "No"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Expires in:</span>
              <span
                className={
                  tokenInfo?.isExpired ? "text-red-600" : "text-gray-600"
                }
              >
                {tokenInfo?.formattedExpiry}
              </span>
            </div>

            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="text-gray-600">
                {tokenInfo?.payload?.user_id || "N/A"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Role:</span>
              <span className="text-gray-600">
                {tokenInfo?.payload?.role || "N/A"}
              </span>
            </div>
          </>
        )}

        {tokenInfo?.error && (
          <div className="text-red-600 text-xs">{tokenInfo.error}</div>
        )}
      </div>

      <div className="flex space-x-2 mt-3">
        <button
          onClick={updateTokenInfo}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Refresh
        </button>

        {tokenInfo?.valid && !tokenInfo?.isExpired && (
          <button
            onClick={refreshToken}
            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            Refresh Token
          </button>
        )}

        <button
          onClick={clearToken}
          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
