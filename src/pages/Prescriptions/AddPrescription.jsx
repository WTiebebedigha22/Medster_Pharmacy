import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPrescription,
  faUpload,
  faUserMd,
  faCalendarAlt,
  faStethoscope,
  faFileMedical,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faClipboardList,
  faCamera,
  faTimes,
  faSpinner,
  faClock,
  faEnvelope,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./AddPrescription.module.css";

const AddPrescription = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [prescriptionDate, setPrescriptionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a valid image (JPEG, PNG) or PDF file.");
      return;
    }

    if (selectedFile.size > maxSize) {
      setError("File size must be less than 10MB.");
      return;
    }

    setError(null);
    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please upload your prescription file.");
      return;
    }

    setSubmitting(true);

    try {
      // Simulate upload — replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitSuccess(true);
    } catch {
      setError("Failed to upload prescription. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h1>Prescription Submitted!</h1>
            <p>
              Your prescription has been received successfully. Our pharmacy team
              will review it shortly and notify you once it's processed.
            </p>
            <div className={styles.successInfo}>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faFileMedical} />
                <span>Reference: MED-{Date.now().toString(36).toUpperCase()}</span>
              </div>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faClock} />
                <span>Estimated review time: 1-2 hours</span>
              </div>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faEnvelope} />
                <span>You'll receive a notification once processed</span>
              </div>
            </div>
            <div className={styles.successActions}>
              <button className={styles.btnPrimary} onClick={() => navigate("/prescriptions")}>
                View My Prescriptions
              </button>
              <button className={styles.btnOutline} onClick={() => navigate("/shop")}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link to="/">Home</Link>
        <span className={styles.separator}>›</span>
        <Link to="/prescriptions">Prescriptions</Link>
        <span className={styles.separator}>›</span>
        <span className={styles.current}>Add Prescription</span>
      </div>

      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div className={styles.headerIcon}>
              <FontAwesomeIcon icon={faPrescription} />
            </div>
            <div>
              <h1>Upload Prescription</h1>
              <p>
                Upload your prescription and our licensed pharmacists will process
                your order. Ensure all details are clearly visible.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Prescription Upload */}
            <div className={styles.section}>
              <h2>
                <FontAwesomeIcon icon={faUpload} />
                Upload Prescription
              </h2>

              <div
                className={`${styles.dropZone} ${dragActive ? styles.dragActive : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("prescriptionFile")?.click()}
              >
                {file && preview ? (
                  <div className={styles.previewContainer}>
                    <img src={preview} alt="Prescription preview" className={styles.preview} />
                    <button type="button" className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <p className={styles.fileName}>{file.name}</p>
                  </div>
                ) : file && !preview ? (
                  <div className={styles.fileInfo}>
                    <FontAwesomeIcon icon={faFileMedical} className={styles.fileIcon} />
                    <p>{file.name}</p>
                    <button type="button" className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                      <FontAwesomeIcon icon={faTimes} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className={styles.dropContent}>
                    <FontAwesomeIcon icon={faCamera} className={styles.dropIcon} />
                    <p className={styles.dropText}>
                      <strong>Click to upload</strong> or drag and drop
                    </p>
                    <p className={styles.dropHint}>
                      JPEG, PNG, or PDF (max 10MB)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  id="prescriptionFile"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
              </div>
            </div>

            {/* Prescription Details */}
            <div className={styles.section}>
              <h2>
                <FontAwesomeIcon icon={faClipboardList} />
                Prescription Details
              </h2>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>
                    <FontAwesomeIcon icon={faUserMd} />
                    Doctor's Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter doctor's full name"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    Prescription Date
                  </label>
                  <input
                    type="date"
                    value={prescriptionDate}
                    onChange={(e) => setPrescriptionDate(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>
                  <FontAwesomeIcon icon={faStethoscope} />
                  Additional Notes (Optional)
                </label>
                <textarea
                  placeholder="Any special instructions or notes for the pharmacist..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={styles.textarea}
                  rows={4}
                />
              </div>
            </div>

            {/* Important Notice */}
            <div className={styles.notice}>
              <FontAwesomeIcon icon={faInfoCircle} />
              <div>
                <strong>Important:</strong> By submitting this prescription, you
                confirm that it is valid and issued by a licensed healthcare
                professional. Medster Pharmacy will verify the prescription
                before processing.
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className={styles.errorBox}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Uploading...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} />
                  Upload Prescription
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar Info */}
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <h3>Prescription Guidelines</h3>
            <ul>
              <li>Prescription must be clearly legible</li>
              <li>Include patient name and date</li>
              <li>Doctor's signature required</li>
              <li>Valid for 6 months from date issued</li>
              <li>Controlled substances have special requirements</li>
            </ul>
          </div>

          <div className={styles.sideCard}>
            <h3>Processing Time</h3>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDot}></span>
                <div>
                  <strong>Review</strong>
                  <p>1-2 hours</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDot}></span>
                <div>
                  <strong>Verification</strong>
                  <p>2-4 hours</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <span className={styles.timelineDot}></span>
                <div>
                  <strong>Ready for Pickup/Delivery</strong>
                  <p>Same day (if ordered before 2PM)</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sideCard}>
            <h3>Need Help?</h3>
            <p>Contact our pharmacy team for assistance with your prescription.</p>
            <Link to="/contact-us" className={styles.helpLink}>
              Contact Support <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AddPrescription;

