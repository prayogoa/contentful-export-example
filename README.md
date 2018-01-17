# Contentful Export Example

Use the `contentful-export` module to export entries and assets in a space, denormalized.

## Example
Install [yarn](https://yarnpkg.com/en/docs/install) and run `yarn` to install all dependencies.

You will need your contentful space id and a contentful management token. Look [here](https://www.contentful.com/developers/docs/references/authentication/) for instructions on getting a token.
```
CONTENTFUL_SPACE_ID=<contentful space id> CONTENTFUL_MANAGEMENT_TOKEN=<contentful management token> node index.js
```

This will download all entries and assets for a space. The space information will be stored in a file as a json blob called `raw.json`

Image assets will be stored in a folder called `images.contentful.com`.
Other assets will be stored in a folder called `assets.contentful.com`.
Entries will be saved in a folder called `data`, partitioned according to their content type.

All links in entry fields will be denormalized. If an entry field links to an asset, the field value will be the path to that asset.