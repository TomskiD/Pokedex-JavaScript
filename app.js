const pokeList = document.querySelector('.pokemon-list');
const filterType = document.getElementById('pokemon-filter-type');
const filterEdition = document.getElementById('pokemon-filter-edition');
const pagination = document.getElementById('pagination');
const pokeCache = {}

const editionsOfPokemon = {
    'johto': { from: 152, to: 251 },
    'kanto': { from: 1, to: 151 },
    'hoenn': { from: 252, to: 386 },
};

let typeOfPokemon; 
let edition; 
let currentPage = 1;
let pages;
let elementsPerPage = 12;
let pokemon = [];

const prepareData = () => {

    let data = pokemon;

    if (typeOfPokemon && typeOfPokemon !== '--Choose Pokemon Type--') {
        data = data.filter(x => x.type.includes(typeOfPokemon))
    }

    if (edition && editionsOfPokemon[edition]) {
        data = data.filter(x => x.id >= editionsOfPokemon[edition].from && x.id <= editionsOfPokemon[edition].to)
    }

    const start = (currentPage - 1) * elementsPerPage;
    const end = start + elementsPerPage;
    const pokemonPage = data.slice(start, end);
    pages = Math.floor(data.length / elementsPerPage);
    displayPagination();
    displayPokemon(pokemonPage);
};

const fetchPokemon = () => {

    const promises = [];

    for (let i = 1; i <= 386; i++) {
        const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
        promises.push(fetch(url).then((res) => res.json()));
    }

    Promise.all(promises).then((results) => {
        pokemon = results.map((result) => ({

            name: result.name,
            image: result.sprites['front_default'],
            type: result.types.map((type) => type.type.name).join(', '),
            id: result.id

        }));
        filterType.addEventListener('click', e => {
            e.target.value === 'all' ? typeOfPokemon = null : typeOfPokemon = e.target.value;
            currentPage = 1;
            prepareData();
        });

        filterEdition.addEventListener('click', e => {
            e.target.value === 'all' ? edition = null : edition = e.target.value;
            currentPage = 1;
            prepareData();
        })
    });
};

const displayPagination = () => {
    pagination.innerHTML = "";
    const pagesElements = new Array(pages).fill(null);
    pagesElements[currentPage - 1] = 'active';
    const html = pagesElements.map((className, index) => `<li><a href="#" data-page="${index+1}" class="${className ? className : ''}">${index + 1}</a></li>`);
    pagination.innerHTML = html.join('');

    const buttons = pagination.querySelectorAll("a")
    for (const button of buttons) {
        button.addEventListener('click', function(e) {
            currentPage = parseInt(e.target.dataset.page);
            prepareData();
        })
    }
};
const displayPokemon = (pokemon) => {

    const pokemonCard = pokemon.map((poke) =>
        `
        <li class="card" onclick='choosePokemon(${poke.id})'>
        <img class="card-image" src="${poke.image}"/>
        <h2 class="card-title">${poke.id}. ${poke.name}</h2>
        </li>
        `
        )
        .join('');
    pokeList.innerHTML = pokemonCard;
};

const choosePokemon = async(id) => {
    if (!pokeCache[id]) {
        const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
        const res = await fetch(url);
        const poke = await res.json();
        pokeCache[id] = poke;
        displayPopUp(poke);
    } else {
        displayPopUp(pokeCache[id]);
    }
}

const displayPopUp = (poke) => {
    const type = poke.types.map(type => type.type.name).join(' ');
    const abilities = poke.abilities.map(ability => ability.ability.name).join(' ');
    const image = poke.sprites['front_default'];
    const popup =
    `
    <div class='popUp'>
        <button class='popUp-close' onclick='closePopUp()'> 
        close
        </button>   
        <div class="card-popup" onclick='choosePokemon(${poke.id})'>
            <img class="card-image-popup" src="${image}"/>
            <h2 class="card-title-popup">${poke.id}. ${poke.name}</h2>
            <div class="pokemon-bio"
                <ul>
                    <li>Height: ${poke.height}</li>
                    <li>Weigth: ${poke.weight} lbs.</li>
                    <li>Type: ${type}</li>
                    <li>Abilities: ${abilities}</li>
                </ul>    
            </div>
        </div>
    </div>
    `;
    pokeList.innerHTML = popup + pokeList.innerHTML
}

const closePopUp = () => {
    const popUp = document.querySelector('.popUp');
    popUp.parentElement.removeChild(popUp);
}

fetchPokemon();