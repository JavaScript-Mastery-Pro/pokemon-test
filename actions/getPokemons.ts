"use server";

import type { Pokemon } from "@/types/pokemon";

export async function getPokemons(): Promise<Pokemon[]> {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=150");

    if (!response.ok) {
      throw new Error("Failed to fetch Pokémon list");
    }

    const data = await response.json();

    // Fetch detailed data for each Pokémon
    const pokemonDetails = await Promise.all(
      data.results.map(
        async (pokemon: { name: string; url: string }, index: number) => {
          try {
            const detailResponse = await fetch(pokemon.url);
            const details = await detailResponse.json();

            return {
              id: index + 1,
              name:
                pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
              image:
                details.sprites.other["official-artwork"].front_default ||
                details.sprites.front_default,
              types: details.types.map(
                (t: { type: { name: string } }) => t.type.name,
              ),
              stats: {
                hp: details.stats[0].base_stat,
                attack: details.stats[1].base_stat,
                defense: details.stats[2].base_stat,
                spAtk: details.stats[3].base_stat,
                spDef: details.stats[4].base_stat,
                speed: details.stats[5].base_stat,
              },
            };
          } catch (error) {
            console.error(
              `Failed to fetch details for ${pokemon.name}:`,
              error,
            );
            return null;
          }
        },
      ),
    );

    return pokemonDetails.filter((p): p is Pokemon => p !== null);
  } catch (error) {
    console.error("Error fetching Pokémon:", error);
    throw new Error("Failed to load Pokémon data");
  }
}
