import Image from "next/image";
import prisma from "../utils/db";
import axios from "axios";
import { MovieCard } from "./MovieCard";
import { getServerSession } from "next-auth";
import { authOptions } from "../utils/auth";

// Fetch movies from the Watchlist table
async function getWatchlistMovies(userId: string) {
  const watchlistMovies = await prisma.watchList.findMany({
    where: {
      userId: userId,
    },
    select: {
      Movie: {
        select: {
          title: true, // Get only the movie titles
        },
      },
    },
  });

  return watchlistMovies.map((item) => item.Movie?.title ?? ""); // Ensure the movie title exists
}


// Fetch recommended movies from the API and retrieve their details
async function getRecommendedMovies(movieTitles: string[][]) {
  const recommendedMovieNames = [];

  // Send each movie title to the recommendation API
  for (const titles of movieTitles) {
    try {
      const response = await axios.post("http://127.0.0.1:5000/recommend", { title: titles });
      recommendedMovieNames.push(response.data.recommendations); // Assuming the response has a field `movieName`
    } catch (error) {
      console.error(`Error fetching recommendation for movie: ${titles}`, error);
    }
  }

  // Flatten the array to avoid the Prisma error
  const flatRecommendedMovieNames = recommendedMovieNames.flat();

  // Fetch recommended movies from the database based on names
  const recommendedMovies = await prisma.movie.findMany({
    where: {
      title: {
        in: flatRecommendedMovieNames, // Pass the flattened array here
      },
    },
    select: {
      id: true,
      overview: true,
      title: true,
      imageString: true,
      youtubeString: true,
      age: true,
      release: true,
      duration: true,
      WatchLists: true, // Fetch WatchLists for the movie
    },
  });

  return recommendedMovies;
}


export default async function Recommendations() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email as string;

  // Fetch movies from the user's watchlist
  const watchlistMovieTitles = await getWatchlistMovies(userId);

  // Fetch recommended movies based on the watchlist
  const recommendedMovies = await getRecommendedMovies(watchlistMovieTitles);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-8 gap-6">
      {recommendedMovies.map((movie) => {
        const watchListEntry = movie.WatchLists.find((wl) => wl.userId === userId);

        return (
          <div key={movie.id} className="relative h-48">
            <Image
              src={movie.imageString}
              alt="Movie"
              width={500}
              height={400}
              className="rounded-sm absolute w-full h-full object-cover"
            />
            <div className="h-60 relative z-10 w-full transform transition duration-500 hover:scale-125 opacity-0 hover:opacity-100">
              <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center border">
                <Image
                  src={movie.imageString}
                  alt="Movie"
                  width={800}
                  height={800}
                  className="absolute w-full h-full -z-10 rounded-lg object-cover"
                />
                <MovieCard
                  movieId={movie.id}
                  overview={movie.overview}
                  title={movie.title}
                  youtubeUrl={movie.youtubeString}
                  watchList={!!watchListEntry} // Boolean indicating if it's in the user's watchlist
                  wachtListId={watchListEntry?.id} // Pass the watchListId if available
                  key={movie.id}
                  age={movie.age}
                  time={movie.duration}
                  year={movie.release}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
