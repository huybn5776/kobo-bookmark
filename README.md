# Kobo bookmark

Read bookmarks from `KoboReader.sqlite` that under readers' storage, then make use of those.

## Main features

- Export to Notion
- Export as text and Markdown format.
- Create highlight image for sharing.
- Create a share link of highlights with Dropbox, no account register needed.



## Implementation detail

This is a static website that didn't use any database. All user information is stored in user's browser.

As long as Notion and Dropbox didn't change their API, this website should still work. I don't want to manage a database, and user didn't need to care about their preferences being watched by someone else.

### Data source

Under kobo reader's storage, there is a hidden folder call `.kobo`, that contains two sqlite files.

- `BookReader.sqlite`, that is encrypted; currently I didn't find any way to decrypt it.
- `KoboReader.sqlite`, not encrypted; maybe this db is open for all plugins to use? We can read book info and bookmarks from here.

Kobo didn't document anything about `KoboReader.sqlite`, but it is not difficult to find its data structure, as long as I didn't misunderstand it.

Data parse related logic can be found in `book.repository.ts` under this repository. The mainly used table is:

- content: store information about book and book chapters.
- Bookmark: bookmarks, as its name.

### Notion integration

The Notion may look powerful, but its API is very limited.

The main flow of export a book's bookmarks to Notion is:

- **Archive** original page (a.k.a. remove page).
- **Create** new page.
- **Insert** blocks to page, one bookmark is represented by three blocks (chapter, content, separator), if blocks are more than 100, we need to call API some more times.

And there is no way to **Update** page content, yes, it is allowed to update a block content, but it didn't provide an API to update the order of page's blocks, or insert new block between blocks.

In case the last exported bookmarks on Notion page are:

- A1
- B1
- C1

And what if we want to insert **B2** between **B1** and **C1**? Notion didn't provide such API to insert block at position, nether than re-order blocks of the page. It can only insert block at the end of the page.

So, that is why I decide to remove the original page and recreate a new page for it.

### Dropbox bookmarks sharing

To share content without using a database, it must have somewhere else to store it. Using Dropbox API, we can store user preference on it for syncing between multiple devices (by store a json file into the application folder). And we can also create a share link of that json file to allow others to fetch that file.


The Flow of create bookmark share link is easy:

- Make a copy of bookmarks, remove unnecessary information about it (such as timestamp).
- serialize it to json file, using Dropbox's `/files/upload` API to upload it to application folder.
- Create a share link of that file.
- Compose a bookmarks link from Dropbox share link.

To fetch shared bookmarks

- Decode Dropbox share link from bookmark share link.
- Fetch that file by adding url query parameter `dl=1`, that allow us to download that file directly.
- To bypass CORS issue, the download url is proxy by this website using `http-proxy-middleware` node package.

### Find book cover image

If the book is bough from kobo store, it will have `imageId` on `content` table. We can interpolate it with `https://cdn.kobo.com/book-images/${imageId}/-.jpg` to compose that image url.

If the book is sideloaded, find that book from

- Rakuten mart: contains only the books that sell on Japan's Rakuten mart.
- Google Books: contains almost all books.

By

- ISBN, if available
- title and author

Then use the best match book's thumbnail as cover image.

Whatever the image source is, it is all required to proxy that url to bypass CORS issue, to allow Notion to use that image, and allow us to create a bookmark card (that may need to "fetch" that image). The proxy using here is [corsproxy.io](https://corsproxy.io/), that is free, and is available most of the time.



## Run locally

To run this project locally, run `dev` script on root `package.json`, It will start both website and api server.

```bash
npm run dev
```

Example `.env` file:

```env
[/server/.env]
NOTION_CLIENT_ID=[GUID]
NOTION_CLIENT_SECRET=secret_*

[/client/.env]
VITE_NOTION_CLIENT_ID=06dad8e7-2b6c-49f4-b4c4-ce12427e7458
VITE_RAKUTEN_APPLICATION_ID=[number]
VITE_RAKUTEN_OPENAPI_APPLICATION_ID=[guid]
VITE_RAKUTEN_OPENAPI_ACCESS_KEY=pk_*
VITE_DROPBOX_CLIENT_ID=[string]
VITE_DROPBOX_CLIENT_SECRET=[string]
```
