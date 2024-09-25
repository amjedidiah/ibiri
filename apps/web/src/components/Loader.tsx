import React from 'react';
import Lottie from 'react-lottie-player';
import { LoaderAnim } from '../assets';

const Loader = () => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-primary-bg overflow-hidden">
      <Lottie
        loop
        animationData={LoaderAnim}
        play
        style={{ width: 400, height: 400 }}
      />
      <h2 className="text-md md:text-2xl text-white font-semibold animate-pulse text-center">
        Crunching the numbers, please hold on! 😀
      </h2>
    </div>
  );
};

export default Loader;
