import CountUp from "react-countup";
import "./Statistics.css"; // Import the CSS file
import { useInView } from "react-intersection-observer";

export function Statistics() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  return (
    <section ref={ref} className="statistics-container">
      <div className="statistics-header">
        <h2>Our Impact</h2>
        <p>Here are the numbers showing the difference we're making!</p>
      </div>

      <div className="statistics-content">
        <div className="stat-item">
          <div className="stat-number">
            {inView && <CountUp end={1000} duration={3} />}+
          </div>
          <div className="stat-description">Complaints Resolved</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">
            {inView && <CountUp end={500} duration={3} />}+
          </div>
          <div className="stat-description">Registered Users</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">
            {inView && <CountUp end={50} duration={3} />}%
          </div>
          <div className="stat-description">Improvement in Response Time</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">
            {inView && <CountUp end={90} duration={3} />}%
          </div>
          <div className="stat-description">Customer Satisfaction</div>
        </div>
      </div>

      {/* Optional: Add a progress bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: "90%" }}></div>
        </div>
        <div className="progress-bar-label">90% of complaints resolved on time</div>
      </div>
    </section>
  );
}