import React from 'react';
import { Link } from 'react-router-dom';

const IntroSection = () => {
  return (
    <section>
      <h1>Welcome to My Website!</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
        consequat quam vel imperdiet facilisis. Nullam convallis eros id
        scelerisque accumsan.
      </p>
      <Link to="/get-started">
        <button>Get Started</button>
      </Link>
    </section>
  );
};

export default IntroSection;
