export interface Pokemon {
    id: number;
    name: string;
    image: string;
  }
  
  export async function fetchPokemonData(limit = 12): Promise<Pokemon[]> {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    const data = await response.json();
    const detailedData = await Promise.all(
      data.results.map(async (pokemon: { url: string }) => {
        const res = await fetch(pokemon.url);
        const pokeDetails = await res.json();
        return {
          id: pokeDetails.id,
          name: pokeDetails.name,
          image: pokeDetails.sprites.front_default,
        };
      })
    );
    return detailedData;
  }
  