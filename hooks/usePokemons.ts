"use client"

import { useState, useEffect } from "react"

export interface Pokemon {
  id: number
  name: string
  image: string
  types: string[]
  stats: {
    hp: number
    attack: number
    defense: number
    spAtk: number
    spDef: number
    speed: number
  }
}

export function usePokemons() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch first 150 Pokémon
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=150")
        const data = await response.json()

        // Fetch detailed data for each Pokémon
        const pokemonDetails = await Promise.all(
          data.results.map(async (pokemon: { name: string; url: string }) => {
            const res = await fetch(pokemon.url)
            const details = await res.json()

            return {
              id: details.id,
              name: details.name.charAt(0).toUpperCase() + details.name.slice(1),
              image: details.sprites.other["official-artwork"].front_default || details.sprites.front_default,
              types: details.types.map((t: { type: { name: string } }) => t.type.name),
              stats: {
                hp: details.stats[0].base_stat,
                attack: details.stats[1].base_stat,
                defense: details.stats[2].base_stat,
                spAtk: details.stats[3].base_stat,
                spDef: details.stats[4].base_stat,
                speed: details.stats[5].base_stat,
              },
            }
          }),
        )

        setPokemons(pokemonDetails)
      } catch (err) {
        setError("Failed to load Pokémon data. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPokemons()
  }, [])

  return { pokemons, loading, error }
}
