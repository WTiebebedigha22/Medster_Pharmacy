import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "../CardSlider/card.css"

const properties = [
  {
    id: 1,
    price: "£650,000",
    status: "RECENTLY SOLD",
    title: "Moore House",
    address: "2 Gatliff Road, Grosvenor Waterside, London, SW1W 8DU",
    size: "771 sq ft",
    beds: 1,
    baths: 1,
    image: "images/MYP/frames-for-your-heart-2d4lAQAlbDA-unsplash.jpg",
  },
  {
    id: 2,
    price: "£375,000",
    status: "SOLD",
    title: "Moreby Hall",
    address: "Escrick, York, North Yorkshire, YO19 6FR",
    size: "1,006 sq ft",
    beds: 2,
    baths: 1,
    image: "images/MYP/pixasquare-4ojhpgKpS68-unsplash.jpg",
  },
  {
    id: 3,
    price: "£650,000",
    status: "SOLD",
    title: "Nursery Road",
    address: "Nether Poppleton, York, North Yorkshire, YO26 6NN",
    size: "1,669 sq ft",
    beds: 5,
    baths: 2,
    image: "images/MYP/todd-kent-178j8tJrNlc-unsplash.jpg",
  },
  {
    id: 4,
    price: "£1,250,000",
    status: "SOLD",
    title: "The View",
    address: "20 Palace Street, Westminster, London, SW1E 5BA",
    size: "987 sq ft",
    beds: 2,
    baths: 2,
    image: "images/MYP/sieuwert-otterloo-aren8nutd1Q-unsplash.jpg",
  },
  {
    id: 5,
    price: "£650,000",
    status: "RECENTLY SOLD",
    title: "Moore House",
    address: "2 Gatliff Road, Grosvenor Waterside, London, SW1W 8DU",
    size: "771 sq ft",
    beds: 1,
    baths: 1,
    image: "images/MYP/abby-rurenko-uOYak90r4L0-unsplash (1).jpg",
  },
  {
    id: 6,
    price: "£650,000",
    status: "RECENTLY SOLD",
    title: "Moore House",
    address: "2 Gatliff Road, Grosvenor Waterside, London, SW1W 8DU",
    size: "771 sq ft",
    beds: 1,
    baths: 1,
    image: "images/MYP/frames-for-your-heart-2d4lAQAlbDA-unsplash.jpg",
  },
  {
    id: 7,
    price: "£650,000",
    status: "RECENTLY SOLD",
    title: "Moore House",
    address: "2 Gatliff Road, Grosvenor Waterside, London, SW1W 8DU",
    size: "771 sq ft",
    beds: 1,
    baths: 1,
    image: "images/MYP/adam-winger-t4oVP2xFMJ8-unsplash.jpg",
  },
];

const PropertySwiper = () => {
  return (
    <div className="property-swiper">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={3}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          320: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {properties.map((property) => (
          <SwiperSlide key={property.id}>
            <div className="property-card">
              <img src={property.image} alt={property.title} />
              <span className="status">{property.status}</span>
              <div className="property-info">
                <h3>{property.price}</h3>
                <h4>{property.title}</h4>
                <p>{property.address}</p>
                <div className="details">
                  <span>{property.size}</span> •{" "}
                  <span>{property.beds} bed</span> •{" "}
                  <span>{property.baths} bath</span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default PropertySwiper;
