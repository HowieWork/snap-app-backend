const { v4: uuidv4 } = require('uuid');

const HttpError = require('../models/http-error');

let DUMMY_SNAPS = [
  {
    id: 's1',
    title: 'Guggenheim',
    description:
      'The unique architecture of the space, with its spiral ramp riding to a domed skylight, continues to thrill visitors and provide a unique forum.',
    imageUrl:
      'https://images.unsplash.com/photo-1526743971139-a05541356e8d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80',
    address: '1071 5th Ave, New York',
    location: {
      lat: 40.7829796,
      lng: -73.9611593,
    },
    creator: 'u1',
  },
  {
    id: 's2',
    title: 'London Bridge',
    description:
      'A monument to modernism, the unique architecture of the space, with its spiral ramp riding to a domed skylight, continues to thrill visitors and provide a unique forum for the presentation of contemporary art.',
    imageUrl:
      'https://images.unsplash.com/photo-1522092372459-dff01028d904?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    address: '1071 5th Ave, London',
    location: {
      lat: 40.7829796,
      lng: -73.9611593,
    },
    creator: 'u1',
  },
  {
    id: 's3',
    title: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world!',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
    address: '20 W 34th St, New York, NY 10001',
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: 'u2',
  },
];

const getSnapBySnapId = (req, res, next) => {
  const snapId = req.params.sid;
  const snap = DUMMY_SNAPS.find((snap) => snap.id === snapId);
  if (!snap) {
    return next(
      new HttpError('Could not find the snap for the provided id.', 404)
    );
  }
  res.json({ snap });
};

const getSnapsByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const snaps = DUMMY_SNAPS.filter((snap) => snap.creator === userId);
  if (!snaps || snaps.length === 0) {
    return next(
      new HttpError('Could not find snaps for the provided user id.', 404)
    );
  }
  res.json({ snaps });
};

const createSnap = (req, res, next) => {
  console.log(req.body);
  const { title, description, imageUrl, address, location, creator } = req.body;
  const createdSnap = {
    id: uuidv4(),
    title,
    description,
    imageUrl,
    address,
    location,
    creator,
  };
  DUMMY_SNAPS.push(createdSnap);
  res.status(201).json({ snap: createSnap });
};

const updateSnap = (req, res, next) => {
  const { title, description } = req.body;
  const snapId = req.params.sid;
  // MAKE A COPY
  const snap = { ...DUMMY_SNAPS.find((snap) => snap.id === snapId) };
  const snapIndex = DUMMY_SNAPS.findIndex((snap) => snap.id === snapId);
  snap.title = title;
  snap.description = description;

  DUMMY_SNAPS[snapIndex] = snap;

  res.status(200).json({ snap });
};

const deleteSnap = (req, res, next) => {
  const snapId = req.params.sid;

  DUMMY_SNAPS = DUMMY_SNAPS.filter((snap) => snap.id !== snapId);

  res.status(200).json({ message: 'You have successfully deleted the snap.' });
};

exports.getSnapBySnapId = getSnapBySnapId;
exports.getSnapsByUserId = getSnapsByUserId;
exports.createSnap = createSnap;
exports.updateSnap = updateSnap;
exports.deleteSnap = deleteSnap;
