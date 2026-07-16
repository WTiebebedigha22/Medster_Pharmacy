import React from 'react'
import styles from '../MYP/MYP.module.css'
  import image1 from '../MYP/adam-winger-t4oVP2xFMJ8-unsplash.jpg'
    import image2 from '../MYP/Screenshot_31-8-2025_583_www.savills.co.uk.jpeg'
      import image3 from '../MYP/Screenshot_31-8-2025_5453_www.savills.co.uk.jpeg'
        import image4 from '../MYP/Screenshot_31-8-2025_5649_www.savills.co.uk.jpeg'
// /Images/MYP/.....


import PropertySwiper from '../../components/CardSlider/Cardslider'
const MYP = () => {

  return (
    <div className={styles['headcontainer']}>
    <div className={styles['container']}>
      <div className=''>
      <p className={styles['heading']}>Market Your Property</p><br />
      <p className={styles['heading2']}>From country cottages to city offices, agricultural land to new-build developments, we’ll help you find the right buyer or <br /> tenant for your property. Whether it’s selling, renting or just finding our how much your property is worth, we’ll act as your <br /> trusted advisors throughout the whole process.</p>
 
 <div className={styles['container2']}>

  <div className={styles['grid-1']}>
<span className={styles['text1']}>Know your property’s value </span><br />
<p className={styles['p1']}>Book a no obligation valuation with one of our local experts to <br /> understand what your property could be worth. Prefer virtual? <br /> We can do that too.</p>
<span className={styles['text2']}>Book a valuation </span>
  </div>
  <div className={styles['grid-2']}>
    <img src={image1} alt=""  />
  </div>
 </div>
<hr />
 <div className={styles['container3']}>
  <div>
<img src={image2} alt="" /><br />
<span className={styles['text3']}>The most-visited website</span> <br />
With over 2.9 million visits per montht, we are the most <br /> visited UK national estate agency websitet.We get more eyes  on your place or space than anyone else
  </div>
  <div className={styles['grid-3']}>
<img src={image3} alt="" /><br />
<span className={styles['text4']}> 170 years of experience</span> <br />
We’ve helped sell every kind of property you can think <br /> of, building a deep, strategic understanding to get you the best  value.
  </div>
  <div>
    <img src={image4} alt="" /><br />
<span className={styles['text3']}>   Global coverage</span> <br />
Attract interest from across the globe. Our network spans <br /> more than 70 countries with over 42,000 employees, giving you access to the best buyers and tenants.
  </div>
 </div>

 <div className={styles['container4']}>

<div>
<p>How can we help you</p>
<div className={styles['grid-5']}>
  <div className={styles['box1']}>
<span className={styles['box-text']}>service</span> <br />
  <h2>
    Selling a <br />
  residential property <br />
  </h2>
<span className={styles['box-text-2']}>  From advising on how to get set for viewings, to negotiating the final sale, we'll guide you every step of the way. Savills</span>


</div>
<div className={styles['box2']}>
<span className={styles['box-text']}>service</span> <br />
  <h2>
    Selling a <br />
  commercial property <br />
  </h2>
<span className={styles['box-text-2']}>Get support at every stage across all markets,including industrial, offices, retail and studentaccommodation.</span>

</div>
<div className={styles['box3']}>
<span className={styles['box-text']}>service</span> <br />
  <h2>
    Selling a <br />
  farm or rural land <br />
  </h2>
<span className={styles['box-text-2']}> With rich knowledge of the market and its trends,we'll help you achieve the best potential value for your property or land.</span>

</div>
<div className={styles['box4']}>
<span className={styles['box-text']}>service</span> <br />
  <h2>
    Letting a <br />
  residential property <br />
  </h2>
<span className={styles['box-text-2']}> Whether you’re letting your home, investing in a buy-to-let property or looking for advice on the latest legislation, we can support you on the whole landlo…

Savills</span>

</div>
<div className={styles['box5']}>
<span className={styles['box-text']}>service</span> <br />
  <h2>
    Leasing a <br />
  commercial property <br />
  </h2>
<span className={styles['box-text-2']}>  Benefit from informed, bespoke advice on all aspects of the commercial transaction process.

Savills</span>

</div>
<div className={styles['box6']}>
<span className={styles['box-text']}>service</span> <br />
  <h2>
    Selling a <br />
   property at auction <br />
  </h2>
<span className={styles['box-text-2']}>  From appraisal and appointment to exchange and completion, our auction team provides dedicated guidance and advice.</span>

</div>
</div>
</div>
</div>
<div className={styles['btn-container']}>
<a href="#"><button className={styles['btn']}>Explore all Tunde Esoula & Co. service</button></a>
</div>


</div>
 </div>
<div className= {styles['container5']}>
<span className={styles['container5-text1']}>Recently Sold</span><br />
<span className={styles['container5-text2']}>Tilford, Farnham</span><br />
Tilford Barrows is an impressive country house understood to have been built in 1883. Set in <br /> about 10 acres and facing south with the potential of good views, the house sits in a very desirable <br /> spot, tucked away in a secluded woodland setting between Elstead and Tilford. <br />
<button className={styles['tiffbtn']}><a href="#">View this property</a></button>
</div>

<div className={styles['container6']}>

  <div className={styles['container6-box1']}>
    Recently sold properties
  </div>
   <div>
    <button className={styles['btn2']}><a href="#">view more sold properties</a></button>
  </div>
</div>

<div className=''>
<PropertySwiper />
</div>

<div className= {styles['container7']}>

<span className={styles['container5-text2']}>Wondering what it’s worth?</span><br />
<span className={styles['container5-text3']}>There’s so much more to selling than an asking price. Our expert local agents can help value your <br /> property and help you find the right person to take it on, tapping into our global network of <br /> engaged buyers and tenants.</span><br />



</div>
      </div>

   
  )
}

export default MYP