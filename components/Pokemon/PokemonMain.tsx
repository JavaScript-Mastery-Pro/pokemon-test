"use client";
import { useState } from "react";
import { PokemonCard } from "@/components/Pokemon/PokemonCard";
import { TypeFilter } from "@/components/Filter/TypeFilter";
import { BattleModal } from "@/components/Battle/BattleModal";
import { BattleArena } from "@/components/Battle/BattleArena";
import type { Pokemon } from "@/types/pokemon";

type Props = {
  initialPokemons: Pokemon[];
};

export default function PokemonMain({ initialPokemons }: Props) {
  const [pokemons] = useState(initialPokemons);
  const [selected1, setSelected1] = useState<Pokemon | null>(null);
  const [selected2, setSelected2] = useState<Pokemon | null>(null);
  const [filterType, setFilterType] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = pokemons.filter((p) =>
    filterType === "All" ? true : p.types.includes(filterType.toLowerCase()),
  );

  const typesSet = Array.from(new Set(pokemons.flatMap((p) => p.types)));

  const handlePokemonClick = (pokemon: Pokemon) => {
    // If clicking the same card that's already selected, deselect it
    if (selected1?.id === pokemon.id) {
      setSelected1(null);
      return;
    }
    if (selected2?.id === pokemon.id) {
      setSelected2(null);
      return;
    }

    // If first slot is empty, fill it
    if (!selected1) {
      setSelected1(pokemon);
      return;
    }

    // If second slot is empty, fill it
    if (!selected2) {
      setSelected2(pokemon);
      return;
    }

    // If both are full, replace the second one
    setSelected2(pokemon);
  };

  const handleClearSlot = (slot: 1 | 2) => {
    if (slot === 1) {
      setSelected1(null);
    } else {
      setSelected2(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <BattleArena
          selected1={selected1}
          selected2={selected2}
          onViewAnalysis={() => setIsModalOpen(true)}
          onClearSlot={handleClearSlot}
        />

        {/* Pokemon Selection Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Select Pokémon
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Choose two Pokémon to compare their stats and battle
            </p>
            <TypeFilter
              types={typesSet}
              filterType={filterType}
              setFilterType={setFilterType}
            />
          </div>

          {/* Pokémon Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {filtered.map((p) => {
              const isSelected =
                selected1?.id === p.id || selected2?.id === p.id;
              const isFirst = selected1?.id === p.id;
              return (
                <PokemonCard
                  key={p.id}
                  pokemon={p}
                  isSelected={isSelected}
                  isFirst={isFirst}
                  onClick={() => handlePokemonClick(p)}
                />
              );
            })}
          </div>

          {/* No Pokémon found */}
          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p className="text-muted-foreground text-lg">
                No Pokémon found for this type
              </p>
            </div>
          )}
        </div>
      </main>

      <BattleModal
        selected1={selected1}
        selected2={selected2}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
