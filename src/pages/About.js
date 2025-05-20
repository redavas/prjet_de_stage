import React from 'react';
import { motion } from 'framer-motion';
import '../styles/About.css';

const About = () => {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      name: 'Michael Chen',
      role: 'Head of Product',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      name: 'Emma Wilson',
      role: 'Sustainability Director',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
  ];

  return (
    <div className="about-page">
      <div className="about-header">
        <h1>About EcoShop</h1>
        <p>Our mission is to make sustainable living accessible to everyone</p>
      </div>

      <div className="about-content">
        <section className="mission-section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mission-card"
          >
            <h2>Our Mission</h2>
            <p>
              At EcoShop, we believe in creating a sustainable future through conscious consumerism.
              We curate products that are not only environmentally friendly but also high-quality and
              accessible to everyone. Our goal is to make sustainable living easy and enjoyable.
            </p>
          </motion.div>
        </section>

        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="value-card"
            >
              <i className="fas fa-leaf"></i>
              <h3>Sustainability</h3>
              <p>Committed to reducing environmental impact through eco-friendly practices</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="value-card"
            >
              <i className="fas fa-handshake"></i>
              <h3>Ethical Sourcing</h3>
              <p>Working with suppliers who share our commitment to fair trade and ethical practices</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="value-card"
            >
              <i className="fas fa-heart"></i>
              <h3>Quality</h3>
              <p>Offering products that are built to last and designed with care</p>
            </motion.div>
          </div>
        </section>

        <section className="team-section">
          <h2>Our Team</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="team-card"
              >
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About; 