"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  try {
    const response = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`);
    // Request to the TVMaze search shows api
    const shows = response.data.map(showData => {
      return {
        id: showData.show.id,
        name: showData.show.name,
        summary: showData.show.summary,
        image: showData.show.image ? showData.show.image.medium : 'https://tinyurl.com/tv-missing'
        // Under image in the console, there was another variation with the property name 'medium'.
      };
      // Make an object with all of the returned information.
    });
    return shows;
    // Return this object.

  } catch(error) {
    alert('Error retrieving shows')
    return [];
  }
  
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);
      // Change src to be the image proptery value and change alt to be the name of the show.
      $showsList.append($show);

      $show.on('click', '.Show-getEpisodes', async function(e) {
        // Place event listener on $show in order to interact with the data inside. Then specify that the button with an id of Show-getEpisodes is the item being selected.
        const $button = $(e.target);
        // Assign the item selected to a variable so the closest property can be used on it.
        const $show = $button.closest('.Show');
        // Select the closest element with an id of Shows (which is the parent element) so the show id can be taken from it.
        const showId = $show.data('show-id');
        // Assing this show id to a variable so it can be passed into the getEpisodesOfShow function.
        const episodes = await getEpisodesOfShow(showId);
        // Only pass in this id and run the function when the episodes button is clicked and the data is run sequentially.
        populateEpisodes(episodes);
        // Run the episdoes of this show through populateEpisodes in order to be added and displayed.
      });
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
// Show episode list ----->   /shows/:id/episodes

async function getEpisodesOfShow(id) {
  try {
    const response = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  // Request episodes data using the given id.
  const episodes = response.data.map(episodeData => {
    return {
      id: episodeData.id,
      name: episodeData.name,
      season: episodeData.season,
      number: episodeData.number
      // Make an object with all of the returned information.
    };
  });
  return episodes;
  // Return this object.
  } catch (error) {
    console.error(error);
    alert('Error retrieving episodes');
    return [];
  }
}

/** Write a clear docstring for this function... */

/** Given the array of episodes, make html for each one and add it to the DOM*/

function populateEpisodes(episodes) {
  const $episodesList = $('#episodesList');
  $episodesList.empty();

  for(let episode of episodes) {
    const $episodeLi = $(`<li>${episode.name} (season ${episode.season}, number${episode.number})</li>`);
    $episodesList.append($episodeLi);
    // Make an li using the episode properties and append it to the episode list.
  }
  $episodesArea.show();
  // Reveal the episodes area since it is initially hidden.
}
