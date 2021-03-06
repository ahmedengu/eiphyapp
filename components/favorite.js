import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import firebase, { db } from '../lib/firebase';

const Favorite = ({ id }) => {
  const [user, setUser] = useState(null);
  const [alreadyFav, setAlreadyFav] = useState(false);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user'));
    setUser(localUser);
    setAlreadyFav(localUser && localUser.favorites && localUser.favorites[id]);
  }, []);

  if (alreadyFav) {
    return (
      <div className="favorite">
        <button
          disabled={disabled}
          type="button"
          className="fa fa-heart"
          onClick={() => {
            setDisabled(true);
            db.collection('users').doc(user.uid).collection('favorites').doc(id)
              .delete()
              .then(() => {
                const newUser = { favorites: { [id]: null }, ...user };
                localStorage.setItem('user', JSON.stringify(newUser));

                setAlreadyFav(false);
                setDisabled(false);
              })
              .catch((e) => {
                setDisabled(false);
                console.error(e);
              });
          }}
        >
          Unfavorite
        </button>
      </div>
    );
  }
  return (
    <div className="favorite">
      <button
        disabled={disabled || alreadyFav}
        type="button"
        className="fa fa-heart"
        onClick={() => {
          if (!user) {
            document.getElementsByClassName('login')[0].click();
            return;
          }
          setDisabled(true);
          db.collection('users').doc(user.uid).collection('favorites').doc(id)
            .set({ createdAt: firebase.firestore.FieldValue.serverTimestamp() })
            .then(() => {
              const newUser = { favorites: { [id]: { createdAt: new Date() } }, ...user };
              localStorage.setItem('user', JSON.stringify(newUser));

              setAlreadyFav(true);
              setDisabled(false);
            })
            .catch((e) => {
              setDisabled(false);
              console.error(e);
            });
        }}
      >
        Favorite
      </button>
    </div>
  );
};

Favorite.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Favorite;
