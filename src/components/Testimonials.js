import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/Testimonials.css';
import testimonials from '../data/testimonials.json';

export default function Testimonials() {
    return (
        <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="testi-swiper"
        >
        {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
            <div className="testi-card">
                <blockquote>“{t.text}”</blockquote>
                <cite>— {t.author}</cite>
            </div>
            </SwiperSlide>
        ))}
        </Swiper>
    );
}