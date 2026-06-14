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
const $homeBookmarks = document.getElementById('homeBookmarks');
const $noHomeBookmarks = document.getElementById('noHomeBookmarks');
const $newHomeHistory = document.getElementById('newHomeHistory');
const $noHomeHistory = document.getElementById('noHomeHistory');


let currentSection = 'home';

//---------------------- Nav ----------------------------------------

const showSection = (name) =>{
  const sections = ['home', 'search', 'bookmark', 'aboutUs'];

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

//---------------------------- Search ---------------------------------

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

//---------------------------Adding contents to cards---------------------------

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
        <button class="baseBtn saveBtn ${saved ? 'isSaved' : ''}"  data-action="save" data-id="${videoId}">
          ${saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
    </div>
  `
  return card;
}



//------------------------------Check Bookmarks----------------------------
const STORAGE_KEY = 'echotube-bookmarks';
const HISTORY_KEY = 'echotube-history';


const getBookmarks = () => {
  try{
    const rawData = localStorage.getItem(STORAGE_KEY);
    return rawData  ? JSON.parse(rawData) : []
  } catch(e){
    console.warn('Bookmarks in local storage may be corrupted:', e);
    return []
  }
}


const saveBookmark = (bookmark) => {localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))};

const isBookmarked = (videoId) => {return.getBookmarks().some(b => b.videoId === videoId)};

const addBookmark = ({ videoId, title, channel, thumbnail }) => {
  if(isBookmarked(videoId)) return;
  const bookmarks = getBookmarks();
  bookmarks.push({ videoId, title, channel, thumbnail, savedAt: Date.now() })
  saveBookmark(bookmarks);
}

//----------------------------Check History----------------------------------

const getHistory = () =>{
  try{
    const rawData = localStorage.getItem(HISTORY_KEY);
    return rawData ? JSON.parse(rawData) : [];
  } catch(e) { return [] };
}

const recordSearchHistory = (query) =>{
  const history = getHistory()
  const filterHistory = history.filter(h => h.toLowerCase() !== query.toLowerCase())
  filterHistory.unshift(query)

  saveHistory(filterHistory.slice(0, 10))
}

const saveHistory = (history) => { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)) };


//------------------------ Bookmark Section -----------------------------------

const renderBookmarkSection = () => {
  const bookmarks = getBookmarks();
  const sortValue = $bookmarkSort.value;
  const [field, dir] = sortValue.split((a, b) => {
    let cmp = 0;
    if(field === 'savedAt') cmp = a.savedAt - b.savedAt
    if(field === 'title') cmp = a.title.localeCompare(b.title);
    return dir === 'desc' ? -cmp : cmp
  })

  $bookmarkList.innerHTML = '';
  if(sorted.length === 0){
    $emptyBookmarks.hidden = false;
    $bookmarkCount.textContent = '';
    return
  }
  $emptyBookmarks.hidden = true;
  $bookmarkCount.textContent = `${sorted.length} video${sorted.length === 1 ? '' : 's'} saved`

  sorted.forEach(b => {
    const card = buildCard({ ...b, saved: true })

    const saveBtn = card.querySelector('[data-action="save"]')
    saveBtn.className = 'baseBtn rmBtn';
    saveBtn.dataset.action = 'rm';
    saveBtn.textContent = 'Remove';
    $bookmarkList.appendChild(card);
  })
}

const renderHomeSection = () => {
  const recent = getBookmarks()
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, 6)
  $homeBookmarks.innerHTML = '';
  if(recent.length === 0){
    $noHomeBookmarks.hidden = false;
  } else {
    $noHomeBookmarks.hidden = true;
    recent.forEach(b => {
      $homeBookmarks.appendChild(buildCard({ ...b, saved: true }))
    })
  }


  const history = getHistory()
  $newHomeHistory.innerHTML = ''
  if(history.length === 0){
    $noHomeHistory.hidden = false 
  } else {
    $noHomeHistory.hidden = true;
    history.forEach(q => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.type = 'button';
      chip.textContent = q
      chip.onClick = () => {
        $searchInput.value = q
        showSection('search')
        search();
      }
      $newHomeHistory.appendChild(chip);
    })
  }
}


//--------------------------- event handlers --------------------------------------------

document.body.addEventListener('click', e => {
  const saveBtn = e.target.closest('[data-action="save"]');
  if(saveBtn){
    const card = saveBtn.closest('.videoCard');
    if(!card) return;
    const id = saveBtn.dataset.id;
    if(isBookmarked(id)) return
    
    addBookmark({
      videoId: id,
      title: card.querySelector('.videoTitle').textContent,
      channel: card.querySelector('.videoChannel').textContent,
      thumbnail: card.querySelector('.thumbnail').src
    })
    saveBtn.classList.add('saved')
    saveBtn.textContent = '✓ Saved'
    return
  }

  const rmBtn = e.target.closest('[data-action="rm"]')
  if(rmBtn){
    const id = rmBtn.dataset.id;
    rmBookmark(id)
    if(currentSection === 'bookmarks') renderBookmarkSection();
    if(currentSection === 'home') renderHomeView();
  }
})


// ------------------------ Html Escape ------------------------------------

const escapeHtml = (str) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
const escapeAttr(str){
  return escapeHtml(str)
}


//------------------------- Init Render --------------------------------------
showSection('home')
