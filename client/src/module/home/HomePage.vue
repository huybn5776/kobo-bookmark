<template>
  <div class="page-content home-page">
    <h1>Export your bookmarks in steps</h1>
    <ul class="home-page-steps">
      <li>Go to <router-link :to="{ name: 'import' }">Import</router-link> page</li>
      <li>
        Find your <code>KoboReader.sqlite</code> file under kobo reader storage at path
        <code>/.kobo/KoboReader.sqlite</code> and drop it.
      </li>
      <li class="list-level-2">
        If you can't find it due to it is hidden folder, you can still drop entire storage folder there to let website
        find it for you.
      </li>
      <li>
        This website will resolve all highlight withing it, then try to find book's cover image from
        <a href="https://books.google.com.tw/">Google Books</a> and
        <a href="https://www.rakuten.co.jp/">Rakuten mart</a>.
      </li>
      <li>
        If it looks ok at <router-link :to="{ name: 'bookmarks' }">Bookmarks</router-link>, connect your Notion account
        in <router-link :to="{ name: 'settings' }">Settings</router-link> page than go back to export it.
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
@import './HomePage';
</style>
