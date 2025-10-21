import { http, HttpResponse } from "msw";
const mockPokemonTypes = {
  results: [
    { name: "normal" },
    { name: "fire" },
    { name: "water" },
    { name: "electric" },
    { name: "grass" },
    { name: "ice" },
    { name: "fighting" },
    { name: "poison" },
    { name: "ground" },
    { name: "flying" },
    { name: "psychic" },
    { name: "bug" },
    { name: "rock" },
    { name: "ghost" },
    { name: "dragon" },
    { name: "dark" },
    { name: "steel" },
    { name: "fairy" },
  ],
};

// Minimal mock for first few Pokémon
const mockPokemonList = {
  results: [
    { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1" },
    { name: "charmander", url: "https://pokeapi.co/api/v2/pokemon/4" },
  ],
};

const mockBulbasaurDetails = {
  sprites: {
    other: {
      "official-artwork": {
        front_default: "https://example.com/bulbasaur.png",
      },
    },
    front_default: "https://example.com/bulbasaur-small.png",
  },
  types: [{ type: { name: "grass" } }, { type: { name: "poison" } }],
  stats: [45, 49, 49, 65, 65, 45].map((v) => ({ base_stat: v })),
};

const mockCharmanderDetails = {
  sprites: {
    other: {
      "official-artwork": {
        front_default: "https://example.com/charmander.png",
      },
    },
    front_default: "https://example.com/charmander-small.png",
  },
  types: [{ type: { name: "fire" } }],
  stats: [39, 52, 43, 60, 50, 65].map((v) => ({ base_stat: v })),
};

export const handlers = [
  // Pokemon list
  http.get("https://pokeapi.co/api/v2/pokemon", () => {
    return HttpResponse.json(mockPokemonList);
  }),

  // Pokemon types
  http.get("https://pokeapi.co/api/v2/type", () => {
    // const url = new URL(req.request.url);
    // const limit = url.searchParams.get("limit");
    return HttpResponse.json(mockPokemonTypes);
  }),

  // Specific Pokemon details
  http.get("https://pokeapi.co/api/v2/pokemon/1", () => {
    return HttpResponse.json(mockBulbasaurDetails);
  }),
  http.get("https://pokeapi.co/api/v2/pokemon/4", () => {
    return HttpResponse.json(mockCharmanderDetails);
  }),

  // Optional: catch-all for type/:typeName if needed
  http.get("https://pokeapi.co/api/v2/type/:typeName", () => {
    return HttpResponse.json({
      pokemon: [
        {
          pokemon: {
            name: "bulbasaur",
            url: "https://pokeapi.co/api/v2/pokemon/1",
          },
        },
        {
          pokemon: {
            name: "charmander",
            url: "https://pokeapi.co/api/v2/pokemon/4",
          },
        },
      ],
    });
  }),
];
