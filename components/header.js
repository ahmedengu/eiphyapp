import React from 'react';
import PropTypes from 'prop-types';
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo.config';
import '../scss/main.scss';

const Header = (props) => (
  <header className="masthead mb-auto">
    <DefaultSeo {...SEO} />
    <div className="inner">
      <h3 className="masthead-brand">HelloNext</h3>
      <nav className="nav nav-masthead justify-content-center" />
    </div>
  </header>

);

Header.propTypes = {

};

export default Header;