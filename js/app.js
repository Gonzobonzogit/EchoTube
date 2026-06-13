//Getting the backend wired up for successful api calls 

const $searchInput = document.getElementById('searchInput');
const $newHomeHistory = document.getElementById('newHomeHistory');
const $noHomeHistory = document.getElementById('noHomeHistory');
const $searchResults = document.getElementById('searchPageResults');
const $searchStatus = document.getElementById('searchStatus');
const $emptySearch = document.getElementById('emptySearch');
const $searchError = document.getElementById('searchError');
const $sortBookmarks = document.getElementById('sortBookmarks');
const $bookmarkCount = document.getElementById('bookmarkCount');
const $bookmarkList = document.getElementById('bookmarkList');
const $emptyBookmarks = document.getElementById('emptyBookmarks');
const $newHomeBookmarks = document.getElementById('newHomeBookmarks');


let currentView = 'home';

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

  currentView = name;

  if(name === 'bookmark-section') renderBookmarksView();
  if(name === 'home') renderHomeView();
}

const search = () => {
  
}



