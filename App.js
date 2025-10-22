import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity,
  Linking, ScrollView, TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

//Função para consumir a API a partir de um endpoint especificado:
function getPokemon(idNome) {
  return fetch(`https://pokeapi.co/api/v2/pokemon/${idNome}/`)
    .then((data) => {
      return data.json();
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
}

//Funções para exibição de assíncronismo:
// async function buscaPokeConsole(idNome) {
//   console.log('Busca iniciada!');
//   const poke = await getPokemon(idNome);
//   console.log('Busca finalizada!');
// }

//buscaPokeConsole(3);
//-------------------------------------


export default function App() {

  //Uso do hook useState para a inicialização de constantes de estado:
  const [pokemonName, setPokemonName] = useState('');
  const [pokemonHeight, setPokemonHeight] = useState('');
  const [pokemonImage, setPokemonImage] = useState('');
  const [pokemonWeight, setPokemonWeight] = useState('');
  const [pokemonId, setPokemonId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isShiny, setIsShiny] = useState(false);
  const [pokemonAbilities, setPokemonAbilities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  //Função assíncrona de busca a partir de ID (chama a função que busca na API e seta as informações de acordo com os estados especificados):
  async function buscarPokemon(id) {
    setIsLoading(true); 
    const pokemon = await getPokemon(id);
    setIsLoading(false); 
    if (!pokemon) {
      setPokemonName('Não encontrado');
      setPokemonHeight('-');
      setPokemonImage('');
      setPokemonWeight('-');
      setPokemonId('-');
      setPokemonAbilities([]);
      return;
    }

    console.log(pokemon);

    setPokemonName(pokemon.name);
    setPokemonHeight(pokemon.height);
    setPokemonWeight(pokemon.weight);
    setPokemonId(pokemon.id);

    //Operador condicional ternário para verificação (é shiny ou não? - se sim, define o sprite shiny para exibição)
    const image = isShiny
      ? pokemon.sprites.front_shiny
      : pokemon.sprites.front_default;

    setPokemonImage(image);
    setPokemonAbilities(pokemon.abilities);
  };

  //Função para redirecionar o usuário até o site específico
  function pressionarBtnHomePokemon() {
    Linking.openURL('https://www.pokemon.com/us');
  };

  //Coloca a inicial do nome do pokemon como maiúscula (vem minúscula da API)
  function inicialMaiuscula(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Atualiza imagem quando muda entre normal e shiny - executa a cada alteração do estado isShiny
  useEffect(() => {
    if (pokemonName) {
      buscarPokemon(pokemonName);
    }
  }, [isShiny]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#000" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image style={styles.imageLogo} source={require('./assets/images/pokemon.png')} />
          <TouchableOpacity onPress={pressionarBtnHomePokemon}>
            <Text style={styles.btnText}>Página Oficial</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.contentContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome ou ID do Pokémon"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => buscarPokemon(searchText)}>
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>

          {/* Shiny - não-shiny */}
          <View style={styles.radioContainer}>
            <TouchableOpacity onPress={() => setIsShiny(false)} style={styles.radioBtn}>
              <View style={[styles.radioCircle, !isShiny && styles.radioSelected]} />
              <Text>Normal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsShiny(true)} style={styles.radioBtn}>
              <View style={[styles.radioCircle, isShiny && styles.radioSelected]} />
              <Text>Shiny</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={styles.loadingText}>Carregando Pokémon...</Text>
            </View>
          ) : (
            <>
              {pokemonImage ? (
                <Image
                  source={{ uri: pokemonImage }}
                  style={styles.pokemonImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ marginTop: 20 }}>Imagem não disponível</Text>
              )}

              <Text style={styles.infoText}>Nome: {inicialMaiuscula(pokemonName)}</Text>
              <Text style={styles.infoText}>#ID: {pokemonId}</Text>
              <Text style={styles.infoText}>Altura: {pokemonHeight}</Text>
              <Text style={styles.infoText}>Peso: {pokemonWeight}</Text>
              <Text style={styles.infoText}>Habilidades:</Text>
              {pokemonAbilities.length > 0 ? (
                pokemonAbilities.map((item, index) => (
                  <Text key={index}>
                    {'\u2022'} {inicialMaiuscula(item.ability.name)} {item.is_hidden ? '(Oculta)' : ''}
                  </Text>
                ))
              ) : (
                <Text>Nenhuma habilidade encontrada.</Text>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  imageLogo: {
    width: 200,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
  },
  scrollViewContainer: {
    backgroundColor: '#f8f8f8',
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    padding: 20,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
    fontSize: 16,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  searchButton: {
    backgroundColor: '#000000ff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: '#7e7e7eff',
  },
  pokemonImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
  },
  loadingContainer: {
    marginTop: 40, 
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10
  }
});
