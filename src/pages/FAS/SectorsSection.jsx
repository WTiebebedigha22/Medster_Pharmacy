import React, { useRef } from 'react';
import styles from './FAS.module.css'
import img8 from "./FAS-img/img-8.jpg"
import img9 from "./FAS-img/img-9.jpg"
import img10 from "./FAS-img/img-10.jpg"
import img11 from "./FAS-img/img-11.jpg"
import img12 from "./FAS-img/img-12.jpg"

const SectorsSection = () => {
  const sliderRef = useRef(null);
  
  const sectors = [
    {
      image: img8,
      type: "SECTOR",
      name: "Affordable Housing",
      desc: "Our sector-leading affordable housing team is multi-disciplinary and primarily focuses on working with local authorities and registered social landlords (housing associations) to deliver innovative solutions."
    },
    {
      image: img9,
      type: "SECTOR",
      name: "Automotive",
      desc: "With a focus on agency, valuation and strategic advice, we provide all things property for the automotive sector."
    },
    {
      image: img10,
      type: "SECTOR",
      name: "Branded Residences",
      desc: "Our branded residences team specialises in delivering boutique luxury to large-scale residential, hotel, marina, golf, mixed-use and integrated resort developments."
    },
    {
      image: img11,
      type: "SECTOR",
      name: "Central London Retail",
      desc: "Whether you're a retailer or an owner in Central London, we can provide leasing, acquisition, consultancy and investment advice."
    },
    {
      image: img12,
      type: "SECTOR",
      name: "Children's Day Nurseries",
      desc: "Tailored advice for operators, lenders and investors in the Children's Day Nursery Sector."
    },
    {
      image: img9,
      type: "SECTOR",
      name: "Data Centres",
      desc: "With the rise in data storage increasing exponentially in the last decade, data centres are the key to the internet and increasing our global storage capacity."
    },
    {
      image: img11,
      type: "SECTOR",
      name: "Education",
      desc: "Working across commercial, residential and rural markets, we offer a range of tailored services for education providers."
    },
    {
      image: img8,
      type: "SECTOR",
      name: "Energy & Sustainability",
      desc: "Get expert guidance on everything from the inception, funding, valuation, planning, development, management and trading of energy assets."
    },
    {
      image: img12,
      type: "SECTOR",
      name: "Estates",
      desc: "From 50 to 5000 acres, our national team of over 300 experts know how to make your estate succeed."
    },
    {
      image: img10,
      type: "SECTOR",
      name: "Food & Farming",
      desc: "Support and guidance for food and farming businesses, drawing on a range of specialist management and consultancy services."
    },
    {
      image: img9,
      type: "SECTOR",
      name: "Forestry",
      desc: "Get advice on any aspect of commercial forestry and woodland management, however large or small."
    },
    {
      image: img8,
      type: "SECTOR",
      name: "Garden Centres",
      desc: "Our Leisure and Trading team provide specialist advice to operators, investors and lenders within the garden centre sector."
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
    <section id="sectors" className={styles['se-section']}>
      <div className={styles['se-header']}>
        <h1 className={styles['se-heading']}>Sectors</h1>
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
          {sectors.map((sector, index) => (
            <div 
              key={index} 
              className={styles['se-card']} 
              style={{backgroundImage: `url(${sector.image})`}}
            >
              <div className={styles['se-card-content']}>
                <div className={styles['se-type']}>{sector.type}</div>
                <div className={styles['se-name']}>{sector.name}</div>
                <div className={styles['se-desc']}>{sector.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectorsSection;