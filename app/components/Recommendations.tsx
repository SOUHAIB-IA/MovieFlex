import Image from "next/image";
import axios from "axios";
import { MovieCard } from "./MovieCard";
import { getServerSession } from "next-auth";
import { authOptions } from "../utils/auth";
import prisma from "../utils/db";
require('dotenv').config();


const TMDB_API_TOKEN = process.env.API_KEY;
const TMDB_API_BASE_URL = process.env.TMDB_API_BASE_URL;
const MODEL_LINK= process.env.MODEL_LINK

async function getWatchlistMovies(userId: string) {
  const watchlistMovies = await prisma.watchList.findMany({
    where: { userId },
    select: {
      Movie: { select: { title: true } },
    },
  });
  return watchlistMovies.map((item) => item.Movie?.title ?? ""); 
}


async function getMoviesFromDatabase(titles: string[]) {
  return prisma.movie.findMany({
    where: { title: { in: titles } },
  });
}


async function getMovieFromTMDB(title: string) {
  try {
    const response = await axios.get(`${TMDB_API_BASE_URL}/search/movie`, {
      headers: { Authorization: `Bearer ${TMDB_API_TOKEN}` },
      params: { query: title },
    });

    return response.data.results[0]; 
  } catch (error) {
    console.error(`Error fetching movie from TMDB: ${title}`, error);
    return null;
  }
}


async function getRecommendedMovies(movieTitles: string[][]) {
  const recommendedMovieNames: string[] = [];

  
  for (const titles of movieTitles) {
    try {
      const response = await axios.post(`${MODEL_LINK}/recommend`, { title: titles });
      recommendedMovieNames.push(...response.data.recommendations);
    } catch (error) {
      console.error(`Error fetching recommendation for: ${titles}`, error);
    }
  }


  const moviesFromDB = await getMoviesFromDatabase(recommendedMovieNames);
  const foundTitles = moviesFromDB.map((movie) => movie.title);

  // Find missing titles that need to be fetched from TMDB
  const missingTitles = recommendedMovieNames.filter((title) => !foundTitles.includes(title));


  const tmdbMoviesPromises = missingTitles.map((title) => getMovieFromTMDB(title));
  const tmdbMovies = (await Promise.all(tmdbMoviesPromises)).filter(Boolean); // Filter out null results


  return [...moviesFromDB, ...tmdbMovies];
}

// Main Recommendations component
export default async function Recommendations() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email as string;

  
  const watchlistMovieTitles = await getWatchlistMovies(userId);

  // Fetch recommended movies
  const recommendedMovies = await getRecommendedMovies(watchlistMovieTitles as any);

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-8 gap-6">
        {recommendedMovies.map((movie) => (
            <div key={movie.id} className="relative h-48">
              <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path || movie.imageString}`}
                  alt={movie.title}
                  width={500}
                  height={400}
                  className="rounded-sm absolute w-full h-full object-cover"
              />
              <div className="h-60 relative z-10 w-full transform transition duration-500 hover:scale-125 opacity-0 hover:opacity-100">
                <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center border">
                  <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path || movie.imageString}`}
                      alt={movie.title}
                      width={800}
                      height={800}
                      className="absolute w-full h-full -z-10 rounded-lg object-cover"
                  />
                  <MovieCard
                      movieId={movie.id}
                      overview={movie.overview}
                      title={movie.title}
                      youtubeUrl={`https://www.youtube.com/results?search_query=${movie.title} trailer`}
                      watchList={false}
                      key={movie.id}
                      age={movie.adult ? Number("18+") : Number("13+")}
                      time={135}
                      year={new Date(movie.release_date || movie.release).getFullYear()}
                  />
                </div>
              </div>
            </div>
        ))}
      </div>
  );
}
