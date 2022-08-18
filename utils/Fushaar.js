import axios from "axios";
export async function searchMovie(query) {
  const { data } = await axios.get(
    `https://www.fushaar.com/?s=${encodeURIComponent(query)}`
  );
  return data
    .split('article class="poster"')
    .slice(1)
    .map((movie) => ({
      title: movie.split("<h3>")[1].split("</h3>")[0],
      url: movie.split('href="')[1].split('"')[0],
      art: movie.split('data-lazy-src="')[1].split('"')[0],
      ar_title: movie.split("<h4>")[1].split("</h4>")[0],
      genres: movie
        .split('itemprop="genre"')
        .slice(1)
        .map((genre) => ({
          url: genre.split('href="')[1].split('"')[0],
          title: genre.split(">")[1].split("</a")[0],
        })),
      year: movie.split('year">')[1].split("</li>")[0],
      pg: movie.split("li")[3].split("</li")[0].slice(1, -2),
      translated: movie.split("li")[5].split("</li")[0].slice(1, -2) == "مترجم",
    }));
}

export async function getMovieData(url) {
  const { data } = await axios.get(url);
  return {
    title: data.split("<span>")[1].split("</span>")[0],
    ar_title: data.split('<h2 class="cemter">')[1].split("</h2>")[0],
    year: data.split('<span class="yearz">(')[1].split(")</span>")[0],
    genres: data
      .split('<div class="gerne">')[1]
      .split('itemprop="genre"')
      .slice(1)
      .map((genre) => ({
        url: genre.split('href="')[1].split('"')[0],
        title: genre.split('">')[1].split("</a>")[0],
      })),
    length: data.split('info-boxy">')[1].split("<span")[0],
    pg: data.split('info-boxy">')[2].split("<span")[0],
    quality: data.split('info-boxy">')[3].split("<span")[0],
    banner: data.split("background: url(")[1].split(")")[0],
    art: data
      .split('<figure class="poster">')[1]
      .split('data-lazy-src="')[1]
      .split('"')[0],
    rating: data.split('<div class="imdb">')[1].split("</div>")[0],
    description: data
      .split('<div class="postz" >')[1]
      .split("<p>")[1]
      .split("<")[0],
    watch: data
      .split(
        'data-lazy-src="https://www.fushaar.com/assets/themes/fushaarV5/player.php?id='
      )[1]
      .split('"')[0],
  };
}
