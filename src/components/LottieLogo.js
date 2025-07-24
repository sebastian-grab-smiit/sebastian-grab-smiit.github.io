import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import './LottieLogo.css';
import animationData from '../../assets/yourAnimation.json';

export default function LottieLogo() {
    return (
        <Player
            autoplay
            loop
            src={animationData}
            className="lottie-logo"
        />
    );
}