// __tests__/getPokemons.test.ts
import { getPokemons } from "@/actions/getPokemons";
import type { Pokemon } from "@/types/pokemon";

// Mock fetch globally
global.fetch = jest.fn();

describe("getPokemons server action", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch a list of Pokémon with details", async () => {
    // Mock list response
    (fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1" },
            { name: "charmander", url: "https://pokeapi.co/api/v2/pokemon/4" },
          ],
        }),
      } as Response)
      // Mock detail for Bulbasaur
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sprites: {
            other: { "official-artwork": { front_default: "bulba.png" } },
            front_default: "bulba_fallback.png",
          },
          types: [{ type: { name: "grass" } }],
          stats: [
            { base_stat: 45 },
            { base_stat: 49 },
            { base_stat: 49 },
            { base_stat: 65 },
            { base_stat: 65 },
            { base_stat: 45 },
          ],
        }),
      } as Response)
      // Mock detail for Charmander
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sprites: {
            other: { "official-artwork": { front_default: "char.png" } },
            front_default: "char_fallback.png",
          },
          types: [{ type: { name: "fire" } }],
          stats: [
            { base_stat: 39 },
            { base_stat: 52 },
            { base_stat: 43 },
            { base_stat: 60 },
            { base_stat: 50 },
            { base_stat: 65 },
          ],
        }),
      } as Response);

    const pokemons: Pokemon[] = await getPokemons();

    expect(pokemons).toHaveLength(2);

    expect(pokemons[0]).toMatchObject({
      name: "Bulbasaur",
      image: "bulba.png",
      types: ["grass"],
      stats: {
        hp: 45,
        attack: 49,
        defense: 49,
        spAtk: 65,
        spDef: 65,
        speed: 45,
      },
    });

    expect(pokemons[1]).toMatchObject({
      name: "Charmander",
      types: ["fire"],
      stats: {
        hp: 39,
        attack: 52,
        defense: 43,
        spAtk: 60,
        spDef: 50,
        speed: 65,
      },
    });
  });

  it("should skip Pokémon if detail fetch fails", async () => {
    (fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1" },
          ],
        }),
      } as Response)
      // Detail fetch fails
      .mockRejectedValueOnce(new Error("Detail fetch failed"));

    const pokemons: Pokemon[] = await getPokemons();

    // Failed Pokémon should be filtered out
    expect(pokemons).toHaveLength(0);
  });

  it("should throw if initial fetch fails", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
    } as Response);

    await expect(getPokemons()).rejects.toThrow("Failed to load Pokémon data");
  });
});
