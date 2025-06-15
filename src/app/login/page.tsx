"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { generateNonce, generateRandomness } from "@mysten/sui/zklogin"
import { SuiClient } from "@mysten/sui/client"
import { jwtDecode } from "jwt-decode"
import { jwtToAddress } from "@mysten/sui/zklogin"
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit"
import dynamic from "next/dynamic"

export interface JwtPayload {
  iss?: string
  sub?: string
  aud?: string[] | string
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
}

const FULLNODE_URL = "https://fullnode.testnet.sui.io"
const suiClient = new SuiClient({ url: FULLNODE_URL })
const CLIENT_ID = "284569104639-cm0ql97759v5lccur85u7tgt8hpbvt4l.apps.googleusercontent.com"
const REDIRECT_URI = "http://localhost:3000/login"

function LoginPageContent() {
  const router = useRouter()
  const currentAccount = useCurrentAccount()
  const [loginURL, setLoginURL] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const setupLoginURL = useCallback(async () => {
    try {
      setIsLoading(true)
      const { epoch } = await suiClient.getLatestSuiSystemState()
      const maxEpoch = Number(epoch) + 2
      const ephemeralKeyPair = new Ed25519Keypair()
      const randomness = generateRandomness()
      const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness)

      if (typeof window !== "undefined") {
        localStorage.setItem("zklogin_randomness", randomness)
        localStorage.setItem("zklogin_max_epoch", maxEpoch.toString())
      }

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "id_token",
        scope: "openid email profile",
        nonce: nonce,
      })

      setLoginURL(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
    } catch (err) {
      setError("Failed to setup login. Please try again.")
      console.error("Setup login error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleLoginSuccess = useCallback(
    async (token: string) => {
      try {
        setIsLoading(true)
        const decoded = jwtDecode<JwtPayload>(token)
        console.log("Decoded JWT:", decoded)

        if (typeof window === "undefined") return

        let salt = localStorage.getItem("zklogin_salt")
        if (!salt) {
          const array = new Uint8Array(16)
          window.crypto.getRandomValues(array)
          salt = Array.from(array)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
          localStorage.setItem("zklogin_salt", salt)
        }

        const address = jwtToAddress(token, salt)

        localStorage.setItem("zklogin_jwt", token)
        localStorage.setItem("zklogin_address", address)

        console.log("Login successful! Sui address:", address)
        router.push("/")
      } catch (err) {
        setError("Login failed. Please try again.")
        console.error("Login error:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  useEffect(() => {
    if (!mounted) return

    const existingJWT = localStorage.getItem("zklogin_jwt")
    const existingAddress = localStorage.getItem("zklogin_address")

    if (existingJWT && existingAddress) {
      router.push("/")
      return
    }

    if (currentAccount) {
      router.push("/")
      return
    }

    const urlParams = new URLSearchParams(window.location.hash.substring(1))
    const token = urlParams.get("id_token")

    if (token) {
      handleLoginSuccess(token)
    } else {
      setupLoginURL()
    }
  }, [router, currentAccount, handleLoginSuccess, setupLoginURL, mounted])

  if (!mounted) {
    return (
      <div className="login-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-card-header">
            <h1 className="login-card-title">Welcome to Pokemon Memory Game</h1>
            <p className="login-card-description">
              Login with Google using zkLogin or connect your Sui wallet to start playing
            </p>
          </div>

          <div className="login-card-content">
            {error && <div className="error-message">{error}</div>}

            {!isLoading && (
              <div className="login-button-container">
                {loginURL && (
                  <button onClick={() => (window.location.href = loginURL)} className="google-login-button">
                    Login with Google (zkLogin)
                  </button>
                )}

                <div className="divider-container">
                  <div className="divider-line">
                    <span></span>
                  </div>
                  <div className="divider-text">
                    <span>Or</span>
                  </div>
                </div>

                <div className="sui-connect-button-wrapper">
                  <ConnectButton />
                </div>
              </div>
            )}

            {isLoading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Setting up login...</p>
              </div>
            )}

            <div className="login-description">
              <p>zkLogin provides secure, gasless authentication using your Google account.</p>
              <p>Or connect your Sui wallet directly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const LoginPage = dynamic(() => Promise.resolve(LoginPageContent), {
  ssr: false,
  loading: () => (
    <div className="login-container">
      <div className="loading-spinner"></div>
    </div>
  ),
})

export default LoginPage
