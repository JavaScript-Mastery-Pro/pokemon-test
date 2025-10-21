"use server";

import type {
  Pokemon,
  PokemonListResponse,
  PokemonDetailResponse,
  TypeDetailResponse,
  TypePokemonEntry,
  PokemonTypeResponse,
} from "@/types/pokemon";

const POKEMON_LIMIT = 20;

function extractPokemonStats(details: PokemonDetailResponse) {
  return {
    hp: details.stats[0].base_stat,
    attack: details.stats[1].base_stat,
    defense: details.stats[2].base_stat,
    spAtk: details.stats[3].base_stat,
    spDef: details.stats[4].base_stat,
    speed: details.stats[5].base_stat,
  };
}

function extractPokemonImage(details: PokemonDetailResponse): string {
  return (
    details.sprites.other["official-artwork"].front_default ||
    details.sprites.front_default ||
    ""
  );
}

function extractPokemonTypes(details: PokemonDetailResponse): string[] {
  return details.types.map((t) => t.type.name);
}

export async function getPokemons(): Promise<Pokemon[]> {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=150");

    if (!response.ok) {
      throw new Error("Failed to fetch Pokémon list");
    }

    const data: PokemonListResponse = await response.json();

    // Fetch detailed data for each Pokémon
    const pokemonDetails = await Promise.all(
      data.results.map(async (pokemon, index) => {
        try {
          const detailResponse = await fetch(pokemon.url);
          const details: PokemonDetailResponse = await detailResponse.json();

          return {
            id: index + 1,
            name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
            image: extractPokemonImage(details),
            types: extractPokemonTypes(details),
            stats: extractPokemonStats(details),
          };
        } catch {
          return null;
        }
      }),
    );

    return pokemonDetails.filter((p): p is Pokemon => p !== null);
  } catch (error) {
    throw new Error("Failed to load Pokémon data");
  }
}

export async function getPokemonsPaginated(
  limit = POKEMON_LIMIT,
  offset = 0,
): Promise<Pokemon[]> {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Pokémon list");
    }

    const data: PokemonListResponse = await response.json();

    // Fetch detailed data for each Pokémon in parallel
    const pokemonDetails = await Promise.all(
      data.results.map(async (pokemon, index) => {
        try {
          const detailResponse = await fetch(pokemon.url);
          const details: PokemonDetailResponse = await detailResponse.json();

          return {
            id: offset + index + 1,
            name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
            image: extractPokemonImage(details),
            types: extractPokemonTypes(details),
            stats: extractPokemonStats(details),
          };
        } catch {
          return null;
        }
      }),
    );

    return pokemonDetails.filter((p): p is Pokemon => p !== null);
  } catch (error) {
    throw new Error("Failed to load Pokémon data");
  }
}

export async function getPokemonsByTypePaginated(
  type: string,
  limit = POKEMON_LIMIT,
  offset = 0,
): Promise<Pokemon[]> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch Pokémon of type ${type}`);
    }

    const data: TypeDetailResponse = await response.json();

    // Get the paginated slice of Pokemon for this type
    const paginatedPokemon = data.pokemon.slice(offset, offset + limit);

    // Fetch detailed data for each Pokémon
    const pokemonDetails = await Promise.all(
      paginatedPokemon.map(async (p: TypePokemonEntry) => {
        try {
          const detailResponse = await fetch(p.pokemon.url);
          const details: PokemonDetailResponse = await detailResponse.json();

          return {
            id: details.id,
            name:
              p.pokemon.name.charAt(0).toUpperCase() + p.pokemon.name.slice(1),
            image: extractPokemonImage(details),
            types: extractPokemonTypes(details),
            stats: extractPokemonStats(details),
          };
        } catch {
          return null;
        }
      }),
    );

    return pokemonDetails.filter((p): p is Pokemon => p !== null);
  } catch (error) {
    throw new Error(`Failed to load Pokémon of type ${type}`);
  }
}

export async function getPokemonTypeCount(type: string): Promise<number> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch type ${type}`);
    }

    const data: TypeDetailResponse = await response.json();
    return data.pokemon.length;
  } catch {
    return 0;
  }
}

export async function getTotalPokemonCount(): Promise<number> {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1");

    if (!response.ok) {
      throw new Error("Failed to fetch Pokémon count");
    }

    const data: PokemonListResponse = await response.json();
    return data.count;
  } catch {
    return 0;
  }
}

export async function getAllPokemonTypes(): Promise<string[]> {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/type?limit=100");

    if (!response.ok) {
      throw new Error("Failed to fetch types");
    }

    const data: PokemonTypeResponse = await response.json();
    return data.results.map((t) => t.name).sort();
  } catch {
    throw new Error("Failed to load Pokemon types");
  }
}

// Fetch a page of Pokémon (basic info only)
export async function getPokemonsPage(
  limit = POKEMON_LIMIT,
  offset = 0,
): Promise<Omit<Pokemon, "stats" | "image">[]> {
  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
    );
    if (!res.ok) throw new Error("Failed to fetch Pokémon list");

    const data: PokemonListResponse = await res.json();

    return data.results.map((p, idx) => ({
      id: offset + idx + 1,
      name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
      types: [],
      image: "",
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Fetch detailed Pokémon by URL
export async function getPokemonDetails(
  url: string,
): Promise<Partial<Pokemon>> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch Pokémon details");

    const data: PokemonDetailResponse = await res.json();

    return {
      image: extractPokemonImage(data),
      types: extractPokemonTypes(data),
      stats: extractPokemonStats(data),
    };
  } catch (error) {
    console.error(error);
    return {};
  }
}

// Fetch Pokémon by type
export async function getPokemonsByType(
  type: string,
): Promise<Omit<Pokemon, "stats" | "image">[]> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    if (!res.ok) throw new Error(`Failed to fetch Pokémon of type ${type}`);

    const data: TypeDetailResponse = await res.json();

    return data.pokemon.map((p: TypePokemonEntry, idx) => ({
      id: idx + 1,
      name: p.pokemon.name.charAt(0).toUpperCase() + p.pokemon.name.slice(1),
      types: [type],
      image: "",
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Fetch full Pokémon data (with stats and image) for a given list
export async function populatePokemonDetails(
  pokemons: Omit<Pokemon, "stats" | "image">[],
): Promise<Pokemon[]> {
  const results = await Promise.all(
    pokemons.map(async (p) => {
      try {
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${p.name.toLowerCase()}`,
        );
        const data: PokemonDetailResponse = await res.json();
        return {
          ...p,
          image: extractPokemonImage(data),
          stats: extractPokemonStats(data),
          types: extractPokemonTypes(data),
        } as Pokemon;
      } catch (err) {
        console.error(`Failed to fetch details for ${p.name}`, err);
        return null;
      }
    }),
  );

  return results.filter((p): p is Pokemon => p !== null);
}
