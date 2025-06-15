"use client";

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit"
import { fetchPokemonData, type Pokemon } from "@/app/api/api"
import Scoreboard from "./components/Scoreboard"
import CardGrid from "./components/CardGrid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const shuffle = <T,>(array: T[]): T[] => {
  return array
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value)
}

export default function Home() {
  const router = useRouter()
  const currentAccount = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()

  const [cards, setCards] = useState<Pokemon[]>([])
  const [clickedIds, setClickedIds] = useState<Set<number>>(new Set())
  const [score, setScore] = useState<number>(0)
  const [bestScore, setBestScore] = useState<number>(0)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [authMethod, setAuthMethod] = useState<"zklogin" | "wallet" | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkAuth = () => {
      const jwt = localStorage.getItem("zklogin_jwt")
      const address = localStorage.getItem("zklogin_address")

      if (jwt && address) {
        // zkLogin authentication
        setIsAuthenticated(true)
        setAuthMethod("zklogin")
        setBestScore(Number(localStorage.getItem("bestScore")) || 0)
      } else if (currentAccount) {
        // Wallet authentication
        setIsAuthenticated(true)
        setAuthMethod("wallet")
        setBestScore(Number(localStorage.getItem("bestScore")) || 0)
      } else {
        router.push("/login")
        return
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router, currentAccount])

  useEffect(() => {
    if (isAuthenticated) {
      async function loadData() {
        const data = await fetchPokemonData()
        setCards(shuffle(data))
      }
      loadData()
    }
  }, [isAuthenticated])

  const handleCardClick = (id: number) => {
    if (clickedIds.has(id)) {
      setScore(0)
      setClickedIds(new Set())
    } else {
      const newClicked = new Set(clickedIds)
      newClicked.add(id)
      setClickedIds(newClicked)
      const newScore = score + 1
      setScore(newScore)
      if (newScore > bestScore) {
        setBestScore(newScore)
        localStorage.setItem("bestScore", newScore.toString())
      }
    }
    setCards((prev) => shuffle(prev))
  }

  const handleLogout = () => {
    if (authMethod === "zklogin") {
      // Clear zkLogin data
      localStorage.removeItem("zklogin_jwt")
      localStorage.removeItem("zklogin_address")
      localStorage.removeItem("zklogin_salt")
      localStorage.removeItem("zklogin_randomness")
      localStorage.removeItem("zklogin_max_epoch")
    } else if (authMethod === "wallet") {
      // Disconnect wallet
      disconnect()
    }
    router.push("/login")
  }

  const resetGame = () => {
    setScore(0)
    setClickedIds(new Set())
    setCards((prev) => shuffle(prev))
  }

  const getUserAddress = () => {
    if (authMethod === "zklogin") {
      return localStorage.getItem("zklogin_address")
    } else if (authMethod === "wallet" && currentAccount) {
      return currentAccount.address
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const userAddress = getUserAddress()

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-bold text-purple-800">Pokemon Memory Game</CardTitle>
                <p className="text-gray-600 mt-1">
                  {authMethod === "zklogin" ? "Authenticated via zkLogin" : "Connected via Wallet"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={resetGame} variant="outline">
                  Reset Game
                </Button>
                <Button onClick={handleLogout} variant="destructive">
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* User Info */}
        {userAddress && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-sm">
                <strong>Address ({authMethod}):</strong>
                <p className="font-mono text-xs break-all text-gray-600">{userAddress}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game */}
        <Scoreboard score={score} bestScore={bestScore} />
        <CardGrid cards={cards} onCardClick={handleCardClick} />
      </div>
    </main>
  )
}
