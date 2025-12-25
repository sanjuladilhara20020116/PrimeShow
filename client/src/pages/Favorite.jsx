import React from "react"; 
import { dummyShowsData } from '../assets/assets';
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';

const Favorite = () => {
  if (dummyShowsData.length === 0) {
    return <p className="text-center mt-20">No movies available</p>;
  }

  return (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px"/>
      <BlurCircle bottom="150px" right="0px"/>

      <h1 className="text-lg font-medium my-4">Now Showing</h1>
      <div className="flex flex-wrap sm:justify-center gap-8">
        {dummyShowsData.map((movie) => (
          <MovieCard movie={movie} key={movie._id}/>
        ))}
      </div>
    </div>
  ) ; (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-center" >No movies avilable</h1>

    </div>
  )
}

export default Favorite;
