const spaceExport = require('contentful-export');
const fs = require('fs-extra');
const moment = require('moment');
const _ = require('lodash');

const getAssetUrl = (spaceData, assetId) =>
  spaceData.assets.find((asset) => assetId === asset.sys.id).file.url;

const getEntry = (spaceData, entryId) =>
  spaceData.entries.find((entry) => entryId === entry.sys.id);

const contentType = (entry) =>
  entry.sys.contentType.sys.id;

const fileName = ({ sys: { id, publishedAt } }) =>
  `${moment(publishedAt).format('YYYYY-MM-DD-HHmmss')}_${id}`;

const filePath = entry =>
  `./data/${contentType(entry)}/${fileName(entry)}`;

const flattenLocale = entry => {
  const flattened = _.mapValues(entry.fields, _.property('en-US'));
  return Object.assign(
    { sys: entry.sys },
    flattened
  )
};

const flattenLocales = spaceData =>
  _.mapValues(spaceData, _.method('map', flattenLocale));

const resolveLinks = spaceData => entry =>
  _.mapValues(entry, (field) => {
    if(field) { 
      const sys = field.sys;
      if (sys && sys.type === 'Link') {
        if (sys.linkType === 'Asset') {
          return getAssetUrl(spaceData, sys.id);
        } else if (sys.linkType === 'Entry') {
          return resolveLinks(spaceData)(getEntry(spaceData, sys.id));
        }
      }
    }
    return field;
  });

const denormalize = spaceData =>
  Object.assign(
    {},
    spaceData,
    {
      entries: spaceData.entries.map(resolveLinks(spaceData)),
    }
  );

const saveEntries = spaceData =>
  Promise.all(
    spaceData.entries.map(
      entry => fs.outputJson(
        filePath(entry),
        entry,
        { spaces: 2 }
      )
    )
  );

spaceExport({
  spaceId: process.env.CONTENTFUL_SPACE_ID,
  managementToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  contentOnly: true,
  saveFile: true,
  contentFile: 'raw.json',
  downloadAssets: true,
})
.then(flattenLocales)
.then(denormalize)
.then(saveEntries)
.catch(err => console.error('something went wrong', err));