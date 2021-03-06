import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faCross, faRemoveFormat, faTimes,
} from '@fortawesome/free-solid-svg-icons';
import slugify, { slugOptions } from '../../lib/slugify';
import firebase, { db } from '../../lib/firebase';
import Login from '../../components/login';
import Layout from '../../components/layout';

export default function Finalize() {
  const [imgUrl, setImg] = useState('');
  const [keyword, setKeyword] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [user, setUser] = useState(firebase.auth().currentUser);
  const [dimensions, setDimensions] = useState({ img: { width: 600, hieght: 600 }, thumb: { width: 600, hieght: 600 } });
  const router = useRouter();

  firebase.auth().onAuthStateChanged((user) => {
    setUser(user);
  });

  useEffect(() => {
    setImg(localStorage.getItem(process.env.IMG_PREVIEW));
  }, []);

  const onAddTagHandler = (e) => {
    e.preventDefault();

    if (typeof keyword === 'string' && keyword !== '' && keyword.length <= 50 && keywords.length <= 10) {
      const value = keyword.trim().toLowerCase()
        .replace(/\s+/g, ' ').replace(/\s/g, '_');
      if (!keywords.includes(value)) {
        setKeywords((t) => ([
          ...t,
          value,
        ]));
      }

      setKeyword('');
    }
  };

  const onUploadHandler = async (e) => {
    e.preventDefault();
    setDisabled(true);
    if (!user) {
      console.error('Not User');
      return;
    }
    const date = new Date();
    const folder = `${date.getFullYear().toString().substring(2)}${date.getMonth() + 1}${date.getDate()}`;

    const tags = Array.from(new Set(keywords
      .map((keyword) => slugify(keyword, slugOptions))));
    const tagsName = tags.join('_').substring(0, 20).replace(/\s/g, '_');
    const suffix = date.getTime().toString().substring(5);
    const name = `${tagsName}_${suffix}`;

    const blob = await fetch(imgUrl).then((res) => res.blob());
    const fileType = blob.type.split('/')[1];
    const type = fileType === 'gif' ? 'gifs' : 'memes';
    const storage = firebase.storage();
    const img = storage.ref().child(`/${type}/${folder}/${name}.${fileType}`);

    const localUser = JSON.parse(localStorage.getItem('user'));
    img.put(blob, { user: user.uid }).then(() => {
      const url = `https://firebasestorage.googleapis.com/v0/b/eiphyappfinal.appspot.com/o/${type}%2F${folder}%2F${name}.${fileType}?alt=media`;
      const thumb = `https://firebasestorage.googleapis.com/v0/b/eiphyappfinal.appspot.com/o/${type}%2F${folder}%2F${name}_thumb.${fileType}?alt=media`;

      const postData = {
        tags,
        keywords,
        img: {
          url,
          ...dimensions.img,
        },
        thumb: {
          url: thumb,
          ...dimensions.thumb,
        },
        meta: {},
        isPublic: true,
        sourceUrl: '',
        views: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        user: {
          [user.uid]: {
            username: localUser.username,
            displayName: localUser.displayName,
            photoURL: localUser.photoURL,
          },
        },
        type,
      };

      db.collection('posts').add(postData)
        .then((o) => {
          setTimeout(() => {
            const href = `/${type}/${o.id}`;
            fetch(href).then(() => {
              setTimeout(() => {
                router.push(href);
              }, 1000);
            });
          }, 500);
        });
    }).catch((e) => {
      setDisabled(true);
      console.error(e);
    });
  };

  let uploadButton = (
    <button className="upload-btn" disabled={disabled || keywords.length < 3} type="button" onClick={(e) => onUploadHandler(e)}>
      Upload
      Gif
    </button>
  );
  if (!user) {
    uploadButton = <Login />;
  }
  const deleteKeyword = (tag) => () => {
    setKeywords((allKeywords) => allKeywords.filter((t) => t !== tag));
  };

  const imgOnLoad = ({ target: { naturalHeight: height, naturalWidth: width } }) => {
    const imgRatio = Math.min(600 / width, 600 / height);
    const thumbRatio = Math.min(300 / width, 300 / height);

    const thumb = {
      height: Math.round(height * thumbRatio),
      width: Math.round(width * thumbRatio),
    };

    setDimensions({
      img: {
        height: thumb.height >= height ? thumb.height : Math.round(height * imgRatio),
        width: thumb.width >= width ? thumb.width : Math.round(width * imgRatio),
      },
      thumb,
    });
  };

  return (
    <Layout>
      <div className="container text-center">
        <div className="row">
          <div key="img-viewer" className="img-preview">
            <img
              onError={(e) => {
                router.push('/upload');
              }}
              src={imgUrl}
              alt=""
              onLoad={imgOnLoad}
            />
          </div>
          <div key="img-info" className="img-tags">
            <form onSubmit={(e) => onAddTagHandler(e)}>
              <label htmlFor="keywords">
                <input onChange={(e) => setKeyword(e.target.value)} id="keywords" type="text" value={keyword} placeholder="Add at least 3 keywords" />
                <button type="submit" className="" disabled={disabled || keyword.length < 3 || keyword.length > 50 || keywords.length > 10}>
                  <FontAwesomeIcon icon={faPlus} rotation={90} size="2x" color="white" swapOpacity />
                </button>
              </label>
            </form>
            <ul>
              {
                keywords.map((keyword, key) => (
                  <li key={key} className="upload-keyword">
                    <span>
                      {keyword}
                      {' '}
                    </span>
                    <button type="button" onClick={deleteKeyword(keyword)}>
                      <FontAwesomeIcon icon={faTimes} size="2x" color="white" swapOpacity />
                    </button>
                  </li>
                ))
              }
            </ul>
            {uploadButton}
          </div>
        </div>
      </div>
    </Layout>
  );
}
