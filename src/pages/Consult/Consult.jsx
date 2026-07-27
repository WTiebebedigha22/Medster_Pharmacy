import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserMd,
  faVideo,
  faCalendarCheck,
  faClock,
  faStethoscope,
  faPhone,
  faCommentMedical,
  faArrowRight,
  faCheckCircle,
  faStar,
  faShieldAlt,
  faPrescription,
  faPills,
  faHeartbeat,
  faBaby,
  faLungs,
  faBrain,
  faBone,
  faSyringe,
  faFlask,
  faNotesMedical,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Consult.module.css";

const specialties = [
  { icon: faHeartbeat, name: "Cardiology", desc: "Heart health & blood pressure" },
  { icon: faLungs, name: "Respiratory", desc: "Asthma, allergies & lung health" },
  { icon: faBrain, name: "Neurology", desc: "Headaches, sleep & nerve health" },
  { icon: faBone, name: "Orthopedics", desc: "Joint pain & bone health" },
  { icon: faBaby, name: "Pediatrics", desc: "Children's health & wellness" },
  { icon: faStethoscope, name: "General Medicine", desc: "General health concerns" },
  { icon: faPrescription, name: "Pharmacy Consult", desc: "Medication advice & refills" },
  { icon: faSyringe, name: "Immunization", desc: "Vaccines & preventive care" },
];

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    rating: 4.9,
    reviews: 234,
    image: "/images/doctors/doctor1.jpg",
    available: true,
    nextSlot: "Today, 2:00 PM",
    experience: "12 years",
    bio: "Specializing in preventive cardiology and hypertension management.",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "General Medicine",
    rating: 4.8,
    reviews: 189,
    image: "/images/doctors/doctor2.jpg",
    available: true,
    nextSlot: "Today, 3:30 PM",
    experience: "10 years",
    bio: "Experienced in family medicine and chronic disease management.",
  },
  {
    id: 3,
    name: "Dr. Emily Okonkwo",
    specialty: "Pediatrics",
    rating: 4.9,
    reviews: 312,
    image: "/images/doctors/doctor3.jpg",
    available: true,
    nextSlot: "Tomorrow, 9:00 AM",
    experience: "8 years",
    bio: "Passionate about children's health and developmental care.",
  },
  {
    id: 4,
    name: "Dr. James Adeleke",
    specialty: "Respiratory",
    rating: 4.7,
    reviews: 156,
    image: "/images/doctors/doctor4.jpg",
    available: false,
    nextSlot: "Tomorrow, 11:00 AM",
    experience: "15 years",
    bio: "Expert in asthma management and respiratory therapy.",
  },
];

const Consult = () => {
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingType, setBookingType] = useState("video");
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  const handleBookConsultation = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBooking(true);
    setBooked(false);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSubmitting(false);
    setBooked(true);
  };

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>Online Consultation</span>
            <h1>Talk to a Doctor <br />From the Comfort of Your Home</h1>
            <p>
              Connect with licensed healthcare professionals via video call,
              phone, or chat. Get medical advice, prescriptions, and peace of
              mind — without leaving your home.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.statNumber}>50+</span>
                <span>Licensed Doctors</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.statNumber}>15min</span>
                <span>Average Wait Time</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.statNumber}>98%</span>
                <span>Satisfaction Rate</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.heroImagePlaceholder}>
              <FontAwesomeIcon icon={faUserMd} />
              <p>Doctor Consultation</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionContainer}>
          <h2>How It Works</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <FontAwesomeIcon icon={faUserMd} />
              <h3>Choose a Doctor</h3>
              <p>Browse our network of licensed doctors and select the right specialist.</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <FontAwesomeIcon icon={faCalendarCheck} />
              <h3>Book a Slot</h3>
              <p>Pick a convenient time for your consultation — video, phone, or chat.</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <FontAwesomeIcon icon={faVideo} />
              <h3>Get Consulted</h3>
              <p>Connect with your doctor and discuss your health concerns privately.</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <FontAwesomeIcon icon={faPrescription} />
              <h3>Get Prescription</h3>
              <p>Receive e-prescriptions sent directly to Medster Pharmacy for fulfillment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className={styles.specialties}>
        <div className={styles.sectionContainer}>
          <h2>Browse by Specialty</h2>
          <p>Find the right specialist for your health needs</p>
          <div className={styles.specialtiesGrid}>
            {specialties.map((spec, index) => (
              <div
                key={index}
                className={`${styles.specialtyCard} ${selectedSpecialty === spec.name ? styles.active : ""}`}
                onClick={() => setSelectedSpecialty(spec.name)}
              >
                <FontAwesomeIcon icon={spec.icon} />
                <h4>{spec.name}</h4>
                <p>{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Doctors */}
      <section className={styles.doctors}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>Available Doctors</h2>
            <p>Currently available for consultation</p>
          </div>
          <div className={styles.doctorsGrid}>
            {doctors.map((doctor) => (
              <div key={doctor.id} className={styles.doctorCard}>
                <div className={styles.doctorImage}>
                  <div className={styles.doctorAvatar}>
                    <FontAwesomeIcon icon={faUserMd} />
                  </div>
                  {doctor.available && <span className={styles.availableBadge}>Available</span>}
                </div>
                <div className={styles.doctorInfo}>
                  <h3>{doctor.name}</h3>
                  <p className={styles.specialty}>{doctor.specialty}</p>
                  <div className={styles.doctorRating}>
                    <FontAwesomeIcon icon={faStar} />
                    <span>{doctor.rating}</span>
                    <span>({doctor.reviews} reviews)</span>
                  </div>
                  <p className={styles.experience}>{doctor.experience} experience</p>
                  <p className={styles.bio}>{doctor.bio}</p>
                  {doctor.available && (
                    <p className={styles.nextSlot}>
                      <FontAwesomeIcon icon={faClock} />
                      Next: {doctor.nextSlot}
                    </p>
                  )}
                  <button
                    className={styles.bookBtn}
                    onClick={() => handleBookConsultation(doctor)}
                    disabled={!doctor.available}
                  >
                    {doctor.available ? (
                      <>
                        <FontAwesomeIcon icon={faVideo} />
                        Book Consultation
                      </>
                    ) : (
                      "Unavailable"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBooking && selectedDoctor && (
        <div className={styles.modalOverlay} onClick={() => setShowBooking(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {booked ? (
              <div className={styles.bookingSuccess}>
                <div className={styles.successIcon}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <h2>Consultation Booked!</h2>
                <p>Your consultation with {selectedDoctor.name} has been scheduled.</p>
                <div className={styles.bookingDetails}>
                  <p><strong>Doctor:</strong> {selectedDoctor.name}</p>
                  <p><strong>Date:</strong> {bookingDate || "TBD"}</p>
                  <p><strong>Time:</strong> {bookingTime || "TBD"}</p>
                  <p><strong>Type:</strong> {bookingType === "video" ? "Video Call" : bookingType === "phone" ? "Phone Call" : "Chat"}</p>
                </div>
                <p className={styles.successNote}>You'll receive a confirmation email with the meeting link.</p>
                <button className={styles.modalBtn} onClick={() => { setShowBooking(false); navigate("/") }}>
                  Back to Home
                </button>
              </div>
            ) : (
              <>
                <button className={styles.modalClose} onClick={() => setShowBooking(false)}>
                  &times;
                </button>
                <div className={styles.modalHeader}>
                  <div className={styles.modalDoctorInfo}>
                    <div className={styles.modalAvatar}>
                      <FontAwesomeIcon icon={faUserMd} />
                    </div>
                    <div>
                      <h3>{selectedDoctor.name}</h3>
                      <p>{selectedDoctor.specialty}</p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmitBooking} className={styles.bookingForm}>
                  <div className={styles.bookingTypeSelector}>
                    <label>Consultation Type</label>
                    <div className={styles.typeOptions}>
                      <button
                        type="button"
                        className={`${styles.typeOption} ${bookingType === "video" ? styles.active : ""}`}
                        onClick={() => setBookingType("video")}
                      >
                        <FontAwesomeIcon icon={faVideo} />
                        Video Call
                      </button>
                      <button
                        type="button"
                        className={`${styles.typeOption} ${bookingType === "phone" ? styles.active : ""}`}
                        onClick={() => setBookingType("phone")}
                      >
                        <FontAwesomeIcon icon={faPhone} />
                        Phone Call
                      </button>
                      <button
                        type="button"
                        className={`${styles.typeOption} ${bookingType === "chat" ? styles.active : ""}`}
                        onClick={() => setBookingType("chat")}
                      >
                        <FontAwesomeIcon icon={faCommentMedical} />
                        Chat
                      </button>
                    </div>
                  </div>

                  <div className={styles.bookingFields}>
                    <div className={styles.field}>
                      <label>Select Date</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Select Time</label>
                      <select value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} required>
                        <option value="">Choose a time</option>
                        <option value="9:00 AM">9:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="1:00 PM">1:00 PM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>Reason for Consultation (Optional)</label>
                    <textarea
                      placeholder="Briefly describe your symptoms or reason for consultation..."
                      rows={3}
                    />
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? (
                      <><FontAwesomeIcon icon={faSpinner} spin /> Booking...</>
                    ) : (
                      <><FontAwesomeIcon icon={faCalendarCheck} /> Confirm Booking</>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Trust & Safety */}
      <section className={styles.trust}>
        <div className={styles.sectionContainer}>
          <h2>Why Choose Medster Consult</h2>
          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <FontAwesomeIcon icon={faShieldAlt} />
              <h3>Secure & Private</h3>
              <p>HIPAA-compliant platform ensuring your medical data stays confidential.</p>
            </div>
            <div className={styles.trustCard}>
              <FontAwesomeIcon icon={faUserMd} />
              <h3>Licensed Doctors</h3>
              <p>All doctors are verified and licensed by the Medical and Dental Council.</p>
            </div>
            <div className={styles.trustCard}>
              <FontAwesomeIcon icon={faClock} />
              <h3>Fast & Convenient</h3>
              <p>Average wait time of just 15 minutes. No travel, no waiting rooms.</p>
            </div>
            <div className={styles.trustCard}>
              <FontAwesomeIcon icon={faPrescription} />
              <h3>E-Prescriptions</h3>
              <p>Get prescriptions sent directly to Medster Pharmacy for quick fulfillment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Ready to Speak with a Doctor?</h2>
          <p>Book a consultation now and get the care you need from the comfort of your home.</p>
          <button className={styles.ctaBtn} onClick={() => navigate("/shop")}>
            <FontAwesomeIcon icon={faArrowRight} />
            Start Your Consultation
          </button>
        </div>
      </section>
    </div>
  );
};

export default Consult;

