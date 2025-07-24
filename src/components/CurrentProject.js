import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import '../styles/CurrentProject.css';

export default function CurrentProject({ projects }) {
    const current = projects.filter(p => p.current);
    return (
        <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            className="current-swiper"
        >
        {current.map(p => (
            <SwiperSlide key={p.id}>
            <div className="cp-card">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
            </div>
            </SwiperSlide>
        ))}
        </Swiper>
    );
}