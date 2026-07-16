import React, { useRef } from 'react';
import styles from './FAS.module.css'
import img1 from "./FAS-img/img-1.jpg"
import img2 from "./FAS-img/img-2.jpg"
import img3 from "./FAS-img/img-3.jpg"
import img4 from "./FAS-img/img-4.jpg"
import img5 from "./FAS-img/img-5.jpg"
import img6 from "./FAS-img/img-6.jpg"
import img7 from "./FAS-img/img-7.jpg"

const ServicesSection = () => {
  const sliderRef = useRef(null);
  
  const services = [
    {
      image: img1,
      type: "SERVICE",
      name: "Asset Management",
      count: "Contains 6 services",
      desc: "Develop a strategic framework for appraising and making decisions on your property."
    },
    {
      image: img2,
      type: "SERVICE",
      name: "Buying or Selling",
      count: "Contains 31 services",
      desc: "Get expert local knowledge and global expertise across all residential, rural and commercial markets."
    },
    {
      image: img3,
      type: "SERVICE",
      name: "Consultancy",
      count: "Contains 60 services",
      desc: "Get bespoke advice, drawing on industry knowledge, experience and the latest market trends."
    },
    {
      image: img4,
      type: "SERVICE",
      name: "Development",
      count: "Contains 25 services",
      desc: "From valuation, land sales and acquisitions, through to funding and portfolio support, we can offer advice accross the entire development lifecycle."
    },
    {
      image: img5,
      type: "SERVICE",
      name: "Finance",
      count: "Contains 12 services",
      desc: "Be empowered to make decisions based on market insights, with a dedicated team covering all areas of financial advice."
    },
    {
      image: img6,
      type: "SERVICE",
      name: "Investment",
      count: "Contains 22 services",
      desc: "With specialists placed across every property sector, we can advise on investment opportunities in all corners of the market."
    },
    {
      image: img7,
      type: "SERVICE",
      name: "Letting or Renting",
      count: "Contains 17 services",
      desc: "Whether you want to let your home, invest in a buy-to-let property, acquire office space or rent your first home, we're here to help."
    },
    {
      image: img3,
      type: "SERVICE",
      name: "Occupier Services",
      count: "Contains 7 services",
      desc: "If you occupy property but don't work in the industry, our global team can offer a range of service options to help you succeed."
    },
    {
      image: img2,
      type: "SERVICE",
      name: "Planning",
      count: "Contains 23 services",
      desc: "Planning forms the start of every project. Our consultants can advise and guide you through the various and complex stages."
    },
    {
      image: img1,
      type: "SERVICE",
      name: "Property Management",
      count: "Contains 38 services",
      desc: "Whatever the type of property, and wherever it is, our expert team can save you time and stress with our comprehens…"
    },
    {
      image: img7,
      type: "SERVICE",
      name: "Research",
      count: "Contains 4 services",
      desc: "With specialists in commercial, residential, and rural property throughout the UK and across the globe, we're thought leaders in property research."
    },
    {
      image: img5,
      type: "SERVICE",
      name: "Valuation",
      count: "Contains 38 services",
      desc: "Get an honest valuation of your property, with expert advice on how to achieve the best price."
    }
  ];

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className={styles['se-section']}>
      <div className={styles['se-header']}>
        <h1 className={styles['se-heading']}>Services</h1>
        <div className={styles['slider-controls']}>
          <button className={styles['slider-btn']} onClick={scrollLeft} aria-label="Scroll left">
            &lt;
          </button>
          <button className={styles['slider-btn']} onClick={scrollRight} aria-label="Scroll right">
            &gt;
          </button>
        </div>
      </div>
      <div className={styles['se-slider-container']}>
        <div className={styles['se-slider']} ref={sliderRef}>
          {services.map((service, index) => (
            <div 
              key={index} 
              className={styles['se-card']} 
              style={{backgroundImage: `url(${service.image})`}}
            >
              <div className={styles['se-card-content']}>
                <div className={styles['se-type']}>{service.type}</div>
                <div className={styles['se-name']}>{service.name}</div>
                <div className={styles['se-count']}>{service.count}</div>
                <div className={styles['se-desc']}>{service.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;