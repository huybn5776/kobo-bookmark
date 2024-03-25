<template>
  <div class="page-content home-page">
    <h1>
      <i18n-t keypath="page.home.title" />
    </h1>
    <ul class="home-page-steps">
      <li>
        <i18n-t keypath="page.home.goto_page">
          <router-link :to="{ name: 'import' }">
            <i18n-t keypath="page_name.import" />
          </router-link>
        </i18n-t>
      </li>
      <li>
        <i18n-t keypath="page.home.find_your_file">
          <code>KoboReader.sqlite</code>
          <code>/.kobo/KoboReader.sqlite</code>
        </i18n-t>
      </li>
      <li class="list-level-2">
        <i18n-t keypath="page.home.find_your_file_note" />
      </li>
      <li>
        <i18n-t keypath="page.home.website_resolve">
          <a href="https://books.google.com.tw/">Google Books</a>
          <a href="https://www.rakuten.co.jp/">Rakuten mart</a>
        </i18n-t>
      </li>
      <li>
        <i18n-t keypath="page.home.connect_notion">
          <router-link :to="{ name: 'bookmarks' }">
            <i18n-t keypath="page_name.bookmarks" />
          </router-link>
          <router-link :to="{ name: 'settings' }">
            <i18n-t keypath="page_name.settings" />
          </router-link>
        </i18n-t>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
@import './HomePage';
</style>
