//Getting the backend wired up for successful api calls 

const $searchInput = document.getElementById('searchInput');

const $searchResults = document.getElementById('searchPageResults');
const $searchStatus = document.getElementById('searchStatus');
const $emptySearch = document.getElementById('emptySearch');
const $searchError = document.getElementById('searchError');
const $sortBookmarks = document.getElementById('sortBookmarks');
const $bookmarkCount = document.getElementById('bookmarkCount');
const $bookmarkList = document.getElementById('bookmarkList');
const $emptyBookmarks = document.getElementById('emptyBookmarks');
const $newHomeHistory = document.getElementById('newHomeHistory');
const $noHomeHistory = document.getElementById('noHomeHistory');


let currentSection = 'home';

const showSection = (name) =>{
  const sections = ['home', 'search', 'bookmark', 'aboutUs'];

  //run a loop on the view sections
  sections.forEach(s => {
    const el = document.getElementById(s + '-section');
    if(el) el.hidden = (s !== name);
  });
document.querySelectorAll('.nav-link').forEach(link => {
  classList.toggle('active', link.dataset.view === name) 
  })

  currentSection = name;

  if(name === 'bookmark-section') renderBookmarksView();
  if(name === 'home') renderHomeView();
}

const search = async() => {
  const query = $searchInput.value.trim();
  const filter = document.getElementById('searchBarFilter').value;

  //reset search
  $searchError.hidden = true;
  $searchStatus.innerHTML = '';


  if(!query){
    $emptySearch.hidden = false;
    $searchStatus.textContent = '';
    return
  }

  $emptySearch.hidden = true;
  $searchStatus.textContent = 'Running Search...';

  try{
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=video&videoDuration=long&maxResults=20&videoEmbeddable=true&order=${order}&part=snippet`);
    if(!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();

    if(!data.items || data.items === 0){
      $searchStatus.textContent = "No results found";
      return
    }

    $searchStatus.textContent = `${data.items.length} result${data.items.length 1 ? '' : 's'}`
    

    data.items.forEach(item => {
      $searchPageResults.appendChild(buildResultCard(item, false))
    })

    recordSearchHistory(query)
  } catch(err){
    consol.error('Search Failed:', err)
    $searchError.textContent = `Search failed: ${err.message}. Check that the server is running.`
    $searchError.hidden = false;
    $searchStatus.textContent = '';
  }
}

const completeSearch(event){
  event.preventDefault()

  if(currentSection !== 'search') showSection('search');
search()
} 

//Adding contents to cards

const buildResultCard = (newItem, alreadySavedItem) => {
  const videoId = item.id.videoId;
  const { title, channelTitle, thumbnails } = item.snippet;

  return buildCard({
    videoId,
    title,
    channel: channelTitle,
    thumbnail: thumbnails.medium.url,
    saved: isBookmarked(videoId)
  })
}

const buildCard = ({ videoId, title, channel, thumbnail, saved}) => {
  const card = document.createElement('div');
  card.className = 'videoCard';
  card.dataset.videoId = videoId;

  card.innerHTML = `
    <img class="thumnailItem" src="${escapeAttr(thumbnail)}" alt="${escapeAttr(title)" loading="lazy"/>
    <div class="videoBody">
      <h3 class="videoTitle">${escapeHtml(title)}</h3>
      <p class="videoChannel">${escapeHtml(channel)}</p>
      <div class="vidActions">
        <a class="baseBtn watchBtn" href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener">Watch</a>
        <button class="baseBtn saveBtn ${saved ? 'saving..' : ''}"  data-action="save" data-id="${videoId}">
         ${saved ? 'Saved Video' : 'Save'} 
        </button>
      </div>
    </div>
  `
  return card;
}



//Bookmarks



