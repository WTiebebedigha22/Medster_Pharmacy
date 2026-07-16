import React from 'react'
import styles from './IAO.module.css'

const IAO = () => {
  return (
    <>
    <section className={styles.hero}>
        <h1>Insight & Opinions</h1>
        <p>Stay informed with the latest trends, expert opinions, and data-driven insights from the real estate market. Whether you're buying, 
            investing, or simply curious, our experts help you make smarter property decisions.</p>
    </section>
    
    <section className={styles.features}>
        <div className={styles['feature-item']}>
            {/* <!-- <span className="material-symbols-outlined">book_4</span> --> */}
            <div className={styles.icon}><i className="fa-solid fa-chart-line"></i></div>
            <h2>Market Analysis</h2>
            <p>In-depth market trends and data-driven insights to help you make informed decisions.</p>
        </div>
        <div className={styles['feature-item'] + ' ' + styles.middle}>
            <div className="icon"><i className="fa-solid fa-user-tie"></i></div>
            <h2>Expert Opinions</h2>
            <p>Professional perspectives from industry leaders and experienced real estate professionals.</p>
        </div>
        <div className={styles['feature-item']}>
            <div className={styles.icon}><i className="fa-solid fa-dollar-sign"></i></div>
            <h2>Investment Tips</h2>
            <p>Strategic advice and proven methods to maximize your real estate investment potential.</p>
        </div>
    </section>
    
    <section className={styles['background-section']}>
        <h1>Research and Data</h1>
        <p>Make smarter property decisions with insights backed by real estate expertise. 
            From housing market trends and neighborhood growth patterns to rental forecasts and investment analysis, our research gives you the 
            knowledge you need to stay ahead in the property market.</p>
        <div className={styles['button-group']}>
            <button className={styles.btn + ' ' + styles['btn-blue']}>Get Started</button>
            <button className={styles.btn + ' ' + styles['btn-transparent']}>Learn More</button>
        </div>
    </section>
    <section className={styles['flex-cards']}>
        <div className={styles.card + ' ' + styles.first}>
            <p>Residential</p>
            <h1>Breaking Down Proposed Property Tax Changes</h1>
            <div className={styles['button-container']}>
                <button>RESEDENTIAL RESEARCH</button>
                <button>TAX UPDATES</button>
            </div>
            <div className={styles['text-box']}>
                <h2>Recent discussions have introduced potential tax adjustments that could impact homebuyers and investors. 
                    Here's what you need to know.</h2>
                <a href="#" className={styles['read-more']}>Read More</a>
            </div>
        </div>
        <div className={styles.card + ' ' + styles.second}>
            <p>Commercial Investment</p>
            <h1>Market in Minutes: City Property Investment Watch</h1>
            <div className={styles['button-container']}>
                <button>COMMERCIAL REAL ESTATE</button>
                <button>OFFICE MARKET</button>
            </div>
            <div className={styles['text-box']}>
                <h2>Strong activity continues in the commercial property sector, with major deals pushing total investment above projected levels.</h2>
                <a href="#" className={styles['read-more']}>Read More</a>
            </div>
        </div>
    </section>
    
    <section className={styles['flex-cards-hover']}>
        <div className={styles['card-hover']} style={{backgroundImage: "url('/images/IAO/card3.avif')"}}>
            <p>RESIDENTIAL</p>
            <h1>UK Housing Market Update - H1 2025</h1>
            <p>First-time buyer activity rises despite higher borrowing costs, supported by government-backed schemes.</p>
            <div className={styles['button-container']}>
                <button>HOUSING MARKET</button>
                <button>RESIDENTIAL</button>
            </div>
            <div className={styles['hover-overlay']}>
                <h2>Market Insights</h2>
                <p><strong>Comprehensive market analysis for informed decisions</strong></p>
                <p>Get detailed insights into current market trends and future projections.</p>
                <div className={styles['hover-buttons']}>
                    <a href="#" className={styles['btn-white']}>Read More</a>
                    <a href="#" className={styles['btn-black']}>Download PDF</a>
                </div>
            </div>
        </div>
        <div className={styles['card-hover']} style={{backgroundImage: "url('/images/IAO/card6.avif')"}} >
            <p>INDUSTRIAL</p>
            <h1>UK Industrial & Logistics Market Update – H1 2025</h1>
            <p>Warehouse demand surges as e-commerce and supply chain expansion reshape the industrial property market.</p>
            <div className={styles['button-container']}>
                <button>REAL ESTATE</button>
                <button>RESIDENTIAL</button>
            </div>
            <div className={styles['hover-overlay']}>
                <h2>Logistics Insights</h2>
                <p><strong>Data-driven research on warehouse and distribution trends</strong></p>
                <p>Gain a clear understanding of industrial property performance and future development opportunities.</p>
                <div class={styles['hover-buttons']}>
                    <a href="#" className={styles['btn-white']}>View Report</a>
                    <a href="#" className={styles['btn-black']}>Download Analysis</a>
                </div>
            </div>
        </div>
        <div className={styles['card-hover']} style={{backgroundImage: "url('/images/IAO/card4.avif')"}}>
            <p>COMMERCIAL</p>
            <h1>Market in Minutes: UK Office Space - Summer 2025</h1>
            <p>Demand for Grade A offices remains strong, while secondary stock faces higher vacancy rates.</p>
            <div className={styles['button-container']}>
                <button>OFFICE MARKET </button>
                <button>COMMERCIAL PROPERTY</button>
            </div>
            <div className={styles['hover-overlay']}>
                <h2>Investment Strategies</h2>
                <p><strong>Expert guidance for property investment success</strong></p>
                <p>Learn proven strategies to maximize your real estate investment returns.</p>
                <div className={styles['hover-buttons']}>
                    <a href="#" className={styles['btn-white']}>Read More</a>
                    <a href="#" className={styles['btn-black']}>Download PDF</a>
                </div>
            </div>
        </div>
        <div className={styles['card-hover']} style={{backgroundImage: "url('/images/IAO/card5.webp')"}}>
            <p>INVESTMENT</p>
            <h1>Changes to Real Estate Investment Rules - 2025</h1>
            <p>New investment regulations reshape buyer strategies, with overseas investors adapting to tax reforms.</p>
            <div className={styles['button-container']}>
                <button>COMMERCIAL MARKET</button>
                <button>OUTLOOK</button>
            </div>
            <div className={styles['hover-overlay']}>
                <h2>Commercial Outlook</h2>
                <p><strong>Future of commercial real estate markets</strong></p>
                <p>Discover opportunities and challenges in the commercial property sector.</p>
                <div className={styles['hover-buttons']}>
                    <a href="#" className={styles['btn-white']}>Read More</a>
                    <a href="#" className={styles['btn-black']}>Download PDF</a>
                </div>
            </div>
        </div>
    </section>
    
    <section className={styles['white-cards-section']}>
        <h1>Latest Market Updates</h1>
        <div className={styles['white-cards']}>
            <div className={styles['white-card']}>
                <p className={styles['card-category']}>Market Report</p>
                <p className={styles['card-description']}>Comprehensive analysis of current housing market trends and price movements across major metropolitan areas.</p>
                <a href="#" className={styles['read-more']}>Read More</a>
            </div>
            <div className={styles['white-card']}>
                <p className={styles['card-category']}>Investment Guide</p>
                <p className={styles['card-description']}>Strategic insights for property investors looking to maximize returns in today's competitive market environment.</p>
                <a href="#" className={styles['read-more']}>Read More</a>
            </div>
            <div className={styles['white-card']}>
                <p className={styles['card-category']}>Policy Update</p>
                <p className={styles['card-description']}>Latest regulatory changes affecting real estate transactions and their impact on buyers and sellers.</p>
                <a href="#" className={styles['read-more']}>Read More</a>
            </div>
            <div className={styles['white-card']}>
                <p className={styles['card-category']}>Economic Outlook</p>
                <p className={styles['card-description']}>Economic indicators and forecasts that influence property values and investment opportunities.</p>
                <a href="#" className={styles['read-more']}>Read More</a>
            </div>
        </div>
        <button className={styles['center-btn']}>View All Updates</button>
    </section>
    
    <section className={styles['background-section-2']}>
        <h1>Expert Property Consultation</h1>
        <p>Connect with our experienced real estate professionals for personalized advice and strategic guidance. 
            Whether you're a first-time buyer or seasoned investor, our experts provide tailored solutions to help you navigate 
            the complex property market with confidence.</p>
        <button className={styles['btn-blue'] + ' ' + styles['btn']}>Get Started</button>
    </section>
    <section className={styles['card-grid']}>
        <div className={styles.grid}>
            <img src="/images/IAO/grid1.avif" alt="Rural.img"/>
            <p>RURAL</p>
            <p>How soil movement impacts rural homes and farmland investments, 
                and what buyers should look out for.
            </p>
            <div className={styles['grid-buttons']}>
                <button className={styles['grid-btn']}>Read More</button>
                <button className={styles['grid-btn']}>Download</button>
            </div>
        </div>
        <div className={styles.grid}>
            <img src="/images/IAO/grid2.avif" alt="Rural.img"/>
            <p>RURAL</p>
            <p>Why lakes, rivers, and boreholes can increase land value and influence rural property demand.
            </p>
            <div className={styles['grid-buttons']}>
                <button className={styles['grid-btn']}>Read More</button>
                <button className={styles['grid-btn']}>Download</button>
            </div>
        </div>
        <div className={styles.grid}>
            <img src="/images/IAO/grid3.avif" alt="residential.img"/>
            <p>RESIDENTIAL LETTINGS</p>
            <p>A closer look at high-end tenants and the demand for prime residential rentals.
            </p>
            <div className={styles['grid-buttons']}>
                <button className={styles['grid-btn']}>Read More</button>
                <button className={styles['grid-btn']}>Download</button>
            </div>
        </div>
        <div className={styles.grid}>
            <img src="/images/IAO/grid4.avif" alt="energy.img"/>
            <p>ENERGY & SUSTAINABILITY</p>
            <p>How renewable energy projects add value to housing estates and commercial properties.
            </p>
            <div className={styles['grid-buttons']}>
                <button className={styles['grid-btn']}>Read More</button>
                <button className={styles['grid-btn']}>Download</button>
            </div>
        </div>
        <div className={styles.grid}>
            <img src="/images/IAO/grid5.avif" alt="intl.img"/>
            <p>INTERNATIONAL PROPERTY</p>
            <p>What overseas buyers need to know before investing in coastal or urban properties.
            </p>
            <div className={styles['grid-buttons']}>
                <button className={styles['grid-btn']}>Read More</button>
                <button className={styles['grid-btn']}>Download</button>
            </div>
        </div>
        <div className={styles.grid}>
            <img src="/images/IAO/grid6.avif" alt="plan.img"/>
            <p>PLANNING & DEVELOPMENT</p>
            <p>How government policies and city planning affect property values and housing supply.
            </p>
            <div className={styles['grid-buttons']}>
                <button className={styles['grid-btn']}>Read More</button>
                <button className={styles['grid-btn']}>Download</button>
            </div>
        </div>
        <div className={styles.grid}>
            <img src="/images/IAO/grid7.avif" alt="office.img"/>
            <p>OFFICES</p>
            <p>Secure rental income and evolving workplace needs keep offices attractive for investors.
            </p>
            <div className={styles['grid-buttons']}>
                <button className={styles['grid-btn']}>Read More</button>
                <button className={styles['grid-btn']}>Download</button>
            </div>
        </div>
        <div className={styles.grid}>
            <img src="/images/IAO/grid8.avif" alt="development.img"/>
            <p>PLANNING & DEVELOPMENT</p>
            <p>Why proper land surveys and investigations are crucial before building.
            </p>
            <div className={styles['grid-buttons']}>
                <button className={styles['grid-btn']}>Read More</button>
                <button className={styles['grid-btn']}>Download</button>
            </div>
        </div>
        <button className={styles['center-btn']}>View More Articles</button>
    </section>
    
    <section className={styles['background-section-3']}>
        <h1>Stay Ahead of Market Trends</h1>
        <p>Subscribe to our newsletter and receive exclusive market insights, investment opportunities, and expert analysis 
            delivered directly to your inbox. Join thousands of property professionals who trust our research.</p>
        <button className={styles['btn'] + ' ' + styles['btn-blue']}>Subscribe Now</button>
    </section>
    
    <section className={styles['info-features']}>
        <div className={styles['info-item']}>
            <p>MARKET INSIGHTS</p>
            <h1>Understanding Regional Property Variations and Market Dynamics Across Different Areas</h1>
            <a href="#" className={styles['read-more']}>Read More</a>
        </div>
        <div className={styles['info-item']}>
            <p>INVESTMENT STRATEGY</p>
            <h1>Building a Diversified Property Portfolio for Long-term Financial Growth and Stability</h1>
            <a href="#" className={styles['read-more']}>Read More</a>
        </div>
        <div className={styles['info-item']}>
            <p>MARKET TRENDS</p>
            <h1>The Future of Sustainable Real Estate Development and Environmental Impact</h1>
            <a href="#" className={styles['read-more']}>Read More</a>
        </div>
    </section>
    
    <section className={styles['background-section-4']}>
        <h1>Transform Your Property Investment Journey</h1>
        <p>Join our exclusive community of successful property investors and gain access to premium market intelligence, 
            exclusive deals, and personalized investment strategies that deliver exceptional returns.</p>
        <button className={styles['btn'] + ' ' + styles['btn-blue']}>Join Now</button>
    </section>
    </>
  )
}

export default IAO