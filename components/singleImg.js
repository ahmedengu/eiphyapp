import React from 'react';
import PropTypes from 'prop-types';

const SingleImg = ({ img }) => (
  <div>
    <div><img src={img.url} alt="" /></div>
  </div>
);

SingleImg.defaultProps = {
  img: {},
};

SingleImg.propTypes = {
  img: PropTypes.object,
};

export default SingleImg;
